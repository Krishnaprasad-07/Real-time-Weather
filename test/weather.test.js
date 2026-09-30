const { test, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("http");
const https = require("https");
const path = require("path");
const { spawnSync } = require("child_process");
const { EventEmitter } = require("events");

process.env.WEATHER_API_KEY = "TEST_KEY";
const { server } = require("../app");

let baseUrl;

before(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => server.close());

// Replaces https.get with a fake upstream; returns the list of requested URLs.
const stubUpstream = (t, { body, error, timeout } = {}) => {
  const urls = [];
  t.mock.method(https, "get", (url, options, callback) => {
    urls.push(new URL(url));
    const request = new EventEmitter();
    request.destroy = () => {};

    setImmediate(() => {
      if (error) return request.emit("error", error);
      if (timeout) return request.emit("timeout");

      const response = new EventEmitter();
      response.setEncoding = () => {};
      callback(response);
      response.emit("data", typeof body === "string" ? body : JSON.stringify(body));
      response.emit("end");
    });

    return request;
  });
  return urls;
};

const LONDON = {
  cod: 200,
  name: "London",
  main: { temp: 10.5, humidity: 80 },
  weather: [{ description: "light rain" }]
};

const getJson = async (urlPath) => {
  const res = await fetch(baseUrl + urlPath);
  return { status: res.status, body: await res.json() };
};

test("returns weather for a city", async (t) => {
  stubUpstream(t, { body: LONDON });
  const { status, body } = await getJson("/weather?city=London");
  assert.strictEqual(status, 200);
  assert.deepStrictEqual(body, {
    city: "London",
    temperature: "10.5 °C",
    humidity: "80 %",
    condition: "light rain"
  });
});

test("encodes the city so it cannot inject upstream parameters", async (t) => {
  const urls = stubUpstream(t, { body: LONDON });
  const city = "London&appid=ATTACKER#x";
  await getJson(`/weather?city=${encodeURIComponent(city)}`);
  const params = urls[0].searchParams;
  assert.strictEqual(params.get("q"), city);
  assert.deepStrictEqual(params.getAll("appid"), ["TEST_KEY"]);
  assert.strictEqual(params.get("units"), "metric");
});

test("requires a non-blank city", async () => {
  for (const query of ["", "?city=", "?city=%20%20"]) {
    const { status, body } = await getJson(`/weather${query}`);
    assert.strictEqual(status, 400);
    assert.strictEqual(body.message, "City query parameter is required");
  }
});

test("returns 404 for unknown routes", async () => {
  const { status, body } = await getJson("/nope");
  assert.strictEqual(status, 404);
  assert.strictEqual(body.message, "Route not found");
});

test("returns 405 for non-GET methods on /weather", async () => {
  const res = await fetch(`${baseUrl}/weather?city=London`, { method: "POST" });
  assert.strictEqual(res.status, 405);
  assert.strictEqual(res.headers.get("allow"), "GET");
  assert.strictEqual((await res.json()).message, "Method not allowed");
});

test("returns 400 for a URL that cannot be parsed", async () => {
  const status = await new Promise((resolve, reject) => {
    http.get({ port: server.address().port, path: "//[" }, (res) => {
      res.resume();
      resolve(res.statusCode);
    }).on("error", reject);
  });
  assert.strictEqual(status, 400);
});

test("returns 404 when the city is not found", async (t) => {
  stubUpstream(t, { body: { cod: "404", message: "city not found" } });
  const { status, body } = await getJson("/weather?city=Nowhere");
  assert.strictEqual(status, 404);
  assert.deepStrictEqual(body, { message: "City not found", apiMessage: "city not found" });
});

test("returns 502 for other upstream errors such as a bad API key", async (t) => {
  t.mock.method(console, "error", () => {});
  stubUpstream(t, { body: { cod: 401, message: "Invalid API key" } });
  const { status, body } = await getJson("/weather?city=London");
  assert.strictEqual(status, 502);
  assert.deepStrictEqual(body, { message: "Weather service error" });
});

test("survives a non-JSON upstream response", async (t) => {
  t.mock.method(console, "error", () => {});
  stubUpstream(t, { body: "<html>502 Bad Gateway</html>" });
  const { status } = await getJson("/weather?city=London");
  assert.strictEqual(status, 502);
});

test("survives an upstream response with missing fields", async (t) => {
  t.mock.method(console, "error", () => {});
  stubUpstream(t, { body: { cod: 200, name: "London" } });
  const { status } = await getJson("/weather?city=London");
  assert.strictEqual(status, 502);
});

test("returns 503 when the upstream request fails", async (t) => {
  t.mock.method(console, "error", () => {});
  stubUpstream(t, { error: new Error("ECONNRESET") });
  const { status, body } = await getJson("/weather?city=London");
  assert.strictEqual(status, 503);
  assert.strictEqual(body.message, "Weather API request failed");
});

test("returns 504 when the upstream request times out", async (t) => {
  t.mock.method(console, "error", () => {});
  stubUpstream(t, { timeout: true });
  const { status, body } = await getJson("/weather?city=London");
  assert.strictEqual(status, 504);
  assert.strictEqual(body.message, "Weather API timed out");
});

test("refuses to start without an API key", () => {
  const result = spawnSync(process.execPath, [path.join(__dirname, "..", "app.js")], {
    env: { ...process.env, WEATHER_API_KEY: "" },
    encoding: "utf8"
  });
  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /WEATHER_API_KEY is not set/);
});
