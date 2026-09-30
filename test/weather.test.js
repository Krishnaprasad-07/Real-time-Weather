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

const LONDON_PLACE = [{ name: "London", state: "England", country: "GB", lat: 51.5073, lon: -0.1276 }];

// Replaces https.get with a fake upstream; returns the list of requested URLs.
// Geocoding requests get `geo` (London by default); every other request gets `body`.
const stubUpstream = (t, { body, geo = LONDON_PLACE, error, timeout } = {}) => {
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
      const payload = new URL(url).pathname.startsWith("/geo/") ? geo : body;
      response.emit("data", typeof payload === "string" ? payload : JSON.stringify(payload));
      response.emit("end");
    });

    return request;
  });
  return urls;
};

const LONDON = {
  cod: 200,
  name: "London",
  dt: 1759240000,
  coord: { lat: 51.5085, lon: -0.1257 },
  timezone: 3600,
  visibility: 8000,
  rain: { "1h": 0.6 },
  sys: { country: "GB", sunrise: 1759211400, sunset: 1759253700 },
  main: { temp: 10.5, feels_like: 9.2, humidity: 80, pressure: 1012 },
  wind: { speed: 4.1, deg: 250, gust: 7.2 },
  clouds: { all: 75 },
  weather: [{ description: "light rain", icon: "10d" }]
};

const getJson = async (urlPath) => {
  const res = await fetch(baseUrl + urlPath);
  return { status: res.status, body: await res.json() };
};

// Sends the path exactly as given (fetch would normalise "..", "%2e" etc. first).
const rawGet = (urlPath) => new Promise((resolve, reject) => {
  http.get({ port: server.address().port, path: urlPath }, (res) => {
    res.resume();
    resolve(res.statusCode);
  }).on("error", reject);
});

test("returns weather for a city", async (t) => {
  stubUpstream(t, { body: LONDON });
  const { status, body } = await getJson("/weather?city=London");
  assert.strictEqual(status, 200);
  assert.deepStrictEqual(body, {
    city: "London",
    region: "England",
    country: "GB",
    coordinates: { lat: 51.5073, lon: -0.1276 },
    temperature: "10.5 °C",
    feelsLike: "9.2 °C",
    humidity: "80 %",
    wind: "4.1 m/s",
    windGust: "7.2 m/s",
    windDirection: 250,
    pressure: "1012 hPa",
    visibility: "8 km",
    clouds: "75 %",
    rainLastHour: "0.6 mm",
    condition: "light rain",
    icon: "10d",
    observedAt: 1759240000,
    sunrise: 1759211400,
    sunset: 1759253700,
    timezone: 3600
  });
});

test("leaves out optional values the upstream does not send", async (t) => {
  const { visibility, clouds, ...rest } = LONDON;
  stubUpstream(t, { body: { ...rest, wind: { speed: 1.5 } } });
  const { status, body } = await getJson("/weather?city=London");
  assert.strictEqual(status, 200);
  for (const key of ["windGust", "windDirection", "visibility", "clouds", "snowLastHour"]) {
    assert.ok(!(key in body), key);
  }
  assert.strictEqual(body.wind, "1.5 m/s");
});

test("encodes the city so it cannot inject upstream parameters", async (t) => {
  const urls = stubUpstream(t, { body: LONDON });
  const city = "London&appid=ATTACKER#x";
  await getJson(`/weather?city=${encodeURIComponent(city)}`);
  const [geocode, weather] = urls;
  assert.strictEqual(geocode.pathname, "/geo/1.0/direct");
  assert.strictEqual(geocode.searchParams.get("q"), city);
  assert.deepStrictEqual(geocode.searchParams.getAll("appid"), ["TEST_KEY"]);
  assert.strictEqual(weather.pathname, "/data/2.5/weather");
  assert.strictEqual(weather.searchParams.get("q"), null);
  assert.strictEqual(weather.searchParams.get("units"), "metric");
});

