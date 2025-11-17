<script setup>
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const weatherData = ref(null);
const forecastData = ref(null);
const city = ref('');
const loading = ref(false);
const error = ref(null);
const cityPredictions = ref([]);
const showPredictions = ref(false);
const selectedPrediction = ref(-1);
const isSelectingCity = ref(false);

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const toggleLanguage = () => {
  locale.value = locale.value === 'fi' ? 'en' : 'fi';
}

const setLanguage = (lang) => {
  locale.value = lang;
}

const fetchWeatherByCoords = async (lat, lon) => {
  loading.value = true;
  error.value = null;
  try {
    const lang = locale.value === 'fi' ? 'fi' : 'en';
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=${lang}&appid=${API_KEY}`
    )
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=${lang}&appid=${API_KEY}`
    )

    weatherData.value = await weatherResponse.json();
    forecastData.value = await forecastResponse.json();
  } catch (err) {
    error.value = t('app.errorFetch');
  } finally {
    loading.value = false;
  }
};

const fetchWeatherByCity = async (cityName = null) => {
  const searchCity = cityName || city.value;
  if (!searchCity.trim()) return

  loading.value = true
  error.value = null
  showPredictions.value = false
  cityPredictions.value = []
  selectedPrediction.value = -1
  try {
    const lang = locale.value === 'fi' ? 'fi' : 'en';
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&units=metric&lang=${lang}&appid=${API_KEY}`
    )
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&units=metric&lang=${lang}&appid=${API_KEY}`
    )

    weatherData.value = await weatherResponse.json()
    forecastData.value = await forecastResponse.json()
  } catch (err) {
    error.value = t('app.errorFetch');
  } finally {
    loading.value = false
  }
}

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        error.value = t('app.errorLocation');
      }
    )
  } else {
    error.value = t('app.errorBrowser');
  }
}

const getCityPredictions = async (query) => {
  if (!query || query.length < 2) {
    cityPredictions.value =[]
    showPredictions.value = false
    selectedPrediction.value = -1
    return
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
    )
    const data = await response.json()
    cityPredictions.value = data
    showPredictions.value = data.length > 0
    selectedPrediction.value = -1
  } catch (err) {
    console.error('Failed to fetch data', err)
  }
}

const selectCity = (prediction) => {
  isSelectingCity.value = true
  const cityName = prediction.name
  city.value = `${prediction.name}, ${prediction.country}`
  cityPredictions.value = []
  showPredictions.value = false
  selectedPrediction.value = -1

  setTimeout(() => {
    fetchWeatherByCity(cityName)
    isSelectingCity.value = false
  }, 0)
}

const handleKeydown = (event) => {
  if (!showPredictions.value || cityPredictions.value.length === 0) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedPrediction.value = Math.min(
      selectedPrediction.value + 1,
      cityPredictions.value.length - 1
    )
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedPrediction.value = Math.max(selectedPrediction.value - 1, -1)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    if (selectedPrediction.value >= 0) {
      selectCity(cityPredictions.value[selectedPrediction.value])
    } else {
      fetchWeatherByCity()
    }
  } else if (event.key === 'Escape') {
    showPredictions.value = false
    selectedPrediction.value = -1
  }
}

watch(city, (newValue) => {
  if (isSelectingCity.value) return

  if (newValue.length >= 2) {
    getCityPredictions(newValue)
  } else {
    cityPredictions.value = []
    showPredictions.value = false
    selectedPrediction.value = -1
  }
})

const getHourlyForecast = () => {
  if (!forecastData.value?.list) return []
  return forecastData.value.list.slice(0, 5)
}

const getDailyForecast = () => {
  if (!forecastData.value?.list) return []

  const dailyData = forecastData.value.list.filter(item => 
    item.dt_txt.includes('12:00:00')
  )

  return dailyData.slice(0, 5)
}

