
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Report, FormSection, FormItem } from '../types';
import { format } from 'date-fns';

export const generatePDF = async (report: Report, elementId: string): Promise<string> => {
  try {
    // Создаем новый PDF документ
    const pdf = new jsPDF('p', 'mm', 'a4');
    const reportElement = document.getElementById(elementId);
    
    if (!reportElement) {
      throw new Error('Элемент отчета не найден');
    }
    
    // Преобразуем HTML в Canvas
    const canvas = await html2canvas(reportElement, {
      scale: 2, // Увеличиваем масштаб для лучшего качества
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Определяем размеры PDF страницы
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Определяем размеры изображения с сохранением пропорций
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;
    
    let imgWidth = pdfWidth;
    let imgHeight = imgWidth / ratio;
    
    // Если изображение слишком высокое, разбиваем его на несколько страниц
    let heightLeft = imgHeight;
    let position = 0;
    
    // Добавляем первую страницу
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
    
    // Добавляем дополнительные страницы, если необходимо
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    
    // Сохраняем PDF
    const fileName = `${report.name.replace(/\s+/g, '_')}_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`;
    pdf.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Ошибка при генерации PDF:', error);
    throw error;
  }
};

export const generateTextReport = (report: Report): string => {
  let text = `Отчет о полете БПЛА: ${report.name}\n`;
  text += `Дата: ${report.date}\n`;
  text += `Метеоданные для г. ${report.weather.city}:\n`;
  text += `  Температура: ${report.weather.temperature}°C\n`;
  text += `  Описание: ${report.weather.description}\n`;
  text += `  Скорость ветра: ${report.weather.windSpeed} м/с, направление: ${report.weather.windDirection}\n`;
  text += `  Влажность: ${report.weather.humidity}%\n`;
  text += `  Давление: ${report.weather.pressure} мм рт.ст.\n`;
  text += `  Видимость: ${report.weather.visibility} км\n\n`;
  
  text += `Параметры дрона (${report.drone.name} - ${report.drone.model}):\n`;
  text += `  Макс. время полета: ${report.drone.specifications.maxFlightTime} мин\n`;
  text += `  Макс. скорость: ${report.drone.specifications.maxSpeed} км/ч\n`;
  text += `  Макс. высота: ${report.drone.specifications.maxAltitude} м\n`;
  text += `  Макс. дальность: ${report.drone.specifications.maxRange} км\n`;
  text += `  Вес: ${report.drone.specifications.weight} г\n\n`;
  
  // Добавляем разделы и их элементы
  report.sections.forEach(section => {
    text += `## ${section.title}\n`;
    
    // Функция для рекурсивного добавления элементов с учетом вложенности
    const addItems = (items: FormItem[], level: number) => {
      items.forEach(item => {
        const indent = '  '.repeat(level);
        const checkMark = item.isChecked ? '[x]' : '[ ]';
        text += `${indent}${checkMark} ${item.content}\n`;
        
        if (item.type === 'text' || item.type === 'number') {
          text += `${indent}    Значение: ${item.value || ''}\n`;
        } else if (item.type === 'select' && item.value) {
          text += `${indent}    Выбрано: ${item.value}\n`;
        }
        
        if (item.children && item.children.length > 0) {
          addItems(item.children, level + 1);
        }
      });
    };
    
    addItems(section.items, 1);
    text += '\n';
  });
  
  // Добавляем примечания, если они есть
  if (report.notes) {
    text += `Примечания:\n${report.notes}\n`;
  }
  
  return text;
};

export const saveAsJson = (report: Report): string => {
  const fileName = `${report.name.replace(/\s+/g, '_')}_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.json`;
  const dataStr = JSON.stringify(report, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = fileName;
  link.click();
  
  return fileName;
};
