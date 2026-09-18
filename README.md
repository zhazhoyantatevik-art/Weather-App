# Weather App

A small, clean weather dashboard built with vanilla HTML, CSS, and JavaScript. Enter any city and get its current temperature, conditions, humidity, and wind speed, pulled live from a public weather API.

## Features

- Search for the current weather of any city in the world
- Search by clicking the "Search" button or pressing Enter
- Displays the searched city and country
- Displays the current temperature in °C
- Displays a readable weather condition (e.g. "Partly cloudy", "Rain")
- Displays an emoji icon matching the current condition
- Displays humidity and wind speed
- Loading indicator while data is being fetched
- Clear error messages for an empty input, an unknown city, or a failed request
- Clears previous results automatically when a new search starts
- Fully responsive layout for desktop and mobile

## Technologies

- HTML5
- CSS3
- JavaScript (vanilla, ES6+)
- REST API
- JSON
- Fetch API

No frameworks or external libraries are used.

## API

This project uses the [Open-Meteo](https://open-meteo.com/) API, which is free and requires no API key.

Two endpoints are used together:

- **Geocoding API** — converts a city name into latitude/longitude coordinates.
- **Weather API** — returns the current weather for a given latitude/longitude.

## How it works

```text
City name
   ↓
Geocoding API
   ↓
Latitude + Longitude
   ↓
Weather API
   ↓
JSON response
   ↓
JavaScript
   ↓
Weather Card
```

1. The user types a city name and searches.
2. JavaScript sends a `fetch()` request to the Geocoding API with the city name.
3. The API responds with JSON containing the city's latitude and longitude.
4. JavaScript sends a second `fetch()` request to the Weather API using those coordinates.
5. The API responds with JSON containing the current temperature, humidity, wind speed, and a weather code.
6. JavaScript converts the weather code into a readable description and icon, then updates the page.

All requests are handled with `async/await` and wrapped in `try/catch` so that network errors or an unknown city produce a clear, user-friendly error message instead of a silent failure.

## How to run

1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-username/weather-app.git
   ```
2. Open the project folder.
3. Open `index.html` directly in your browser (no build step or server required).

## What I learned

Building this project helped me practice:

- Working with REST APIs
- Making HTTP requests with `fetch()`
- Reading and parsing JSON responses
- Using `async/await` for asynchronous code
- Handling errors with `try/catch`
- Manipulating the DOM based on API data
- Structuring a small front-end project with separated HTML, CSS, and JavaScript

## Future improvements

- 5-day weather forecast
- Save and switch between favorite cities
- Detect the user's current location automatically
- Dark/light mode toggle
- View recent search history
