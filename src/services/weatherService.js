
const API_KEY = "yourOpenWeatherMapApiKey"; // Замените на ваш ключ API
const CITY = "Krasnoyarsk";
const STORAGE_KEY = "cached_weather_data";
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 минут в миллисекундах

// Функция для получения метеоданных с API OpenWeatherMap
export const fetchWeatherData = async () => {
  try {
    // Using a free API key for demo purposes - in production, this should be an environment variable
    const API_KEY = '57c8334cee795a2093a42a368c50bfb2'; // Demo API key
    const city = 'Krasnoyarsk';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ru`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`);
    }
    
    const data = await response.json();

    // Get wind direction in text format
    const windDirectionText = getWindDirectionText(data.wind.deg);
    
    // Create weather data object
    const weatherData = {
      city: data.name,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      windSpeed: Math.round(data.wind.speed),
      windDirection: windDirectionText,
      humidity: data.main.humidity,
      pressure: Math.round(data.main.pressure * 0.750062), // Convert hPa to mmHg
      visibility: data.visibility / 1000, // Convert meters to kilometers
      icon: data.weather[0].icon,
      timestamp: Date.now()
    };
    
    // Сохраняем данные в localStorage для использования в офлайн режиме
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weatherData));
    
    return weatherData;
  } catch (error) {
    console.error("Ошибка при получении данных о погоде:", error);
    
    // Пробуем получить кэшированные данные
    return getCachedWeatherData();
  }
};

// Функция для получения кэшированных метеоданных
export const getCachedWeatherData = () => {
  const cachedData = localStorage.getItem(STORAGE_KEY);
  
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  
  // Если нет кэшированных данных, возвращаем заглушку
  return {
    city: CITY,
    temperature: 0,
    description: "Нет данных (офлайн режим)",
    windSpeed: 0,
    windDirection: "Н/Д",
    humidity: 0,
    pressure: 0,
    visibility: 0,
    icon: "50d", // Значок тумана как индикатор отсутствия данных
    timestamp: Date.now()
  };
};

// Функция для проверки необходимости обновления метеоданных
export const shouldUpdateWeatherData = () => {
  const cachedData = localStorage.getItem(STORAGE_KEY);
  
  if (!cachedData) {
    return true;
  }
  
  const parsedData = JSON.parse(cachedData);
  const currentTime = Date.now();
  
  // Проверяем, прошло ли больше CACHE_TIMEOUT с момента последнего обновления
  return currentTime - parsedData.timestamp > CACHE_TIMEOUT;
};

// Функция для получения направления ветра на основе градусов
const getWindDirection = (degrees) => {
  const directions = ["С", "ССВ", "СВ", "ВСВ", "В", "ВЮВ", "ЮВ", "ЮЮВ", "Ю", "ЮЮЗ", "ЮЗ", "ЗЮЗ", "З", "ЗСЗ", "СЗ", "ССЗ"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Функция для получения направления ветра на основе градусов в текстовом формате
const getWindDirectionText = (degrees) => {
  const directions = ["С", "ССВ", "СВ", "ВСВ", "В", "ВЮВ", "ЮВ", "ЮЮВ", "Ю", "ЮЮЗ", "ЮЗ", "ЗЮЗ", "З", "ЗСЗ", "СЗ", "ССЗ"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Функция для получения актуальных метеоданных с обновлением по необходимости
export const getWeatherData = async () => {
  if (navigator.onLine && shouldUpdateWeatherData()) {
    return await fetchWeatherData();
  }
  
  return getCachedWeatherData();
};

// Функция для периодического обновления метеоданных
export const startWeatherUpdates = () => {
  const intervalId = setInterval(async () => {
    if (navigator.onLine) {
      await fetchWeatherData();
      console.log("Метеоданные обновлены");
    }
  }, CACHE_TIMEOUT);
  
  // Возвращаем функцию для остановки обновлений
  return () => clearInterval(intervalId);
};

// Функция для получения заглушек данных при отсутствии сети
const getFallbackWeatherData = () => {
  return {
    city: CITY,
    temperature: 0,
    description: "Нет данных (отсутствие интернета)",
    windSpeed: 0,
    windDirection: "Н/Д",
    humidity: 0,
    pressure: 0,
    visibility: 0,
    icon: "50d", // Значок тумана как индикатор отсутствия данных
    timestamp: Date.now()
  };
};
