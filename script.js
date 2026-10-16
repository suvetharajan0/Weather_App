const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherInfo = document.getElementById("weatherInfo");
const message = document.getElementById("message");


searchBtn.addEventListener("click", getWeather);


cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});


async function getWeather() {
    const city = cityInput.value.trim();


    if (city === "") {
        message.textContent = "Please enter a city name!";
        weatherInfo.innerHTML = "";
        return;
    }


    message.textContent = "Loading...";
    weatherInfo.innerHTML = "";


    try {
        // Find the city coordinates
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );


        if (!geoResponse.ok) {
            throw new Error("Unable to find city");
        }


        const geoData = await geoResponse.json();


        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found");
        }


        const location = geoData.results[0];


        const latitude = location.latitude;
        const longitude = location.longitude;


        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`
        );


        if (!weatherResponse.ok) {
            throw new Error("Unable to get weather information");
        }


        const weatherData = await weatherResponse.json();
        const weather = weatherData.current;


        function getWeatherDescription(code) {
            if (code === 0) return ["Clear Sky", "☀️"];
            if (code === 1) return ["Mainly Clear", "🌤️"];
            if (code === 2) return ["Partly Cloudy", "⛅"];
            if (code === 3) return ["Overcast", "☁️"];
            if ([45, 48].includes(code)) return ["Foggy", "🌫️"];
            if ([51, 53, 55].includes(code)) return ["Drizzle", "🌦️"];
            if ([56, 57].includes(code)) return ["Freezing Drizzle", "🌧️"];
            if ([61, 63, 65].includes(code)) return ["Rain", "🌧️"];
            if ([66, 67].includes(code)) return ["Freezing Rain", "🌧️"];
            if ([71, 73, 75, 77].includes(code)) return ["Snow", "❄️"];
            if ([80, 81, 82].includes(code)) return ["Rain Showers", "🌦️"];
            if ([85, 86].includes(code)) return ["Snow Showers", "🌨️"];
            if (code === 95) return ["Thunderstorm", "⛈️"];
            if ([96, 99].includes(code)) return ["Thunderstorm with Hail", "⛈️"];


            return ["Unknown Weather", "🌍"];
        }


        const result = getWeatherDescription(weather.weather_code);


        const temperature = Math.round(weather.temperature_2m);
        const humidity = weather.relative_humidity_2m;
        const windSpeed = weather.wind_speed_10m;


        weatherInfo.innerHTML = `
            <h2>${location.name}, ${location.country}</h2>


            <div class="weather-icon">${result[1]}</div>


            <p class="temperature">${temperature}°C</p>


            <p><strong>Condition:</strong> ${result[0]}</p>


            <p><strong>Feels Like:</strong>
                ${Math.round(weather.apparent_temperature)}°C
            </p>


            <p><strong>Humidity:</strong> ${humidity}%</p>


            <p><strong>Wind Speed:</strong> ${windSpeed} km/h</p>


            <p><strong>Precipitation:</strong>
                ${weather.precipitation} mm
            </p>
        `;


        message.textContent = "";


    } catch (error) {
        message.textContent =
            "City not found or unable to fetch weather. Please try again.";


        weatherInfo.innerHTML = "";
    }
}