# 🌦️ Weather Dashboard

A responsive web app that displays current weather information based on city input or geolocation. Includes support for temperature unit switching and real-time US city autocomplete.

![screenshot](images/screenshot.png) <!-- Optional: replace or delete if you don't have a screenshot yet -->

---

## 🔧 Features

-  Get weather by city name or by your current location
-  Autocomplete for US cities with debounced search
-  Toggle between Fahrenheit and Celsius
-  Dynamic background image based on weather condition
-  Clear, responsive card-based UI

---

##  Live Demo

 [**Check it out on GitHub Pages**](https://justinwilsoncode.github.io/weather-dashboard/)

---

## Tech Stack

- HTML, CSS, JavaScript
- [OpenWeatherMap API](https://openweathermap.org/api) – for weather data
- [GeoDB Cities API](https://rapidapi.com/wirefreethought/api/geodb-cities/) – for city autocomplete

---

##  Setup Instructions

1. Clone this repo:
   ```bash
   git clone https://github.com/JustinWilsonCode/weather-dashboard.git


2. Replace the placeholder API keys in script.js:

const apiKey = "YOUR_OPENWEATHERMAP_API_KEY";

headers: {
  'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
  'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
}

3. Get your keys from:
- OpenWeatherMap
- RapidAPI GeoDB

4. Open index.html in a browser, or view it live at the link above.

## Folder Structure

weather-dashboard/
├── index.html
├── script.js
├── style.css
├── images/
│ ├── sunny.jpg
│ ├── clouds.jpg
│ ├── rain.jpg
│ ├── ...
└─  ─ README.md

## Credits

- Weather data from OpenWeatherMap
- City autocomplete from GeoDB Cities API
