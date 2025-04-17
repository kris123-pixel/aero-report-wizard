
import React from 'react';

const WeatherInfo = ({ weather, refreshWeather, className = '' }) => {
  // Определяем классы для значений ветра
  const getWindClass = (speed) => {
    if (speed >= 10) return 'text-red-600 font-bold';
    if (speed >= 7) return 'text-orange-500 font-semibold';
    if (speed >= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={`weather-info ${className}`}>
      <div className="weather-icon">
        <img 
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
          alt={weather.description}
          width={50}
          height={50}
        />
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">
            Погодные условия - {weather.city}
          </h3>
          
          {refreshWeather && (
            <button 
              onClick={refreshWeather}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              title="Обновить данные о погоде"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Обновить
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mt-1">
          <div>
            <span className="font-medium text-gray-700">Температура:</span> {weather.temperature}°C, {weather.description}
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Ветер:</span> 
            <span className={getWindClass(weather.windSpeed)}> {weather.windSpeed} м/с</span>, 
            направление: {weather.windDirection}
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Влажность:</span> {weather.humidity}%
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Давление:</span> {weather.pressure} мм рт.ст.
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Видимость:</span> {weather.visibility} км
          </div>
          
          <div className="text-xs text-gray-500">
            Обновлено: {new Date(weather.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherInfo;
