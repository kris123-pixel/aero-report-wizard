
import React, { useRef } from 'react';
import { Report, FormSection, FormItem } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WeatherInfo from './WeatherInfo';
import { generatePDF, saveAsJson } from '../services/pdfService';

interface ReportPreviewProps {
  report: Report;
  onClose: () => void;
  onEdit: () => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ report, onClose, onEdit }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPdf = async () => {
    if (reportRef.current) {
      try {
        await generatePDF(report, 'report-preview-content');
      } catch (error) {
        console.error('Ошибка при генерации PDF:', error);
      }
    }
  };

  const handleExportJson = () => {
    try {
      saveAsJson(report);
    } catch (error) {
      console.error('Ошибка при экспорте в JSON:', error);
    }
  };

  // Функция для рендеринга элементов формы с вложенностью
  const renderFormItems = (items: FormItem[], level: number = 0) => {
    return items.map((item) => (
      <div key={item.id} className="mb-2" style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-start">
          {item.type === 'checkbox' && (
            <div className="flex items-center h-5 mr-2">
              <input
                type="checkbox"
                checked={item.isChecked}
                readOnly
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          )}
          <div className="flex-1">
            <p className={`${item.isChecked ? 'line-through text-gray-500' : ''}`}>
              {item.content}
            </p>
            
            {item.type === 'text' && item.value && (
              <div className="ml-4 mt-1 text-sm bg-gray-50 p-1 rounded">
                <span className="font-medium">Текст:</span> {item.value}
              </div>
            )}
            
            {item.type === 'number' && item.value && (
              <div className="ml-4 mt-1 text-sm bg-gray-50 p-1 rounded">
                <span className="font-medium">Значение:</span> {item.value}
              </div>
            )}
            
            {item.type === 'select' && item.value && (
              <div className="ml-4 mt-1 text-sm bg-gray-50 p-1 rounded">
                <span className="font-medium">Выбрано:</span> {item.value}
              </div>
            )}
          </div>
        </div>
        
        {item.children && item.children.length > 0 && (
          <div className="mt-2">
            {renderFormItems(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Просмотр отчета</h2>
        <div className="flex space-x-2">
          <Button onClick={handleExportPdf}>Экспорт в PDF</Button>
          <Button onClick={handleExportJson} variant="outline">Экспорт в JSON</Button>
          <Button onClick={onEdit} variant="secondary">Редактировать</Button>
          <Button onClick={onClose} variant="ghost">Закрыть</Button>
        </div>
      </div>
      
      <div ref={reportRef} id="report-preview-content" className="bg-white p-6 rounded-lg shadow">
        <WeatherInfo weather={report.weather} className="mb-6" />
        
        <h1 className="text-2xl font-bold mb-2">{report.name}</h1>
        <p className="text-gray-600 mb-4">Дата: {report.date}</p>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Информация о дроне</h2>
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-medium">{report.drone.name}</span>
                <span className="text-sm text-gray-500 ml-2">({report.drone.model})</span>
              </div>
              <span className="drone-badge">БПЛА</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Макс. время полета:</span> {report.drone.specifications.maxFlightTime} мин
              </div>
              <div>
                <span className="font-medium">Макс. скорость:</span> {report.drone.specifications.maxSpeed} км/ч
              </div>
              <div>
                <span className="font-medium">Макс. высота:</span> {report.drone.specifications.maxAltitude} м
              </div>
              <div>
                <span className="font-medium">Макс. дальность:</span> {report.drone.specifications.maxRange} км
              </div>
              <div>
                <span className="font-medium">Вес:</span> {report.drone.specifications.weight} г
              </div>
              <div>
                <span className="font-medium">Габариты:</span> {report.drone.specifications.dimensions.length} x {report.drone.specifications.dimensions.width} x {report.drone.specifications.dimensions.height} см
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {report.sections.map((section) => (
            <div key={section.id} className="border-t pt-4">
              <h3 className="text-xl font-semibold mb-3">{section.title}</h3>
              <div className="space-y-1">
                {renderFormItems(section.items)}
              </div>
            </div>
          ))}
        </div>
        
        {report.notes && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Примечания</h3>
            <p className="text-gray-700 whitespace-pre-line">{report.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPreview;