test("looks weather up at the geocoded place and reports that place's name", async (t) => {
  // The weather endpoint names the nearest station area; the page should still say Dublin, Ireland.
  const urls = stubUpstream(t, {
    geo: [{ name: "Dublin", country: "IE", lat: 53.3494, lon: -6.2606 }],
    body: { ...LONDON, name: "Mountjoy", sys: { ...LONDON.sys, country: "IE" } }
  });
  const { status, body } = await getJson("/weather?city=Dublin");
  assert.strictEqual(status, 200);
  assert.strictEqual(body.city, "Dublin");
  assert.strictEqual(body.country, "IE");
  assert.ok(!("region" in body));
  assert.deepStrictEqual(body.coordinates, { lat: 53.3494, lon: -6.2606 });
  assert.strictEqual(urls[1].searchParams.get("lat"), "53.3494");
  assert.strictEqual(urls[1].searchParams.get("lon"), "-6.2606");
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
  assert.strictEqual(await rawGet("//["), 400);
});

test("serves the web interface", async () => {
  const files = {
    "/": "text/html; charset=utf-8",
    "/index.html": "text/html; charset=utf-8",
    "/style.css": "text/css; charset=utf-8",
    "/main.js": "text/javascript; charset=utf-8",
    "/sky.js": "text/javascript; charset=utf-8",
    "/favicon.svg": "image/svg+xml"
  };
  for (const [urlPath, contentType] of Object.entries(files)) {
    const res = await fetch(baseUrl + urlPath);
    assert.strictEqual(res.status, 200, urlPath);
    assert.strictEqual(res.headers.get("content-type"), contentType, urlPath);
    assert.strictEqual(res.headers.get("x-content-type-options"), "nosniff", urlPath);
    await res.arrayBuffer();
  }
});

test("does not serve files outside public/", async () => {
  const attempts = [
    "/../.env", "/%2e%2e/.env", "/..%2f.env", "/..%5c.env", "/.env",
    "/../app.js", "/%2e%2e/package.json", "/..%2fpackage.json", "/..\app.js"
  ];
  for (const urlPath of attempts) {
    assert.strictEqual(await rawGet(urlPath), 404, urlPath);
  }
});

test("returns 404 when the city is not found", async (t) => {
  const urls = stubUpstream(t, { geo: [], body: LONDON });
  const { status, body } = await getJson("/weather?city=Nowhere");
  assert.strictEqual(status, 404);
  assert.deepStrictEqual(body, { message: "City not found" });
  assert.strictEqual(urls.length, 1, "no weather request is made for an unknown city");
});

