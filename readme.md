# Weather API (Node.js)

A simple real-time weather app and API built using pure Node.js, with no frameworks.

## Features
- Fetch real-time weather by city name
- Web interface whose sky follows the current weather (clear, clouds, rain, storm, snow, mist; day and night), with a gentle animated layer: sun rays, stars, drifting clouds, rain, snow, mist and faint lightning. Animation is turned off for visitors who prefer reduced motion.
- Details card: sunrise, sunset and day length with the sun's position; wind direction, gusts and Beaufort force; pressure, visibility, cloud cover, dew point with a comfort level, rain or snow in the last hour, and the moon phase
- Hourly forecast for the next 24 hours and a 5-day forecast with daily highs, lows and chance of rain
- Air quality: index from 1 (good) to 5 (very poor) with PM2.5, PM10, O₃, NO₂, SO₂ and CO
- The city's local time, how long ago the reading was taken, and a °C / °F switch that is remembered between visits
- Uses OpenWeatherMap API
- Secure API key handling using environment variables
- Tested with Node's built-in test runner

## Setup
Requires Node.js 20 or later.

1. Install dependencies: `npm install`
2. Create a `.env` file in the project root with your [OpenWeatherMap API key](https://home.openweathermap.org/api_keys):
   ```
   WEATHER_API_KEY=your_api_key_here
   ```
   Optionally set `PORT` (defaults to 3001).
3. Start the server: `npm start` (or `npm run dev` to restart on file changes)
4. Open http://localhost:3001 in your browser. Links like `/?city=Tokyo` open straight to a city, and the page remembers your last search.

Run the tests with `npm test`. They stub out OpenWeatherMap, so they need no API key or network access.

## Project structure
- `app.js`: HTTP server; serves the API and the files in `public/`
- `utils/weatherManager.js`: calls OpenWeatherMap
- `public/`: web interface (`index.html`, `style.css`, `main.js`, and `sky.js` for the background animation)
- `test/`: tests

## Endpoints
| Endpoint | Returns |
| --- | --- |
| `GET /weather?city=CityName` | Current conditions for the best match for `city`, including its `region` (state or province, when known) and `coordinates` |
| `GET /forecast?lat=..&lon=..` | `hourly`: the next 8 three-hour slots; `daily`: up to 5 days (in the city's local time) with `high`, `low`, `condition`, `icon` and `precipitationChance` |
| `GET /air-quality?lat=..&lon=..` | `index` (1–5), `label` and pollutant concentrations in μg/m³ |

City names are resolved with OpenWeatherMap's Geocoding API, which ranks the best-known place first: `Dublin` is Dublin, Ireland. To pick a specific place, add a country code (`Dublin,IE`) or, for the US, a state code too (`Dublin,CA,US`). Full country names also work (`Dublin, Ireland`); US state names don't.

The web page calls `/weather` first, then `/forecast` and `/air-quality` with the coordinates it returned, so every card describes the same place. The first day of the 5-day forecast only covers the hours left today.

## Example
GET /weather?city=London

```json
{
  "city": "London",
  "region": "England",
  "country": "GB",
  "coordinates": { "lat": 51.5073, "lon": -0.1276 },
  "temperature": "22.18 °C",
  "feelsLike": "22.26 °C",
  "humidity": "69 %",
  "wind": "3.32 m/s",
  "windGust": "8.45 m/s",
  "windDirection": 206,
  "pressure": "1012 hPa",
  "visibility": "10 km",
  "clouds": "98 %",
  "condition": "overcast clouds",
  "icon": "04d",
  "observedAt": 1790769600,
  "sunrise": 1790747944,
  "sunset": 1790790114,
  "timezone": 3600
}
```

- Measurements are strings with their unit. `region`, `windGust`, `windDirection`, `visibility`, `clouds`, `rainLastHour` and `snowLastHour` are left out when OpenWeatherMap doesn't report them (for rain and snow, that means none fell in the last hour).
- `windDirection` is in degrees and gives the direction the wind blows **from** (0 = north).
- `observedAt`, `sunrise` and `sunset` are Unix timestamps in seconds (UTC); `timezone` is the city's offset from UTC in seconds.
- `icon` is the OpenWeatherMap icon code; the last letter is `d` for day or `n` for night.

## Errors
All errors return JSON with a `message` field.

| Status | Meaning |
| --- | --- |
| 400 | `city` is missing or blank, `lat`/`lon` are missing or out of range, or the URL is malformed |
| 404 | City not found, or unknown route |
| 405 | An API endpoint called with a method other than GET |
| 502 | OpenWeatherMap returned an error (e.g. invalid API key, rate limit) or an unreadable response |
| 503 | Could not reach OpenWeatherMap |
| 504 | OpenWeatherMap did not respond within 5 seconds |
