/* ============================================================
   Weather App - script.js
   ------------------------------------------------------------
   Flow of this file:

   1. User types a city and clicks "Search" (or presses Enter).
   2. searchCity() reads the input and calls getWeather().
   3. getWeather() first calls the Open-Meteo GEOCODING API
      to convert the city name into latitude/longitude.
   4. getWeather() then calls the Open-Meteo WEATHER API
      using that latitude/longitude to get the current weather.
   5. displayWeather() takes the JSON response and updates the DOM.

   Both API calls use fetch() + async/await + try/catch, since
   fetch() returns a Promise that resolves once the server
   responds with JSON data.
   ============================================================ */

// ----- DOM elements (grabbed once, reused everywhere) -----
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");

const loadingState = document.getElementById("loading");
const errorState = document.getElementById("error");
const errorMessage = document.getElementById("errorMessage");
const weatherCard = document.getElementById("weatherCard");

const cityNameEl = document.getElementById("cityName");
const weatherIconEl = document.getElementById("weatherIcon");
const temperatureEl = document.getElementById("temperature");
const weatherDescriptionEl = document.getElementById("weatherDescription");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("windSpeed");

// ----- API endpoints -----
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

/* ============================================================
   Event listeners
   ============================================================ */

// Trigger a search when the button is clicked
searchButton.addEventListener("click", searchCity);

// Trigger a search when the user presses Enter inside the input
cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchCity();
  }
});

/* ============================================================
   searchCity()
   Reads the input value, validates it, and starts the
   geocoding + weather lookup.
   ============================================================ */
function searchCity() {
  const city = cityInput.value.trim();

  // Clear whatever was shown from a previous search
  resetUI();

  if (city === "") {
    showError("Please enter a city name.");
    return;
  }

  getWeather(city);
}

/* ============================================================
   getWeather(city)
   Handles both API calls:
     1) Geocoding API  -> turns "city name" into lat/lon
     2) Weather API    -> turns lat/lon into current weather
   ============================================================ */
async function getWeather(city) {
  showLoading();

  try {
    // ---- STEP 1: Geocoding request ----
    // URL requested: GEOCODING_URL
    // Parameters sent: name = city, count = 1, language = en, format = json
    // Expected JSON shape: { results: [ { latitude, longitude, name, country } ] }
    const geoResponse = await fetch(
      `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    if (!geoResponse.ok) {
      throw new Error("Could not reach the geocoding service.");
    }

    const geoData = await geoResponse.json();

    // If no results were found, the city name is probably invalid
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`City "${city}" was not found. Check the spelling and try again.`);
    }

    // Extract the values we need from the geocoding response
    const { latitude, longitude, name, country } = geoData.results[0];

    // ---- STEP 2: Weather request ----
    // URL requested: WEATHER_URL
    // Parameters sent: latitude, longitude, current fields, timezone = auto
    // Expected JSON shape: { current: { temperature_2m, relative_humidity_2m,
    //                                     wind_speed_10m, weather_code } }
    const weatherResponse = await fetch(
      `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
        `&timezone=auto`
    );

    if (!weatherResponse.ok) {
      throw new Error("Could not reach the weather service.");
    }

    const weatherData = await weatherResponse.json();

    // Extract the values we need from the weather response
    const current = weatherData.current;

    // Pass everything displayWeather() needs, in one plain object
    displayWeather({
      cityLabel: country ? `${name}, ${country}` : name,
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
    });
  } catch (error) {
    // Any failure above (network issue, bad city, bad response) ends up here
    showError(error.message || "Something went wrong. Please try again.");
  } finally {
    hideLoading();
  }
}

/* ============================================================
   displayWeather(data)
   Updates the DOM with the weather information.
   ============================================================ */
function displayWeather(data) {
  const { cityLabel, temperature, humidity, windSpeed, weatherCode } = data;
  const { description, icon } = getWeatherDescription(weatherCode);

  cityNameEl.textContent = cityLabel;
  temperatureEl.textContent = `${Math.round(temperature)}°C`;
  weatherDescriptionEl.textContent = description;
  weatherIconEl.textContent = icon;
  humidityEl.textContent = `${humidity}%`;
  windSpeedEl.textContent = `${windSpeed} km/h`;

  weatherCard.classList.remove("hidden");
}

/* ============================================================
   getWeatherDescription(code)
   Converts an Open-Meteo "weather code" into a readable
   description and a matching emoji icon.
   Reference: https://open-meteo.com/en/docs (WMO weather codes)
   ============================================================ */
function getWeatherDescription(code) {
  if (code === 0) {
    return { description: "Clear sky", icon: "☀️" };
  } else if (code === 1) {
    return { description: "Mainly clear", icon: "🌤️" };
  } else if (code === 2) {
    return { description: "Partly cloudy", icon: "⛅" };
  } else if (code === 3) {
    return { description: "Overcast", icon: "☁️" };
  } else if (code === 45 || code === 48) {
    return { description: "Fog", icon: "🌫️" };
  } else if (code >= 51 && code <= 57) {
    return { description: "Drizzle", icon: "🌦️" };
  } else if (code >= 61 && code <= 67) {
    return { description: "Rain", icon: "🌧️" };
  } else if (code >= 71 && code <= 77) {
    return { description: "Snow", icon: "❄️" };
  } else if (code >= 80 && code <= 82) {
    return { description: "Rain showers", icon: "🌦️" };
  } else if (code >= 85 && code <= 86) {
    return { description: "Snow showers", icon: "🌨️" };
  } else if (code >= 95 && code <= 99) {
    return { description: "Thunderstorm", icon: "⛈️" };
  } else {
    return { description: "Unknown conditions", icon: "🌡️" };
  }
}

/* ============================================================
   UI helper functions
   ============================================================ */

function showLoading() {
  loadingState.classList.remove("hidden");
}

function hideLoading() {
  loadingState.classList.add("hidden");
}

function showError(message) {
  errorMessage.textContent = message;
  errorState.classList.remove("hidden");
}

// Clears results/errors from a previous search before starting a new one
function resetUI() {
  errorState.classList.add("hidden");
  weatherCard.classList.add("hidden");
}