const getIcon = (iconCode) => {
  const iconMap = {
    200: 'wi:thunderstorm',
    201: 'wi:thunderstorm',
    202: 'wi:thunderstorm',
    210: 'wi:lightning',
    211: 'wi:lightning',
    212: 'wi:lightning',
    221: 'wi:lightning',
    230: 'wi:thunderstorm',
    231: 'wi:thunderstorm',
    232: 'wi:thunderstorm',
    
    300: 'wi:sprinkle',
    301: 'wi:sprinkle',
    302: 'wi:sprinkle',
    310: 'wi:sprinkle',
    311: 'wi:sprinkle',
    312: 'wi:sprinkle',
    313: 'wi:sprinkle',
    314: 'wi:sprinkle',
    321: 'wi:sprinkle',
    
    500: 'wi:rain',
    501: 'wi:rain',
    502: 'wi:rain',
    503: 'wi:rain',
    504: 'wi:rain',
    511: 'wi:rain-mix',
    520: 'wi:showers',
    521: 'wi:showers',
    522: 'wi:showers',
    531: 'wi:showers',
    
    600: 'wi:snow',
    601: 'wi:snow',
    602: 'wi:snow',
    611: 'wi:sleet',
    612: 'wi:sleet',
    613: 'wi:sleet',
    615: 'wi:rain-mix',
    616: 'wi:rain-mix',
    620: 'wi:snow',
    621: 'wi:snow',
    622: 'wi:snow',
    
    701: 'wi:fog',
    711: 'wi:smoke',
    721: 'wi:day-haze',
    731: 'wi:dust',
    741: 'wi:fog',
    751: 'wi:dust',
    761: 'wi:dust',
    762: 'wi:volcano',
    771: 'wi:strong-wind',
    781: 'wi:tornado',
    
    800: 'wi:day-sunny',
    
    801: 'wi:day-cloudy',
    802: 'wi:cloud',
    803: 'wi:cloudy',
    804: 'wi:cloudy',
  };
  return iconMap[iconCode] || 'wi:day-sunny';
}

watch(locale, () => {
  if (weatherData.value && weatherData.value.coord) {
    fetchWeatherByCoords(weatherData.value.coord.lat, weatherData.value.coord.lon);
  }
})

</script>

<template>
  <div class="weather-app">
    <header>
      <div class="header-top">
        <h1>{{ t('app.title') }}</h1>
        <div class="language-toggle">
          <button
            @click="setLanguage('fi')"
            :class="{ active: locale === 'fi' }"
          >
            FI
          </button>
          <button
            @click="setLanguage('en')"
            :class="{ active: locale === 'en' }"
          >
            EN
          </button>
        </div>
      </div>
      <div class="search-container">
        <div class="search-bar">
          <div class="input-wrapper">
            <input
              v-model="city"
              @keydown="handleKeydown"
              @blur="setTimeout(() => showPredictions = false, 300)"
              type="text"
              :placeholder="t('app.enterCity')"
            />
            <div v-if="showPredictions && cityPredictions.length > 0" class="predictions">
              <div
                v-for="(prediction, index) in cityPredictions"
                :key="`${prediction.lat}-${prediction.lon}`"
                @click="selectCity(prediction)"
                @mousedown.prevent
                class="prediction-item"
                :class="{ active: index === selectedPrediction }"
              >
                {{ prediction.name }}, {{ prediction.state ? prediction.state + ', ' : '' }}{{ prediction.country }}
              </div>
            </div>
          </div>
          <button @click="fetchWeatherByCity()">{{ t('app.search') }}</button>
          <button @click="getUserLocation">{{ t('app.useLocation') }}</button>
        </div>
      </div>
    </header>

    <main>
      <div v-if="loading" class="loading">{{ t('app.loading') }}</div>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="weatherData && !loading" class="weather-content">
        <div class="current-weather">
          <h2>{{ weatherData.name }}, {{ weatherData.sys?.country }}</h2>
          <Icon
            :icon="getIcon(weatherData.weather?.[0]?.id)"
            width="100"
            height="100"
            class="weather-icon-large"
          />
          <div class="temp">{{ Math.round(weatherData.main?.temp) }}°C</div>
          <div class="description">{{ weatherData.weather?.[0]?.description }}</div>
          <div class="details">
            <p>{{ t('weather.feelsLike') }}: {{ Math.round(weatherData.main?.feels_like) }}°C</p>
            <p>{{ t('weather.humidity') }}: {{ weatherData.main?.humidity }}%</p>
            <p>{{ t('weather.wind') }}: {{ Math.round(weatherData.wind?.speed) }} m/s</p>
          </div>
        </div>

        <div v-if="forecastData" class="hourly-forecast">
          <h3>{{ t('weather.hourlyForecast') }}</h3>
          <div class="hourly-grid">
            <div
              v-for="(hour, index) in getHourlyForecast()"
              :key="index"
              class="hourly-card"
            >
              <p class="hourly-time">{{ new Date(hour.dt_txt).toLocaleTimeString(locale === 'fi' ? 'fi-FI' : 'en-US', { hour: 'numeric', minute: '2-digit' }) }}</p>
              <Icon
                :icon="getIcon(hour.weather?.[0]?.id)"
                width="50"
                height="50"
                class="weather-icon-small"
               />
              <div class="hourly-temp">{{ Math.round(hour.main?.temp) }}°C</div>
              <div class="hourly-description">{{ hour.weather?.[0]?.description }}</div>
              <p class="hourly-humidity">{{ hour.main?.humidity }}%</p>
            </div>
          </div>
        </div>

        <div v-if="forecastData" class="forecast">
          <h3>{{ t('weather.dailyForecast') }}</h3>
          <div class="forecast-grid">
            <div
              v-for="(day, index) in getDailyForecast()"
              :key="index"
              class="forecast-card"
            >
              <p class="forecast-date">{{ new Date(day.dt_txt).toLocaleDateString(locale === 'fi' ? 'fi-FI' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }}</p>
              <Icon
                :icon="getIcon(day.weather?.[0]?.id)"
                width="70"
                height="70"
                class="weather-icon-medium"
               />
              <div class="forecast-temp">{{ Math.round(day.main?.temp) }}°C</div>
              <div class="forecast-description">{{ day.weather?.[0]?.description }}</div>
              <p>{{ day.main?.humidity }}% {{ t('weather.humidity') }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}

#app {
  display: flex;
  justify-content: center;
  min-height: 100vh;
}
</style>

