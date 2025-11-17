import { createI18n } from "vue-i18n";

const messages = {
    en: {
        app: {
            title: 'Weather App',
            search: 'Search',
            useLocation: 'Use Current Location',
            enterCity: 'Enter city',
            loading: 'Loading...',
            errorFetch: 'Failed to fetch weather data',
            errorLocation: 'Failed to get location',
            errorBrowser: 'Location not supported by browser'
        },
        weather: {
            feelsLike: 'Feels like:',
            humidity: 'Humidity',
            wind: 'Wind',
            hourlyForecast: 'Hourly Forecast',
            dailyForecast: '5-day Forecast'
        }
    },
    fi: {
        app: {
            title: 'Sääsovellus',
            search: 'Hae',
            useLocation: 'Käytä nykyistä sijaintia',
            enterCity: 'Syötä kaupunki',
            loading: 'Ladataan...',
            errorFetch: 'Säätietojen hakeminen epäonnistui',
            errorLocation: 'Sijainnin hakeminen epäonnistui',
            errorBrowser: 'Sijaintia ei tueta selaimessa'
        },
        weather: {
            feelsLike: 'Tuntuu kuin:',
            humidity: 'Ilmankosteus',
            wind: 'Tuuli',
            hourlyForecast: 'Tuntikohtainen ennuste',
            dailyForecast: 'Viiden päivän ennuste'
        }
    }
}

const translations = createI18n({
    locale: 'fi',
    fallbackLocale: 'fi',
    messages
})

export default translations