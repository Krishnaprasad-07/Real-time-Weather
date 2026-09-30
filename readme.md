# Weather API (Node.js)

A simple real-time weather API built using pure Node.js.

## Features
- Fetch real-time weather by city name
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

Run the tests with `npm test`. They stub out OpenWeatherMap, so they need no API key or network access.

## Endpoint
GET /weather?city=CityName

## Example
GET /weather?city=London

```json
{
  "city": "London",
  "temperature": "21.75 °C",
  "humidity": "76 %",
  "condition": "broken clouds"
}
```

## Errors
All errors return JSON with a `message` field.

| Status | Meaning |
| --- | --- |
| 400 | `city` is missing or blank, or the URL is malformed |
| 404 | City not found, or unknown route |
| 405 | `/weather` called with a method other than GET |
| 502 | OpenWeatherMap returned an error (e.g. invalid API key, rate limit) or an unreadable response |
| 503 | Could not reach OpenWeatherMap |
| 504 | OpenWeatherMap did not respond within 5 seconds |
