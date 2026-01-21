require("dotenv").config();

const http = require("http");
const url = require("url");
const { getWeather } = require("./utils/weatherManager");

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const city = parsedUrl.query.city;

  if (req.method === "GET" && path === "/weather") {

    if (!city) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        message: "City query parameter is required"
      }));
    }

    getWeather(city, (error, data) => {
      if (error) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(error));
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    });

  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      message: "Route not found"
    }));
  }
});

server.listen(3001, () => {
  console.log("Weather API running on port 3001");
});
