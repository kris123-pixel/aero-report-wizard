
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Report, 
  DroneTemplate, 
  ReportTemplate, 
  SectionTemplate, 
  WeatherData,
  WizardStep,
  ReportFilter
} from '../types';
import { db, initDemoData } from '../services/databaseService';
import { getWeatherData, startWeatherUpdates } from '../services/weatherService';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface AppContextProps {
  // Состояние приложения
  reports: Report[];
  droneTemplates: DroneTemplate[];
  reportTemplates: ReportTemplate[];
  sectionTemplates: SectionTemplate[];
  currentReport: Report | null;
  weatherData: WeatherData | null;
  loading: boolean;
  showWizard: boolean;
  filter: ReportFilter;
  
  // Методы для управления отчетами
  createNewReport: (name: string) => void;
  saveReport: (report: Report) => Promise<void>;
  loadReport: (id: string) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  exportReportToPdf: (reportId: string) => Promise<void>;
  exportReportToJson: (reportId: string) => Promise<void>;
  
  // Методы для управления шаблонами
  saveReportTemplate: (template: ReportTemplate) => Promise<void>;
  saveSectionTemplate: (template: SectionTemplate) => Promise<void>;
  saveDroneTemplate: (template: DroneTemplate) => Promise<void>;
  
  // Методы для wizard
  toggleWizard: () => void;
  closeWizard: () => void;
  
  // Методы для фильтрации
  setFilter: (filter: ReportFilter) => void;
  applyFilter: () => Promise<void>;
}

const defaultFilter: ReportFilter = {
  sortBy: 'date',
  sortOrder: 'desc'
};

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Состояние приложения
  const [reports, setReports] = useState<Report[]>([]);
  const [droneTemplates, setDroneTemplates] = useState<DroneTemplate[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [sectionTemplates, setSectionTemplates] = useState<SectionTemplate[]>([]);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [filter, setFilter] = useState<ReportFilter>(defaultFilter);
  
  // Инициализация данных
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Инициализируем демо-данные, если необходимо
        await initDemoData();
        
        // Загружаем данные из базы
        const loadedDroneTemplates = await db.getAllDroneTemplates();
        const loadedReportTemplates = await db.getAllReportTemplates();
        const loadedSectionTemplates = await db.getAllSectionTemplates();
        const loadedReports = await db.filterReports(filter);
        
        // Получаем метеоданные
        const weather = await getWeatherData();
        
        // Обновляем состояние
        setDroneTemplates(loadedDroneTemplates);
        setReportTemplates(loadedReportTemplates);
        setSectionTemplates(loadedSectionTemplates);
        setReports(loadedReports);
        setWeatherData(weather);
        
        // Запускаем периодическое обновление метеоданных
        const stopWeatherUpdates = startWeatherUpdates();
        
        // Проверяем, нужно ли показывать мастер настройки
        const wizardShown = localStorage.getItem('wizardShown');
        if (!wizardShown) {
          setShowWizard(true);
          localStorage.setItem('wizardShown', 'true');
        }
        
        setLoading(false);
        
        // Очищаем при размонтировании
        return () => {
          stopWeatherUpdates();
        };
      } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        setLoading(false);
      }
    };
    
    initializeApp();
  }, []);
  
  // Обновление отчетов при изменении фильтра
  const applyFilter = async () => {
    try {
      setLoading(true);
      const filteredReports = await db.filterReports(filter);
      setReports(filteredReports);
    } catch (error) {
      console.error('Ошибка при применении фильтра:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Методы для управления отчетами
  const createNewReport = async (name: string) => {
    if (!weatherData || droneTemplates.length === 0) return;
    
    const today = new Date();
    const formattedDate = format(today, 'dd.MM.yyyy');
    
    const newReport: Report = {
      id: uuidv4(),
      name,
      date: formattedDate,
      timestamp: today.getTime(),
      weather: weatherData,
      drone: droneTemplates[0], // По умолчанию берем первый шаблон дрона
      sections: [],
      notes: ''
    };
    
    setCurrentReport(newReport);
  };
  
  const saveReport = async (report: Report) => {
    try {
      await db.saveReport(report);
      
      // Обновляем список отчетов
      const updatedReports = await db.filterReports(filter);
      setReports(updatedReports);
      
      // Если это текущий отчет, обновляем его
      if (currentReport && currentReport.id === report.id) {
        setCurrentReport(report);
      }
    } catch (error) {
      console.error('Ошибка при сохранении отчета:', error);
      throw error;
    }
  };
  
  const loadReport = async (id: string) => {
    try {
      const report = await db.getReport(id);
      if (report) {
        setCurrentReport(report);
      }
    } catch (error) {
      console.error('Ошибка при загрузке отчета:', error);
      throw error;
    }
  };
  
  const deleteReport = async (id: string) => {
    try {
      await db.deleteReport(id);
      
      // Обновляем список отчетов
      const updatedReports = await db.filterReports(filter);
      setReports(updatedReports);
      
      // Если это текущий отчет, сбрасываем его
      if (currentReport && currentReport.id === id) {
        setCurrentReport(null);
      }
    } catch (error) {
      console.error('Ошибка при удалении отчета:', error);
      throw error;
    }
  };
  
  const exportReportToPdf = async (reportId: string) => {
    // Реализация в компоненте с использованием pdfService
  };
  
  const exportReportToJson = async (reportId: string) => {
    // Реализация в компоненте с использованием pdfService
  };
  
  // Методы для управления шаблонами
  const saveReportTemplate = async (template: ReportTemplate) => {
    try {
      await db.saveReportTemplate(template);
      
      // Обновляем список шаблонов отчетов
      const updatedTemplates = await db.getAllReportTemplates();
      setReportTemplates(updatedTemplates);
    } catch (error) {
      console.error('Ошибка при сохранении шаблона отчета:', error);
      throw error;
    }
  };
  
  const saveSectionTemplate = async (template: SectionTemplate) => {
    try {
      await db.saveSectionTemplate(template);
      
      // Обновляем список шаблонов разделов
      const updatedTemplates = await db.getAllSectionTemplates();
      setSectionTemplates(updatedTemplates);
    } catch (error) {
      console.error('Ошибка при сохранении шаблона раздела:', error);
      throw error;
    }
  };
  
  const saveDroneTemplate = async (template: DroneTemplate) => {
    try {
      await db.saveDroneTemplate(template);
      
      // Обновляем список шаблонов дронов
      const updatedTemplates = await db.getAllDroneTemplates();
      setDroneTemplates(updatedTemplates);
    } catch (error) {
      console.error('Ошибка при сохранении шаблона дрона:', error);
      throw error;
    }
  };
  
  // Методы для wizard
  const toggleWizard = () => setShowWizard(prev => !prev);
  const closeWizard = () => setShowWizard(false);
  
  const value = {
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
    exportReportToPdf,
    exportReportToJson,
    
    saveReportTemplate,
    saveSectionTemplate,
    saveDroneTemplate,
    
    toggleWizard,
    closeWizard,
    
    setFilter,
    applyFilter
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