test("returns 502 when geocoding rejects the request or answers unexpectedly", async (t) => {
  t.mock.method(console, "error", () => {});
  for (const geo of [{ cod: 401, message: "Invalid API key" }, { unexpected: true }]) {
    stubUpstream(t, { geo, body: LONDON });
    const { status } = await getJson("/weather?city=London");
    assert.strictEqual(status, 502, JSON.stringify(geo));
  }
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

// --- Forecast ---------------------------------------------------------------

// 40 three-hourly slots starting 2026-09-30 00:00 UTC, in a city at UTC+5:30 (so local days start at 18:30 UTC).
const FORECAST_START = Date.UTC(2026, 8, 30, 0, 0, 0) / 1000;
const FORECAST = {
  cod: "200",
  city: { name: "Chennai", timezone: 19800 },
  list: Array.from({ length: 40 }, (_, i) => ({
    dt: FORECAST_START + i * 3 * 3600,
    main: { temp: 20 + (i % 8) },
    weather: [{ description: i % 8 === 2 ? "light rain" : "clear sky", icon: i % 8 < 4 ? "01d" : "01n" }],
    pop: i === 2 ? 0.8 : 0.1
  }))
};

test("returns hourly and daily forecast for coordinates", async (t) => {
  const urls = stubUpstream(t, { body: FORECAST });
  const { status, body } = await getJson("/forecast?lat=13.08&lon=80.27");
  assert.strictEqual(status, 200);

  assert.strictEqual(urls[0].pathname, "/data/2.5/forecast");
  assert.strictEqual(urls[0].searchParams.get("lat"), "13.08");
  assert.strictEqual(urls[0].searchParams.get("lon"), "80.27");
  assert.strictEqual(urls[0].searchParams.get("units"), "metric");

  assert.strictEqual(body.timezone, 19800);
  assert.strictEqual(body.hourly.length, 8);
  assert.deepStrictEqual(body.hourly[2], {
    time: FORECAST_START + 6 * 3600,
    temperature: "22 °C",
    condition: "light rain",
    icon: "01d",
    precipitationChance: "80 %"
  });

  // Local (UTC+5:30) dates: slots at 00:00–18:00 UTC are 05:30–23:30 local on the 30th; 21:00 UTC is the 1st.
  // The day's condition comes from the slot nearest local noon (06:00 UTC = 11:30 local).
  assert.strictEqual(body.daily.length, 5);
  assert.deepStrictEqual(body.daily.map((day) => day.date), ["2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"]);
  assert.deepStrictEqual(body.daily[0], {
    date: "2026-09-30",
    high: "26 °C",
    low: "20 °C",
    condition: "light rain",
    icon: "01d",
    precipitationChance: "80 %"
  });
  assert.strictEqual(body.daily[1].high, "27 °C");
  assert.strictEqual(body.daily[1].low, "20 °C");
  assert.ok(body.daily.every((day) => day.icon.endsWith("d")), "daily icons use the day variant");
});

test("rejects missing or out-of-range coordinates", async () => {
  for (const query of ["", "?lat=10", "?lon=10", "?lat=abc&lon=10", "?lat=91&lon=0", "?lat=0&lon=181", "?lat=&lon="]) {
    for (const route of ["/forecast", "/air-quality"]) {
      const { status, body } = await getJson(route + query);
      assert.strictEqual(status, 400, route + query);
      assert.match(body.message, /lat .* lon/, route + query);
    }
  }
});

test("returns 405 for non-GET methods on the new API routes", async () => {
  for (const route of ["/forecast", "/air-quality"]) {
    const res = await fetch(`${baseUrl}${route}?lat=0&lon=0`, { method: "DELETE" });
    assert.strictEqual(res.status, 405, route);
  }
});

test("returns 502 for a forecast with missing fields", async (t) => {
  t.mock.method(console, "error", () => {});
  stubUpstream(t, { body: { cod: "200", city: { timezone: 0 } } });
  const { status } = await getJson("/forecast?lat=1&lon=1");
  assert.strictEqual(status, 502);
});

// --- Air quality ------------------------------------------------------------

test("returns air quality for coordinates", async (t) => {
  const urls = stubUpstream(t, {
    body: {
      coord: { lat: 13.08, lon: 80.27 },
      list: [{
        dt: 1759240000,
        main: { aqi: 3 },
        components: { co: 290.4, no: 0.1, no2: 12.5, o3: 68, so2: 4.3, pm2_5: 21.7, pm10: 35.2, nh3: 1.1 }
      }]
    }
  });
  const { status, body } = await getJson("/air-quality?lat=13.08&lon=80.27");
  assert.strictEqual(status, 200);
  assert.strictEqual(urls[0].pathname, "/data/2.5/air_pollution");
  assert.deepStrictEqual(body, {
    index: 3,
    label: "Moderate",
    components: {
      pm2_5: "21.7 μg/m³",
      pm10: "35.2 μg/m³",
      o3: "68 μg/m³",
      no2: "12.5 μg/m³",
      so2: "4.3 μg/m³",
      co: "290.4 μg/m³"
    }
  });
});

test("returns 502 when the air quality service rejects the request", async (t) => {
  t.mock.method(console, "error", () => {});
  stubUpstream(t, { body: { cod: 401, message: "Invalid API key" } });
  const { status, body } = await getJson("/air-quality?lat=1&lon=1");
  assert.strictEqual(status, 502);
  assert.deepStrictEqual(body, { message: "Weather service error" });
});
