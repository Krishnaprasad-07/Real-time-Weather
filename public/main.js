// Icons adapted from Lucide (https://lucide.dev), ISC License.
const ICONS = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  cloudSun: '<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>',
  cloudMoon: '<path d="M13 16a3 3 0 1 1 0 6H7a5 5 0 1 1 4.9-6Z"/><path d="M10.1 9A6 6 0 0 1 16 4a4 4 0 0 0 6 6 6 6 0 0 1-3 5.197"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  rain: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
  storm: '<path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/>',
  snow: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/>',
  fog: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 17H7"/><path d="M17 21H9"/>',
  thermometer: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  droplets: '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',
  wind: '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
  sunrise: '<path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
  sunset: '<path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>'
};

// Keyed by the first two characters of the OpenWeatherMap icon code (e.g. "10" in "10n").
const CONDITIONS = {
  "01": { sky: "clear", day: "sun", night: "moon" },
  "02": { sky: "clouds", day: "cloudSun", night: "cloudMoon" },
  "03": { sky: "clouds", day: "cloud", night: "cloud" },
  "04": { sky: "clouds", day: "cloud", night: "cloud" },
  "09": { sky: "rain", day: "rain", night: "rain" },
  "10": { sky: "rain", day: "rain", night: "rain" },
  "11": { sky: "storm", day: "storm", night: "storm" },
  "13": { sky: "snow", day: "snow", night: "snow" },
  "50": { sky: "mist", day: "fog", night: "fog" }
};

const COMPASS_POINTS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

// Upper wind speed (m/s) of each Beaufort force, 0–12.
const BEAUFORT = [
  [0.2, "Calm"], [1.5, "Light air"], [3.3, "Light breeze"], [5.4, "Gentle breeze"],
  [7.9, "Moderate breeze"], [10.7, "Fresh breeze"], [13.8, "Strong breeze"], [17.1, "Near gale"],
  [20.7, "Gale"], [24.4, "Strong gale"], [28.4, "Storm"], [32.6, "Violent storm"], [Infinity, "Hurricane force"]
];

// Dew point (°C) is a better guide to how muggy it feels than relative humidity.
const COMFORT = [
  [10, "Dry"], [16, "Comfortable"], [18, "Slightly humid"], [21, "Humid"], [24, "Very humid"], [Infinity, "Oppressive"]
];

// Moon phase as a fraction of the lunar cycle (0 = new, 0.5 = full).
const SYNODIC_MONTH_DAYS = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) / 1000;
const MOON_PHASES = [
  [0.03, "New moon"], [0.22, "Waxing crescent"], [0.28, "First quarter"], [0.47, "Waxing gibbous"],
  [0.53, "Full moon"], [0.72, "Waning gibbous"], [0.78, "Last quarter"], [0.97, "Waning crescent"], [1, "New moon"]
];

const AQI_ADVICE = {
  1: "Air quality is good. A great time to be outdoors.",
  2: "Air quality is acceptable for most people.",
  3: "Sensitive groups should limit long or intense outdoor activity.",
  4: "Consider cutting back on outdoor activity, especially if you are sensitive.",
  5: "Avoid long or intense outdoor activity."
};

const ERROR_MESSAGES = {
  400: "Please enter a city name.",
  404: "We couldn't find that city. Check the spelling and try again.",
  502: "The weather service returned an error. Please try again shortly.",
  503: "The weather service is unavailable right now. Please try again shortly.",
  504: "The weather service is taking too long to respond. Please try again."
};
const DEFAULT_ERROR = "Something went wrong. Please try again.";
const OFFLINE_ERROR = "Can't reach the server. Check your connection and try again.";
const LAST_CITY_KEY = "weather:lastCity";
const UNIT_KEY = "weather:unit";

