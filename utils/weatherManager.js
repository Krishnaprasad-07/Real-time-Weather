const https = require("https");

const API_BASE = "https://api.openweathermap.org";
const TIMEOUT_MS = 5000;
const AQI_LABELS = ["Good", "Fair", "Moderate", "Poor", "Very poor"];

class WeatherError extends Error {
  constructor(message, statusCode, apiMessage) {
    super(message);
    this.name = "WeatherError";
    this.statusCode = statusCode;
    this.apiMessage = apiMessage;
  }
}

// Optional upstream values are left out of the response rather than sent as "undefined m/s".
const withUnit = (value, unit) => (value == null ? undefined : `${value} ${unit}`);

// Calls an OpenWeatherMap endpoint and resolves with its parsed JSON body.
const fetchOpenWeather = (path, params) => {
  const query = new URLSearchParams({ ...params, appid: process.env.WEATHER_API_KEY });

  return new Promise((resolve, reject) => {
    const request = https.get(`${API_BASE}/${path}?${query}`, { timeout: TIMEOUT_MS }, (response) => {
      let data = "";
      response.setEncoding("utf8");

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("error", () => {
        reject(new WeatherError("Weather API request failed", 503));
      });

      response.on("end", () => {
        let body;
        try {
          body = JSON.parse(data);
        } catch {
          return reject(new WeatherError("Invalid response from weather service", 502));
        }

        // Most endpoints report their status in "cod"; the air pollution API only uses the HTTP status.
        const code = Number(body.cod ?? response.statusCode ?? 200);

        if (code === 404) {
          return reject(new WeatherError("City not found", 404, body.message));
        }

        if (code !== 200) {
          return reject(new WeatherError("Weather service error", 502, body.message));
        }

        resolve(body);
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

// A body that parsed as JSON but lacks the expected fields is treated like an unreadable response.
const mapWith = (mapper, ...extra) => (body) => {
  try {
    return mapper(body, ...extra);
  } catch (error) {
    if (error instanceof WeatherError) throw error;
    throw new WeatherError("Invalid response from weather service", 502);
  }
};

// Picks the best match for a typed place name. The geocoder ranks the best-known place first
// (Dublin, Ireland rather than Dublin, California), unlike the weather endpoint's own name search.
const toPlace = (results) => {
  if (!Array.isArray(results)) throw new Error("Unexpected geocoding response");
  const [place] = results;
  if (!place) throw new WeatherError("City not found", 404);
  return { name: place.name, region: place.state, country: place.country, lat: place.lat, lon: place.lon };
};

// Location fields come from the geocoded place: looking weather up by coordinates reports the
// nearest station's area (e.g. "Mountjoy" for Dublin), not the city that was searched for.
const toCurrentWeather = (data, place) => ({
  city: place.name,
  region: place.region,
  country: place.country,
  coordinates: { lat: place.lat, lon: place.lon },
  temperature: `${data.main.temp} °C`,
  feelsLike: `${data.main.feels_like} °C`,
  humidity: `${data.main.humidity} %`,
  wind: `${data.wind.speed} m/s`,
  windGust: withUnit(data.wind.gust, "m/s"),
  windDirection: data.wind.deg,
  pressure: withUnit(data.main.pressure, "hPa"),
  visibility: withUnit(data.visibility != null ? data.visibility / 1000 : undefined, "km"),
  clouds: withUnit(data.clouds?.all, "%"),
  rainLastHour: withUnit(data.rain?.["1h"], "mm"),
  snowLastHour: withUnit(data.snow?.["1h"], "mm"),
  condition: data.weather[0].description,
  icon: data.weather[0].icon,
  observedAt: data.dt,
  sunrise: data.sys?.sunrise,
  sunset: data.sys?.sunset,
  timezone: data.timezone
});

const localDate = (unixSeconds, timezone) => new Date((unixSeconds + timezone) * 1000).toISOString().slice(0, 10);
const localHour = (unixSeconds, timezone) => new Date((unixSeconds + timezone) * 1000).getUTCHours();
const chanceOf = (pop) => `${Math.round((pop ?? 0) * 100)} %`;

// Groups the 3-hourly slots by the city's local date. The first and last days only
// include the slots that fall inside the 5-day window.
const summariseDays = (list, timezone) => {
  const days = new Map();
  for (const item of list) {
    const date = localDate(item.dt, timezone);
    if (!days.has(date)) days.set(date, []);
    days.get(date).push(item);
  }

  return [...days].slice(0, 5).map(([date, items]) => {
    const temperatures = items.map((item) => item.main.temp);
    // The slot nearest midday best represents the day's weather.
    const distanceFromNoon = (item) => Math.abs(localHour(item.dt, timezone) - 12);
    const midday = items.reduce((best, item) => (distanceFromNoon(item) < distanceFromNoon(best) ? item : best));

    return {
      date,
      high: `${Math.max(...temperatures)} °C`,
      low: `${Math.min(...temperatures)} °C`,
      condition: midday.weather[0].description,
      icon: midday.weather[0].icon.replace("n", "d"),
      precipitationChance: chanceOf(Math.max(...items.map((item) => item.pop ?? 0)))
    };
  });
};

const toForecast = (data) => {
  const timezone = data.city?.timezone ?? 0;
  return {
    timezone,
    hourly: data.list.slice(0, 8).map((item) => ({
      time: item.dt,
      temperature: `${item.main.temp} °C`,
      condition: item.weather[0].description,
      icon: item.weather[0].icon,
      precipitationChance: chanceOf(item.pop)
    })),
    daily: summariseDays(data.list, timezone)
  };
};

const toAirQuality = (data) => {
  const { main, components } = data.list[0];
  const concentration = (value) => withUnit(value, "μg/m³");
  return {
    index: main.aqi,
    label: AQI_LABELS[main.aqi - 1],
    components: {
      pm2_5: concentration(components.pm2_5),
      pm10: concentration(components.pm10),
      o3: concentration(components.o3),
      no2: concentration(components.no2),
      so2: concentration(components.so2),
      co: concentration(components.co)
    }
  };
};

const findPlace = (query) =>
  fetchOpenWeather("geo/1.0/direct", { q: query, limit: 1 }).then(mapWith(toPlace));

const getWeather = async (city) => {
  const place = await findPlace(city);
  const data = await fetchOpenWeather("data/2.5/weather", { lat: place.lat, lon: place.lon, units: "metric" });
  return mapWith(toCurrentWeather, place)(data);
};

const getForecast = (lat, lon) =>
  fetchOpenWeather("data/2.5/forecast", { lat, lon, units: "metric" }).then(mapWith(toForecast));

const getAirQuality = (lat, lon) =>
  fetchOpenWeather("data/2.5/air_pollution", { lat, lon }).then(mapWith(toAirQuality));

module.exports = { getWeather, getForecast, getAirQuality, WeatherError };
