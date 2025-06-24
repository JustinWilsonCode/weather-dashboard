let debounceTimeout;

// Runs when the page is fully loaded
window.onload = function () {
    getWeatherByLocation(); // Automatically get weather by user's current location

    const cityInput = document.getElementById("cityInput");

    // Trigger weather search on Enter key press
    cityInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            getWeather(); // Search weather by city
            document.getElementById("autocomplete-list").innerHTML = ""; // Clear suggestions
        }
    });

    // Start autocomplete when user types
    cityInput.addEventListener("input", handleAutocomplete);
};

// Tracks the last searched location (used for toggling units)
let lastLocation = {
    type: null, // Either "city" or "coords"
    value: null
};

// Updates the weather using the last searched city or coordinates
function updateWeatherWithLastLocation() {
    const showFahrenheit = document.getElementById("unitToggle").checked;

    if (lastLocation.type === "city") {
        getWeatherByCity(lastLocation.value, showFahrenheit);
    } else if (lastLocation.type === "coords") {
        const { lat, lon } = lastLocation.value;
        getWeatherByCoords(lat, lon, showFahrenheit);
    }
}

// Gets user's current geographic coordinates and fetches weather
function getWeatherByLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const showFahrenheit = document.getElementById("unitToggle").checked;

        getWeatherByCoords(lat, lon, showFahrenheit);
    }, () => {
        alert("Unable to retrieve your location.");
    });
}

// Fetches weather data using coordinates from OpenWeatherMap
async function getWeatherByCoords(lat, lon, showFahrenheit = true) {
    const apiKey = "YOUR_OPENWEATHERMAP_API_KEY";
    const units = showFahrenheit ? "imperial" : "metric";

    lastLocation = { type: "coords", value: { lat, lon } };

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`);
        if (!response.ok) throw new Error();

        const data = await response.json();
        displayWeather(data, showFahrenheit);
        document.getElementById("cityInput").value = ""; // Clear input after location search
    } catch {
        document.getElementById("weatherResult").innerText = "Weather data not found!";
    }
}


// Handles fetching weather by city name input
async function getWeather(calledFromAutocomplete = false) {
    const city = document.getElementById("cityInput").value.trim();
    const showFahrenheit = document.getElementById("unitToggle").checked;

    if (!city) {
        document.getElementById("weatherResult").innerText = "Please enter a city name.";
        return;
    }

    lastLocation = { type: "city", value: city };

    await getWeatherByCity(city, showFahrenheit);

    if (!calledFromAutocomplete) {
        document.getElementById("cityInput").value = ""; // Clear input after search
    }
}

// Fetches weather using city name from OpenWeatherMap
async function getWeatherByCity(city, showFahrenheit = true) {
    const apiKey = "YOUR_OPENWEATHERMAP_API_KEY";
    const units = showFahrenheit ? "imperial" : "metric";

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`);
        if (!response.ok) throw new Error();

        const data = await response.json();
        displayWeather(data, showFahrenheit);
    } catch {
        // Clear cards and show error if city not found
        document.getElementById("leftCards").innerText = "";
        document.getElementById("rightCards").innerText = "";
        document.getElementById("weatherResult").innerText = "City not Found!";
    }
}

// Populates the weather data on the webpage
function displayWeather(data, showFahrenheit = false) {
    const { temp, humidity, pressure, feels_like } = data.main;
    const wind = data.wind.speed;
    const condition = data.weather[0].main;

    // Simple dew point approximation
    const dewPoint = temp - ((100 - humidity) / 5);

    // Convert visibility units
    const visibility = showFahrenheit
        ? (data.visibility / 1609.34).toFixed(1) // Miles
        : (data.visibility / 1000).toFixed(1);   // Kilometers

    const tempUnit = showFahrenheit ? "°F" : "°C";
    const windUnit = showFahrenheit ? "mph" : "m/s";
    const distanceUnit = showFahrenheit ? "mi" : "km";

    // Weather condition to background image mapping
    const iconMap = {
        clear: "images/sunny.jpg",
        clouds: "images/clouds.jpg",
        rain: "images/rain.jpg",
        drizzle: "images/rain.jpg",
        thunderstorm: "images/thunderstorm.jpg",
        snow: "images/snow.jpg",
        fog: "images/fog.jpg",
        mist: "images/fog.jpg",
        haze: "images/fog.jpg"
    };

    const iconPath = iconMap[condition.toLowerCase()] || "images/default.jpg";

    // Update weather image and city name
    document.getElementById("weatherIcon").innerHTML = `<img src="${iconPath}" alt="Weather Icon">`;
    document.getElementById("weatherResult").innerHTML = `<h2>${data.name}</h2>`;

    // Left side weather cards
    document.getElementById("leftCards").innerHTML = `
        <div class="card"><h3>Temperature</h3><p><span class="card-value">${temp}${tempUnit}</span></p></div>
        <div class="card"><h3>Wind Speed</h3><p><span class="card-value">${wind} ${windUnit}</span></p></div>
        <div class="card"><h3>Condition</h3><p><span class="card-value">${condition}</span></p></div>
        <div class="card"><h3>Feels Like</h3><p><span class="card-value">${feels_like}${tempUnit}</span></p></div>
    `;

    // Right side weather cards
    document.getElementById("rightCards").innerHTML = `
        <div class="card"><h3>Humidity</h3><p><span class="card-value">${humidity}%</span></p></div>
        <div class="card"><h3>Dew Point</h3><p><span class="card-value">${dewPoint.toFixed(1)}${tempUnit}</span></p></div>
        <div class="card"><h3>Pressure</h3><p><span class="card-value">${pressure} hPa</span></p></div>
        <div class="card"><h3>Visibility</h3><p><span class="card-value">${visibility} ${distanceUnit}</span></p></div>
    `;
}

// Debounced autocomplete function to fetch matching US cities
async function handleAutocomplete() {
    const query = document.getElementById("cityInput").value.trim();

    // Don't fetch for short inputs
    if (query.length < 2) {
        document.getElementById("autocomplete-list").innerHTML = "";
        return;
    }

    // Wait 1 second after user stops typing
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
        const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(query)}&countryIds=US&limit=10&types=CITY`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
                    'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
                }
            });

            if (!response.ok) throw new Error();

            const data = await response.json();
            showSuggestionsGeoDB(data.data); // Display suggestions
        } catch (error) {
            console.error("Error fetching city suggestions:", error);
            document.getElementById("autocomplete-list").innerHTML = "";
        }
    }, 1000);
}

// Renders clickable suggestions below the input
function showSuggestionsGeoDB(cities) {
    const list = document.getElementById("autocomplete-list");
    list.innerHTML = "";

    cities.forEach(city => {
        const item = document.createElement("div");
        const cityName = `${city.city}, ${city.regionCode}`;

        item.textContent = cityName;
        item.classList.add("autocomplete-item");

        // When clicked, fetch weather by coordinates
        item.onclick = () => {
            document.getElementById("cityInput").value = cityName;
            list.innerHTML = "";
            getWeatherByCoords(city.latitude, city.longitude, document.getElementById("unitToggle").checked);
        };

        list.appendChild(item);
    });
}