const $ = (id) => document.getElementById(id);
const els = {
  layout: $("layout"),
  form: $("search-form"),
  input: $("city-input"),
  button: $("search-button"),
  unitButtons: document.querySelectorAll("[data-unit]"),
  status: $("status"),
  empty: $("empty"),
  result: $("result"),
  city: $("city"),
  country: $("country"),
  localTime: $("local-time"),
  observed: $("observed"),
  conditionIcon: $("condition-icon"),
  temperature: $("temperature"),
  condition: $("condition"),
  feelsLike: $("feels-like"),
  humidity: $("humidity"),
  wind: $("wind"),
  details: $("details"),
  sun: $("sun"),
  arcProgress: $("arc-progress"),
  sunDot: $("sun-dot"),
  sunrise: $("sunrise"),
  sunset: $("sunset"),
  dayLength: $("day-length"),
  daylight: $("daylight"),
  windArrow: $("wind-arrow"),
  windDirection: $("wind-direction"),
  windDetail: $("wind-detail"),
  windForce: $("wind-force"),
  pressure: $("pressure"),
  visibility: $("visibility"),
  clouds: $("clouds"),
  dewPoint: $("dew-point"),
  comfort: $("comfort"),
  precipitation: $("precipitation"),
  precipitationType: $("precipitation-type"),
  moonIcon: $("moon-icon"),
  moonIllumination: $("moon-illumination"),
  moonPhase: $("moon-phase"),
  hourly: $("hourly"),
  hourlyList: $("hourly-list"),
  daily: $("daily"),
  dailyList: $("daily-list"),
  air: $("air"),
  aqiBadge: $("aqi-badge"),
  aqiIndex: $("aqi-index"),
  aqiLabel: $("aqi-label"),
  aqiAdvice: $("aqi-advice"),
  aqiMarker: $("aqi-marker")
};
const RESULT_CARDS = [els.details, els.hourly, els.daily, els.air];
const POLLUTANTS = ["pm2_5", "pm10", "o3", "no2", "so2", "co"];

const svg = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
  }
};

let current = null;
let forecast = null;
let unit = storage.get(UNIT_KEY) === "F" ? "F" : "C";
// Incremented per search so late forecast/air-quality responses for an earlier city are ignored.
let searchId = 0;

const regionNames = typeof Intl.DisplayNames === "function"
  ? new Intl.DisplayNames(["en"], { type: "region" })
  : null;

const countryName = (code) => {
  if (!code) return "";
  try { return regionNames?.of(code) ?? code; } catch { return code; }
};

// The API returns measurements like "21.75 °C" or "78 %"; parseFloat reads the number.
const formatTemp = (celsius) => {
  if (!Number.isFinite(celsius)) return "—";
  return `${Math.round(unit === "F" ? celsius * 9 / 5 + 32 : celsius)}°`;
};

const formatPercent = (value) => {
  const number = parseFloat(value);
  return Number.isFinite(number) ? `${Math.round(number)}%` : "—";
};

// Magnus formula; accurate to a fraction of a degree for everyday temperatures.
const dewPoint = (celsius, humidity) => {
  if (!Number.isFinite(celsius) || !(humidity > 0)) return NaN;
  const gamma = Math.log(humidity / 100) + (17.62 * celsius) / (243.12 + celsius);
  return (243.12 * gamma) / (17.62 - gamma);
};

const comfortLevel = (dewPointCelsius) =>
  Number.isFinite(dewPointCelsius) ? COMFORT.find(([limit]) => dewPointCelsius < limit)[1] : "";

const beaufort = (metresPerSecond) => {
  if (!Number.isFinite(metresPerSecond)) return "";
  const force = BEAUFORT.findIndex(([limit]) => metresPerSecond <= limit);
  return `Force ${force} · ${BEAUFORT[force][1]}`;
};

const moonPhase = (unixSeconds) => {
  const cycles = (unixSeconds - KNOWN_NEW_MOON) / 86400 / SYNODIC_MONTH_DAYS;
  const phase = ((cycles % 1) + 1) % 1;
  return {
    phase,
    name: MOON_PHASES.find(([limit]) => phase < limit)[1],
    illumination: (1 - Math.cos(2 * Math.PI * phase)) / 2
  };
};

// Lit part of the moon: one half of the disc plus an elliptical terminator whose width follows the phase.
const moonSvg = (phase) => {
  const waxing = phase < 0.5;
  const crescent = phase < 0.25 || phase > 0.75;
  const rx = (9 * Math.abs(Math.cos(2 * Math.PI * phase))).toFixed(2);
  const edgeSweep = waxing ? 1 : 0;
  const terminatorSweep = waxing === crescent ? 0 : 1;
  return `<svg class="moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle class="moon-dark" cx="12" cy="12" r="9"/>
    <path class="moon-lit" d="M12 3 A9 9 0 0 ${edgeSweep} 12 21 A${rx} 9 0 0 ${terminatorSweep} 12 3Z"/>
  </svg>`;
};

// OpenWeatherMap gives UTC timestamps plus the city's UTC offset, so shift and format as UTC.
const cityDate = (unixSeconds, timezone) => new Date((unixSeconds + timezone) * 1000);