<style scoped>
.weather-app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

header {
  text-align: center;
  margin-bottom: 3rem;
  width: 100%;
}

.header-top {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  position: relative;
}

h1 {
  margin: 0;
}

.language-toggle {
  display: flex;
  gap: 0.5rem;
  position: absolute;
  right: 0;
}

.language-toggle button {
  padding: 0.5rem 1rem;
  background-color: white;
  color: black;
  border: 2px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.language-toggle button:hover {
  background-color: white;
}

.language-toggle button.active {
  background-color: blue;
  color: white;
  border-color: blue;
}

.language-toggle:hover {
  background-color: blue;
}

.search-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.search-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.input-wrapper {
  position: relative;
}

.search-bar input {
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  width: 300px;
}

.predictions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.prediction-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  color: black;
}

.prediction-item:hover,
.prediction-item.active {
  background-color: aqua;
}

.prediction-item:last-child {
  border-bottom: none;
}

.search-bar button {
  padding: 0.75rem 1rem;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.search-bar button:hover {
  background-color: blue;
}

main {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error {
  color: red;
}

.weather-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.current-weather {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, blue 0%, lightblue 100%);
  color: white;
  border-radius: 1rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;
}

.weather-icon-large {
  margin: 1rem 0;
}

.weather-icon-medium {
  margin: 0.5rem 0;
}

.weather-icon-small {
  margin: 0.5rem 0;
}

.temp {
  font-size: 4rem;
  font-weight: bold;
  margin: 1rem 0;
}

.description {
  font-size: 1.5rem;
  text-transform: capitalize;
  margin-bottom: 1rem;
}

.details {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.hourly-forecast {
  padding: 1rem;
  width: 100%;
  max-width: 1000px;
  margin-bottom: 2rem;
}

.hourly-forecast h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.hourly-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  overflow-x: auto;
}

.hourly-card {
  background: linear-gradient(135deg, blue 0%, lightblue 100%);
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  min-width: 120px;
}

.hourly-time {
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.hourly-temp {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.hourly-description {
  text-transform: capitalize;
  font-size: 0.85rem;
  margin: 0.5rem 0;
}

.hourly-humidity {
  font-size: 0.85rem;
  margin: 0.5rem;
}

.forecast {
  padding: 1rem;
  width: 100%;
  max-width: 1000px;
}

.forecast h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  justify-items: center;
}

.forecast-card {
  background: linear-gradient(135deg, blue 0%, lightblue 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  text-align: center;
  width: 100%;
}

.forecast-date {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.forecast-temp {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.forecast-description {
  text-transform: capitalize;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .forecast-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hourly-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .search-bar {
    flex-direction: column;
  }

  .search-bar input {
    width: 100%;
  }

  .header-top {
    flex-direction: column;
    gap: 1rem;
  }

  .language-toggle {
    position: static;
  }
}
</style>
