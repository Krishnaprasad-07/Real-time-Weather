require("dotenv").config();

const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { getWeather, getForecast, getAirQuality, WeatherError } = require("./utils/weatherManager");

const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = path.join(__dirname, "public");
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml"
};

const sendJson = (res, statusCode, body) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

const readCoordinate = (params, name, limit) => {
  const raw = params.get(name)?.trim();
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) && Math.abs(value) <= limit ? value : null;
};

const requireCoordinates = (params) => {
  const lat = readCoordinate(params, "lat", 90);
  const lon = readCoordinate(params, "lon", 180);
  if (lat === null || lon === null) {
    throw new WeatherError("Valid lat (-90 to 90) and lon (-180 to 180) query parameters are required", 400);
  }
  return [lat, lon];
};

// Each API route reads its query parameters and returns the JSON to send, or throws a WeatherError.
const API_ROUTES = {
  "/weather": (params) => {
    const city = params.get("city")?.trim();
    if (!city) {
      throw new WeatherError("City query parameter is required", 400);
    }
    return getWeather(city);
  },
  "/forecast": (params) => getForecast(...requireCoordinates(params)),
  "/air-quality": (params) => getAirQuality(...requireCoordinates(params))
};

// Serves files from public/ only; anything that resolves outside it, or has an unknown extension, is a 404.
const serveStatic = async (res, pathname) => {
  const filePath = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname);
  const contentType = CONTENT_TYPES[path.extname(filePath)];

  if (!contentType || !filePath.startsWith(PUBLIC_DIR + path.sep)) {
    return sendJson(res, 404, { message: "Route not found" });
  }

  try {
    const file = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType, "X-Content-Type-Options": "nosniff" });
    res.end(file);
  } catch {
    sendJson(res, 404, { message: "Route not found" });
  }
};

const server = http.createServer(async (req, res) => {
  let requestUrl;
  try {
    requestUrl = new URL(req.url, "http://localhost");
  } catch {
    return sendJson(res, 400, { message: "Invalid URL" });
  }

  const route = API_ROUTES[requestUrl.pathname];

  if (route) {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return sendJson(res, 405, { message: "Method not allowed" });
    }

    try {
      sendJson(res, 200, await route(requestUrl.searchParams));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode >= 500) {
        console.error(`${requestUrl.pathname}${requestUrl.search} failed:`, error.message, error.apiMessage || "");
      }
      sendJson(res, statusCode, {
        message: error.statusCode ? error.message : "Internal server error",
        apiMessage: statusCode === 404 ? error.apiMessage : undefined
      });
    }

  } else if (req.method === "GET") {
    await serveStatic(res, requestUrl.pathname);

  } else {
    sendJson(res, 404, {
      message: "Route not found"
    });
  }
});

if (require.main === module) {
  if (!process.env.WEATHER_API_KEY) {
    console.error("WEATHER_API_KEY is not set. Add it to .env (see readme.md).");
    process.exit(1);
  }

  server.listen(PORT, () => {
    console.log(`Weather app running at http://localhost:${PORT}`);
  });
}

module.exports = { server };
