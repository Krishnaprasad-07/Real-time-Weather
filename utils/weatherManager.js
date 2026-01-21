const https = require("https");

const getWeather = (city, callback) => {
  const API_KEY = process.env.WEATHER_API_KEY;

  const weatherUrl =
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

  https.get(weatherUrl, (response) => {
    let data = "";

    response.on("data", (chunk) => {
      data += chunk;
    });

    response.on("end", () => {
      const weatherData = JSON.parse(data);

      if (Number(weatherData.cod) !== 200) {
        return callback({
          message: "City not found",
          apiMessage: weatherData.message
        });
      }

      const result = {
        city: weatherData.name,
        temperature: `${weatherData.main.temp} °C`,
        humidity: `${weatherData.main.humidity} %`,
        condition: weatherData.weather[0].description
      };

      callback(null, result);
    });
  }).on("error", () => {
    callback({ message: "Weather API request failed" });
  });
};

module.exports = { getWeather };