const formatCityTime = (unixSeconds, timezone) =>
  cityDate(unixSeconds, timezone).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

const formatDuration = (seconds) => {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
};

const formatAge = (seconds) => (seconds < 90 ? "just now" : `${formatDuration(seconds)} ago`);

const compassPoint = (degrees) => COMPASS_POINTS[Math.round(degrees / 22.5) % 16];

const lookupCondition = (iconCode = "") => {
  const period = iconCode.endsWith("n") ? "night" : "day";
  const condition = CONDITIONS[iconCode.slice(0, 2)];
  if (!condition) return { theme: "default", icon: "cloud" };
  return { theme: `${condition.sky}-${period}`, icon: condition[period] };
};

const setSky = (spec) => window.Sky?.set(spec);

// Builds an element with an optional class and text; text is never parsed as HTML.
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const iconEl = (className, name, label) => {
  const node = el("span", className);
  node.innerHTML = svg(name);
  if (label) node.append(el("span", "visually-hidden", label));
  return node;
};

const setLoading = (loading) => {
  document.body.classList.toggle("is-loading", loading);
  els.layout.setAttribute("aria-busy", String(loading));
  els.button.disabled = loading;
};

const setCardState = (card, state, message = "") => {
  card.dataset.state = state;
  card.querySelector(".card-message").textContent = message;
};

const setResultCardsVisible = (visible) => {
  RESULT_CARDS.forEach((card) => { card.hidden = !visible; });
  els.layout.classList.toggle("has-result", visible);
};

const showError = (message) => {
  current = null;
  forecast = null;
  els.status.innerHTML = `${svg("alert")}<span></span>`;
  els.status.lastElementChild.textContent = message;
  els.result.hidden = true;
  els.empty.hidden = true;
  setResultCardsVisible(false);
  document.body.dataset.theme = "default";
  document.title = "Weather";
  setSky({ theme: "default" });
};

const clearError = () => {
  els.status.replaceChildren();
};

const syncUnitButtons = () => {
  els.unitButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.unit === unit));
  });
};

// --- Current conditions and details ------------------------------------------

const renderTemperatures = () => {
  const temperature = parseFloat(current.temperature);
  const dew = dewPoint(temperature, parseFloat(current.humidity));
  els.temperature.textContent = formatTemp(temperature);
  els.feelsLike.textContent = formatTemp(parseFloat(current.feelsLike));
  els.dewPoint.textContent = formatTemp(dew);
  els.comfort.textContent = comfortLevel(dew);
  document.title = `${formatTemp(temperature)} ${current.city} · Weather`;
};

const renderSun = (now) => {
  const { sunrise, sunset, timezone = 0 } = current;
  els.sun.hidden = !(sunrise && sunset && sunset > sunrise);
  if (els.sun.hidden) return;

  els.sunrise.textContent = formatCityTime(sunrise, timezone);
  els.sunset.textContent = formatCityTime(sunset, timezone);
  els.dayLength.textContent = `${formatDuration(sunset - sunrise)} of daylight`;

  const progress = (now - sunrise) / (sunset - sunrise);
  const clamped = Math.min(Math.max(progress, 0), 1);
  const angle = Math.PI * clamped;
  const isDaytime = progress >= 0 && progress <= 1;

  els.arcProgress.style.strokeDasharray = `${clamped * 100} 100`;
  els.arcProgress.classList.toggle("is-hidden", !isDaytime || clamped === 0);
  els.sunDot.setAttribute("cx", (100 - 90 * Math.cos(angle)).toFixed(1));
  els.sunDot.setAttribute("cy", (100 - 90 * Math.sin(angle)).toFixed(1));
  els.sunDot.classList.toggle("is-hidden", !isDaytime);

  if (progress < 0) {
    els.daylight.textContent = `Sunrise in ${formatDuration(sunrise - now)}`;
  } else if (progress > 1) {
    els.daylight.textContent = "The sun has set";
  } else {
    els.daylight.textContent = `${formatDuration(sunset - now)} left`;
  }
};

const renderMoon = (now) => {
  const moon = moonPhase(now);
  els.moonIcon.innerHTML = moonSvg(moon.phase);
  els.moonIllumination.textContent = `${Math.round(moon.illumination * 100)}%`;
  els.moonPhase.textContent = moon.name;
};

