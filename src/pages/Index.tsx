import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import WeatherInfo from '../components/WeatherInfo';
import ReportForm from '../components/ReportForm';
import ReportList from '../components/ReportList';
import ReportPreview from '../components/ReportPreview';
import Wizard from '../components/Wizard';
import { WizardStep } from '../types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generatePDF, saveAsJson } from '../services/pdfService';

const Index = () => {
  const {
    reports,
    droneTemplates,
    reportTemplates,
    sectionTemplates,
    currentReport,
    weatherData,
    loading,
    showWizard,
    filter,
    
    createNewReport,
    saveReport,
    loadReport,
    deleteReport,
    
    toggleWizard,
    closeWizard,
    
    setFilter,
    applyFilter
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<string>('reports');
  const [viewReportId, setViewReportId] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<boolean>(false);
  const [editingReport, setEditingReport] = useState<boolean>(false);

  useEffect(() => {
    if (!filter.sortBy) {
      setFilter({
        sortBy: 'date',
        sortOrder: 'desc',
        droneModel: '_all'
      });
    }
  }, [filter, setFilter]);

  const handleCreateReport = () => {
    createNewReport('Новый отчет');
    setActiveTab('create');
    setEditingReport(true);
  };

  const handleViewReport = async (id: string) => {
    await loadReport(id);
    setViewReportId(id);
    setViewingReport(true);
  };

  const handleEditReport = () => {
    setViewingReport(false);
    setEditingReport(true);
    setActiveTab('create');
  };

  const handleClosePreview = () => {
    setViewingReport(false);
    setViewReportId(null);
  };

  const handleExportToPdf = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      try {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.id = 'temp-report-container';
        document.body.appendChild(tempDiv);
        
        tempDiv.innerHTML = `
          <div id="export-report" class="bg-white p-6 max-w-4xl mx-auto">
            <div class="weather-info mb-6">
              <h3 class="font-semibold mb-2">Погодные условия - ${report.weather.city}</h3>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>Температура: ${report.weather.temperature}°C, ${report.weather.description}</div>
                <div>Ветер: ${report.weather.windSpeed} м/с, направление: ${report.weather.windDirection}</div>
                <div>Влажность: ${report.weather.humidity}%</div>
                <div>Давление: ${report.weather.pressure} мм рт.ст.</div>
                <div>Видимость: ${report.weather.visibility} км</div>
              </div>
            </div>
            
            <h1 class="text-2xl font-bold mb-2">${report.name}</h1>
            <p class="text-gray-600 mb-4">Дата: ${report.date}</p>
            
            <div class="mb-6">
              <h2 class="text-lg font-semibold mb-2">Информация о дроне</h2>
              <div class="p-3 rounded-md border">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <span class="font-medium">${report.drone.name}</span>
                    <span class="text-sm text-gray-500 ml-2">(${report.drone.model})</span>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>Макс. время полета: ${report.drone.specifications.maxFlightTime} мин</div>
                  <div>Макс. скорость: ${report.drone.specifications.maxSpeed} км/ч</div>
                  <div>Макс. высота: ${report.drone.specifications.maxAltitude} м</div>
                  <div>Макс. дальность: ${report.drone.specifications.maxRange} км</div>
                  <div>Вес: ${report.drone.specifications.weight} г</div>
                </div>
              </div>
            </div>
            
            <div class="space-y-6">
              ${report.sections.map(section => `
                <div class="border-t pt-4">
                  <h3 class="text-xl font-semibold mb-3">${section.title}</h3>
                  <div class="space-y-1">
                    ${renderFormItemsForExport(section.items)}
                  </div>
                </div>
              `).join('')}
            </div>
            
            ${report.notes ? `
              <div class="mt-6 border-t pt-4">
                <h3 class="text-lg font-semibold mb-2">Примечания</h3>
                <p class="text-gray-700">${report.notes}</p>
              </div>
            ` : ''}
          </div>
        `;
        
        await generatePDF(report, 'export-report');
        
        document.body.removeChild(tempDiv);
      } catch (error) {
        console.error('Ошибка при экспорте в PDF:', error);
      }
    }
  };

  const renderFormItemsForExport = (items: any[], level: number = 0) => {
    return items.map(item => `
      <div style="margin-left: ${level * 20}px; margin-bottom: 8px;">
        <div class="flex items-start">
          ${item.type === 'checkbox' ? `
            <div class="flex items-center h-5 mr-2">
              <input
                type="checkbox"
                ${item.isChecked ? 'checked' : ''}
                disabled
                class="w-4 h-4 border-gray-300 rounded"
              />
            </div>
          ` : ''}
          <div class="flex-1">
            <p class="${item.isChecked ? 'line-through text-gray-500' : ''}">
              ${item.content}
            </p>
            
            ${item.type === 'text' && item.value ? `
              <div class="ml-4 mt-1 text-sm p-1 rounded">
                <span class="font-medium">Текст:</span> ${item.value}
              </div>
            ` : ''}
            
            ${item.type === 'number' && item.value ? `
              <div class="ml-4 mt-1 text-sm p-1 rounded">
                <span class="font-medium">Значение:</span> ${item.value}
              </div>
            ` : ''}
            
            ${item.type === 'select' && item.value ? `
              <div class="ml-4 mt-1 text-sm p-1 rounded">
                <span class="font-medium">Выбрано:</span> ${item.value}
              </div>
            ` : ''}
          </div>
        </div>
        
        ${item.children && item.children.length > 0 ? `
          <div class="mt-2">
            ${renderFormItemsForExport(item.children, level + 1)}
          </div>
        ` : ''}
      </div>
    `).join('');
  };

  const handleExportToJson = async (reportId: string): Promise<void> => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      saveAsJson(report);
    }
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'step-1',
      title: 'Добро пожаловать!',
      content: (
        <div>
          <p>Добро пожаловать в редактор отчетов о полетах БПЛА!</p>
          <p className="mt-2">Это приложение поможет вам создавать, редактировать и управлять отчетами о полетах дронов.</p>
        </div>
      ),
      target: '.weather-info'
    },
    {
      id: 'step-2',
      title: 'Метеоданные',
      content: (
        <div>
          <p>В начале каждого отчета отображаются актуальные метеоданные для г. Красноярск.</p>
          <p className="mt-2">Эти данные обновляются каждые 5 минут при наличии интернет-соединения и сохраняются для работы в офлайн режиме.</p>
        </div>
      ),
      target: '.weather-info'
    },
    {
      id: 'step-3',
      title: 'История отчетов',
      content: (
        <div>
          <p>На вкладке "Отчеты" вы можете просматривать историю ранее созданных отчетов.</p>
          <p className="mt-2">Здесь доступна фильтрация по дате и модели дрона, а также сортировка по различным параметрам.</p>
        </div>
      ),
      target: '#reports-list'
    },
    {
      id: 'step-4',
      title: 'Создание отчета',
      content: (
        <div>
          <p>Для создания нового отчета нажмите кнопку "Создать отчет".</p>
          <p className="mt-2">Вы можете выбрать шаблон отчета или создать его структуру с нуля.</p>
        </div>
      ),
      target: '#create-report-button'
    },
    {
      id: 'step-5',
      title: 'Разделы отчета',
      content: (
        <div>
          <p>В отчет можно добавлять различные разделы, например "Предварительная подготовка", "Взлет", "Полет по маршруту" и т.д.</p>
          <p className="mt-2">Каждый раздел может содержать любое количество пунктов.</p>
        </div>
      ),
      target: '#add-section-button'
    },
    {
      id: 'step-6',
      title: 'Сохранение отчета',
      content: (
        <div>
          <p>После заполнения всех необходимых данных нажмите кнопку "Сохранить отчет".</p>
          <p className="mt-2">Отчет будет сохранен в локальной базе данных и доступен для экспорта в форматы PDF и JSON.</p>
        </div>
      ),
      target: '#save-report-button'
    }
  ];

  if (loading || !weatherData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="mb-4">
            <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-lg font-medium">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Редактор отчетов о полетах БПЛА</h1>
            <p className="text-gray-600">Создание и управление отчетами о полетах беспилотных летательных аппаратов</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              id="create-report-button"
              onClick={handleCreateReport}
              size="lg"
            >
              Создать отчет
            </Button>
          </div>
        </div>
      </header>

      {viewingReport && currentReport ? (
        <ReportPreview
          report={currentReport}
          onClose={handleClosePreview}
          onEdit={handleEditReport}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="reports">Отчеты</TabsTrigger>
            <TabsTrigger value="create">Создать/Редактировать</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reports">
            <ReportList
              reports={reports}
              droneTemplates={droneTemplates}
              filter={filter}
              onFilterChange={setFilter}
              onApplyFilter={applyFilter}
              onView={handleViewReport}
              onDelete={deleteReport}
              onExportPdf={handleExportToPdf}
              onExportJson={handleExportToJson}
            />
          </TabsContent>
          
          <TabsContent value="create">
            {currentReport && editingReport ? (
              <ReportForm
                initialReport={currentReport}
                weatherData={weatherData}
                droneTemplates={droneTemplates}
                reportTemplates={reportTemplates}
                sectionTemplates={sectionTemplates}
                onSave={saveReport}
                refreshWeather={async () => {}}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Создать новый отчет</CardTitle>
                  <CardDescription>
                    Нажмите кнопку "Создать отчет", чтобы начать работу с новым отчетом
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleCreateReport}>Создать отчет</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
      
      {showWizard && (
        <Wizard
          steps={wizardSteps}
          onComplete={closeWizard}
        />
      )}
      
      <footer className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
        <p>&copy; 2025 Редактор отчетов о полетах БПЛА</p>
        <button
          onClick={toggleWizard}
          className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
        >
          Показать руководство
        </button>
      </footer>
    </div>
  );
};

export default Index;
