const apiKey = "115c390978839ed7bbc7572cf3161e0d"; 

const searchBtn = document.getElementById("searchBtn") as HTMLButtonElement;
const cityInput = document.getElementById("cityInput") as HTMLInputElement;
const weatherResult = document.getElementById(
  "weatherResult"
) as HTMLDivElement;
const suggestionsBox = document.getElementById("suggestions") as HTMLDivElement;
const forecastBox = document.getElementById("forecast") as HTMLDivElement;

interface WeatherData {
  name: string;
  main: { temp: number; humidity: number };
  weather: { description: string; icon: string }[];
  coord?: { lat: number; lon: number };
}

async function getWeatherByCity(city: string) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("City not found");

    const data: WeatherData = await response.json();
    displayWeather(data);
    getForecast(data.coord!.lat, data.coord!.lon);
  } catch (error) {
    weatherResult.innerHTML = `<p style="color:red">${
      (error as Error).message
    }</p>`;
  }
}

async function getWeatherByCoords(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("Location not found");

    const data: WeatherData = await response.json();
    displayWeather(data);
    getForecast(lat, lon);
  } catch (error) {
    weatherResult.innerHTML = `<p style="color:red">${
      (error as Error).message
    }</p>`;
  }
}

function displayWeather(data: WeatherData) {
  const { name, main, weather } = data;
  const icon = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  weatherResult.innerHTML = `
    <h2>${name}</h2>
    <p>${weather[0].description}</p>
    <img src="${icon}" alt="Weather icon"/>
    <p>🌡 Temp: ${main.temp}°C</p>
    <p>💧 Humidity: ${main.humidity}%</p>
  `;
}

async function getForecast(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("Forecast not available");
    const data = await response.json();

    const daily: { [key: string]: any[] } = {};
    data.list.forEach((entry: any) => {
      const date = new Date(entry.dt * 1000).toLocaleDateString();
      if (!daily[date]) daily[date] = [];
      daily[date].push(entry);
    });

    const days = Object.keys(daily).slice(0, 5);
    forecastBox.innerHTML = days
      .map((date) => {
        const entries = daily[date];
        const midday =
          entries.find((e) => e.dt_txt.includes("12:00:00")) || entries[0];
        return renderForecastCard(midday, date);
      })
      .join("");
  } catch (error) {
    forecastBox.innerHTML = `<p style="color:red">${
      (error as Error).message
    }</p>`;
  }
}

function renderForecastCard(entry: any, date: string) {
  const { main, weather } = entry;
  const icon = `https://openweathermap.org/img/wn/${weather[0].icon}.png`;
  return `
    <div class="forecast-day">
      <h4>${date}</h4>
      <img src="${icon}" alt="icon"/>
      <p>${weather[0].description}</p>
      <p>🌡 ${main.temp.toFixed(1)}°C</p>
    </div>
  `;
}

async function fetchCitySuggestions(query: string) {
  if (!query) {
    suggestionsBox.innerHTML = "";
    return;
  }
  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
  );
  const cities = await response.json();

  suggestionsBox.innerHTML = "";
  cities.forEach((city: any) => {
    const item = document.createElement("div");
    item.classList.add("suggestion-item");
    item.textContent = `${city.name}, ${city.country}`;
    item.addEventListener("click", () => {
      cityInput.value = city.name;
      suggestionsBox.innerHTML = "";
      getWeatherByCoords(city.lat, city.lon);
    });
    suggestionsBox.appendChild(item);
  });
}

function debounce(func: Function, delay: number) {
  let timer: number;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => func(...args), delay);
  };
}

const debouncedFetch = debounce(fetchCitySuggestions, 500);

cityInput.addEventListener("input", (e) => {
  debouncedFetch((e.target as HTMLInputElement).value);
});

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeatherByCity(city);
});

window.addEventListener("load", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        weatherResult.innerHTML = `<p style="color:yellow;">⚠️ Location blocked. Search manually.</p>`;
      }
    );
  }
});