const renderClock = () => {
  const now = Math.floor(Date.now() / 1000);
  const { timezone, observedAt } = current;

  els.localTime.textContent = Number.isFinite(timezone)
    ? `${cityDate(now, timezone).toLocaleString([], { weekday: "long", hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} local time`
    : "";
  els.observed.textContent = Number.isFinite(observedAt)
    ? ` · Updated ${formatAge(Math.max(now - observedAt, 0))}`
    : "";

  renderSun(now);
  renderMoon(now);
};

const renderWind = () => {
  const degrees = current.windDirection;
  const hasDirection = Number.isFinite(degrees);

  // Meteorological direction is where the wind comes FROM; the arrow shows where it blows to.
  els.windArrow.style.transform = `rotate(${hasDirection ? degrees + 180 : 0}deg)`;
  els.windArrow.classList.toggle("is-hidden", !hasDirection);
  els.windDirection.textContent = hasDirection
    ? `From ${compassPoint(degrees)} · ${Math.round(degrees)}°`
    : "Direction unavailable";
  els.windDetail.textContent = current.windGust
    ? `${current.wind} · gusts ${current.windGust}`
    : current.wind;
  els.windForce.textContent = beaufort(parseFloat(current.wind));
};

const renderPrecipitation = () => {
  const { rainLastHour, snowLastHour } = current;
  const amounts = [rainLastHour, snowLastHour].filter(Boolean).map(parseFloat);
  const types = [rainLastHour && "Rain", snowLastHour && "Snow"].filter(Boolean);

  els.precipitation.textContent = amounts.length
    ? `${Math.round(amounts.reduce((sum, value) => sum + value, 0) * 10) / 10} mm`
    : "None";
  els.precipitationType.textContent = types.join(" and ");
};

const restartAnimation = (element) => {
  element.classList.remove("appear");
  void element.offsetWidth;
  element.classList.add("appear");
};

const render = (data) => {
  current = data;
  forecast = null;
  const { theme, icon } = lookupCondition(data.icon);

  document.body.dataset.theme = theme;
  setSky({ theme, icon: data.icon, condition: data.condition });

  els.city.textContent = data.city;
  els.country.textContent = [data.region, countryName(data.country)].filter(Boolean).join(", ");
  els.conditionIcon.innerHTML = svg(icon);
  els.condition.textContent = data.condition;
  els.humidity.textContent = formatPercent(data.humidity);
  els.wind.textContent = data.wind;
  els.pressure.textContent = data.pressure ?? "—";
  els.visibility.textContent = data.visibility ?? "—";
  els.clouds.textContent = formatPercent(data.clouds);

  renderTemperatures();
  renderClock();
  renderWind();
  renderPrecipitation();

  els.empty.hidden = true;
  els.result.hidden = false;
  setResultCardsVisible(true);
  [els.result, ...RESULT_CARDS].forEach(restartAnimation);
};

// --- Forecast ----------------------------------------------------------------

const renderForecast = () => {
  if (!forecast) return;
  const { timezone, hourly, daily } = forecast;

  els.hourlyList.replaceChildren(...hourly.map((slot) => {
    const { icon } = lookupCondition(slot.icon);
    const chance = parseFloat(slot.precipitationChance);
    const rain = el("span", "hour-rain", `${chance}%`);
    rain.classList.toggle("is-hidden", !(chance >= 10));

    const item = el("li", "hour");
    item.append(
      el("span", "hour-time", formatCityTime(slot.time, timezone)),
      iconEl("hour-icon", icon, slot.condition),
      el("span", "hour-temp", formatTemp(parseFloat(slot.temperature))),
      rain
    );
    return item;
  }));

  // Each day's bar spans its low to high on a scale shared by all five days.
  const lows = daily.map((day) => parseFloat(day.low));
  const highs = daily.map((day) => parseFloat(day.high));
  const min = Math.min(...lows);
  const span = Math.max(Math.max(...highs) - min, 1);
  const today = cityDate(Math.floor(Date.now() / 1000), timezone).toISOString().slice(0, 10);

  els.dailyList.replaceChildren(...daily.map((day, i) => {
    const { icon } = lookupCondition(day.icon);
    const chance = parseFloat(day.precipitationChance);
    const name = day.date === today
      ? "Today"
      : new Date(`${day.date}T12:00:00Z`).toLocaleDateString([], { weekday: "short", timeZone: "UTC" });

    const range = el("span", "range");
    const fill = el("span", "range-fill");
    fill.style.left = `${((lows[i] - min) / span) * 100}%`;
    fill.style.width = `${Math.max(((highs[i] - lows[i]) / span) * 100, 4)}%`;
    range.append(fill);

    const rain = el("span", "day-rain", `${chance}%`);
    rain.classList.toggle("is-hidden", !(chance >= 10));

    const item = el("li", "day");
    item.append(
      el("span", "day-name", name),
      iconEl("day-icon", icon, day.condition),
      rain,
      el("span", "day-low", formatTemp(lows[i])),
      range,
      el("span", "day-high", formatTemp(highs[i]))
    );
    return item;
  }));

  setCardState(els.hourly, "ready");
  setCardState(els.daily, "ready");
};

