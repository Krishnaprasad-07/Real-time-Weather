require("dotenv").config();

const http = require("http");
const { getWeather } = require("./utils/weatherManager");

const PORT = process.env.PORT || 3001;

const sendJson = (res, statusCode, body) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

const server = http.createServer(async (req, res) => {
  let requestUrl;
  try {
    requestUrl = new URL(req.url, "http://localhost");
  } catch {
    return sendJson(res, 400, { message: "Invalid URL" });
  }

  if (requestUrl.pathname === "/weather") {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return sendJson(res, 405, { message: "Method not allowed" });
    }

    const city = requestUrl.searchParams.get("city")?.trim();

    if (!city) {
      return sendJson(res, 400, {
        message: "City query parameter is required"
      });
    }

    try {
      const weatherData = await getWeather(city);
      sendJson(res, 200, weatherData);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode >= 500) {
        console.error(`Weather lookup failed for "${city}":`, error.message, error.apiMessage || "");
      }
      sendJson(res, statusCode, {
        message: error.statusCode ? error.message : "Internal server error",
        apiMessage: statusCode === 404 ? error.apiMessage : undefined
      });
    }

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
    console.log(`Weather API running on port ${PORT}`);
  });
}

module.exports = { server };
