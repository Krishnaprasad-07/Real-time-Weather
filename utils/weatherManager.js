const https = require("https");

const getWeather = async (city) => {
  const API_KEY = process.env.WEATHER_API_KEY;

  const weatherUrl =
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

  return new Promise((resolve, reject) => {
    https.get(weatherUrl, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        const weatherData = JSON.parse(data);

        if (Number(weatherData.cod) !== 200) {
          return reject({
            message: "City not found",
            apiMessage: weatherData.message
          });
        }

        resolve({
          city: weatherData.name,
          temperature: `${weatherData.main.temp} °C`,
          humidity: `${weatherData.main.humidity} %`,
          condition: weatherData.weather[0].description
        });
      });
    }).on("error", () => {
      reject({ message: "Weather API request failed" });
    });
  });
};

module.exports = { getWeather };