// --- Air quality -------------------------------------------------------------

const renderAirQuality = (air) => {
  els.aqiBadge.dataset.level = air.index;
  els.aqiIndex.textContent = air.index;
  els.aqiLabel.textContent = air.label ?? "Unknown";
  els.aqiAdvice.textContent = AQI_ADVICE[air.index] ?? "";
  els.aqiMarker.style.left = `${((air.index - 0.5) / 5) * 100}%`;

  POLLUTANTS.forEach((key) => {
    const value = parseFloat(air.components?.[key]);
    $(key).textContent = Number.isFinite(value) ? (value >= 100 ? Math.round(value) : value.toFixed(1)) : "—";
  });

  setCardState(els.air, "ready");
};

// --- Loading -----------------------------------------------------------------

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

// Forecast and air quality are looked up by the coordinates of the city the weather search found,
// so every card describes the same place.
const loadExtras = (coordinates, id) => {
  const isCurrent = () => id === searchId;

  if (!coordinates) {
    setCardState(els.hourly, "error", "Forecast unavailable for this location.");
    setCardState(els.daily, "error", "Forecast unavailable for this location.");
    setCardState(els.air, "error", "Air quality unavailable for this location.");
    return;
  }

  const query = `lat=${coordinates.lat}&lon=${coordinates.lon}`;
  setCardState(els.hourly, "loading", "Loading forecast…");
  setCardState(els.daily, "loading", "Loading forecast…");
  setCardState(els.air, "loading", "Loading air quality…");

  fetchJson(`/forecast?${query}`)
    .then((data) => {
      if (!isCurrent()) return;
      forecast = data;
      renderForecast();
    })
    .catch(() => {
      if (!isCurrent()) return;
      setCardState(els.hourly, "error", "Forecast unavailable right now.");
      setCardState(els.daily, "error", "Forecast unavailable right now.");
    });

  fetchJson(`/air-quality?${query}`)
    .then((data) => {
      if (isCurrent()) renderAirQuality(data);
    })
    .catch(() => {
      if (isCurrent()) setCardState(els.air, "error", "Air quality unavailable right now.");
    });
};

const updateUrl = (city) => {
  const url = new URL(window.location.href);
  url.searchParams.set("city", city);
  history.replaceState(null, "", url);
};

const loadWeather = async (city) => {
  const id = ++searchId;
  setLoading(true);
  clearError();
  els.empty.hidden = true;

  try {
    const response = await fetch(`/weather?city=${encodeURIComponent(city)}`);
    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      showError(ERROR_MESSAGES[response.status] || DEFAULT_ERROR);
      return;
    }

    render(data);
    loadExtras(data.coordinates, id);
    // Keep what was typed ("Dublin,CA,US"), not the returned name, so a reload finds the same place.
    storage.set(LAST_CITY_KEY, city);
    updateUrl(city);
  } catch {
    showError(OFFLINE_ERROR);
  } finally {
    setLoading(false);
  }
};

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = els.input.value.trim();

  if (!city) {
    showError(ERROR_MESSAGES[400]);
    els.input.focus();
    return;
  }

  loadWeather(city);
});

els.unitButtons.forEach((button) => {
  button.addEventListener("click", () => {
    unit = button.dataset.unit;
    storage.set(UNIT_KEY, unit);
    syncUnitButtons();
    if (current) renderTemperatures();
    renderForecast();
  });
});

// Keeps the local time, data age, sun and moon current while the page stays open.
setInterval(() => {
  if (current) renderClock();
}, 30000);

document.querySelectorAll("[data-icon]").forEach((node) => {
  node.innerHTML = svg(node.dataset.icon);
});
syncUnitButtons();

const initialCity = new URLSearchParams(window.location.search).get("city")?.trim()
  || storage.get(LAST_CITY_KEY);

if (initialCity) {
  els.input.value = initialCity;
  loadWeather(initialCity);
}
