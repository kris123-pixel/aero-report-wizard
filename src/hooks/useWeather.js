
import { useState, useEffect } from 'react';
import { getWeatherData, startWeatherUpdates } from '../services/weatherService';

export const useWeather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const data = await getWeatherData();
        setWeather(data);
        setError(null);
      } catch (err) {
        setError('Не удалось получить данные о погоде');
        console.error('Ошибка при получении погоды:', err);
      } finally {
        setLoading(false);
      }
    };

    // Получаем погоду при загрузке компонента
    fetchWeather();

    // Запускаем периодическое обновление погоды
    const stopWeatherUpdates = startWeatherUpdates();

    // Создаём слушатель событий для проверки доступа к сети
    const handleOnline = () => {
      console.log('Сеть подключена. Обновляем данные о погоде...');
      fetchWeather();
    };

    window.addEventListener('online', handleOnline);

    // Очищаем ресурсы при размонтировании
    return () => {
      stopWeatherUpdates();
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Функция для принудительного обновления погоды
  const refreshWeather = async () => {
    try {
      setLoading(true);
      const data = await getWeatherData();
      setWeather(data);
      setError(null);
    } catch (err) {
      setError('Не удалось обновить данные о погоде');
      console.error('Ошибка при обновлении погоды:', err);
    } finally {
      setLoading(false);
    }
  };

  return { weather, loading, error, refreshWeather };
};
