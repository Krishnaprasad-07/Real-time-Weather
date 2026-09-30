const https = require("https");

const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const TIMEOUT_MS = 5000;

class WeatherError extends Error {
  constructor(message, statusCode, apiMessage) {
    super(message);
    this.name = "WeatherError";
    this.statusCode = statusCode;
    this.apiMessage = apiMessage;
  }
}

const getWeather = (city) => {
  const params = new URLSearchParams({
    q: city,
    appid: process.env.WEATHER_API_KEY,
    units: "metric"
  });

  return new Promise((resolve, reject) => {
    const request = https.get(`${API_URL}?${params}`, { timeout: TIMEOUT_MS }, (response) => {
      let data = "";
      response.setEncoding("utf8");

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("error", () => {
        reject(new WeatherError("Weather API request failed", 503));
      });

      response.on("end", () => {
        try {
          const weatherData = JSON.parse(data);
          const code = Number(weatherData.cod);

          if (code === 404) {
            return reject(new WeatherError("City not found", 404, weatherData.message));
          }

          if (code !== 200) {
            return reject(new WeatherError("Weather service error", 502, weatherData.message));
          }

          resolve({
            city: weatherData.name,
            temperature: `${weatherData.main.temp} °C`,
            humidity: `${weatherData.main.humidity} %`,
            condition: weatherData.weather[0].description
          });
        } catch {
          reject(new WeatherError("Invalid response from weather service", 502));
        }
      });
    });

    request.on("timeout", () => {
      reject(new WeatherError("Weather API timed out", 504));
      request.destroy();
    });

    request.on("error", () => {
      reject(new WeatherError("Weather API request failed", 503));
    });
  });
};

module.exports = { getWeather, WeatherError };
