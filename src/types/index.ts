
import { ReactNode } from "react";

// Типы для метеоданных
export interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  pressure: number;
  visibility: number;
  icon: string;
  timestamp: number; // Unix timestamp последнего обновления
}

// Типы для шаблонов дронов
export interface DroneTemplate {
  id: string;
  name: string;
  model: string;
  specifications: {
    maxFlightTime: number; // минуты
    maxSpeed: number; // км/ч
    maxAltitude: number; // метры
    maxRange: number; // км
    weight: number; // граммы
    dimensions: {
      length: number; // см
      width: number; // см
      height: number; // см
    };
    camera?: {
      model: string;
      resolution: string;
    };
    batteryType: string;
  };
}

// Типы для пунктов формы
export interface FormItem {
  id: string;
  content: string;
  isChecked: boolean;
  type: "checkbox" | "text" | "number" | "select";
  options?: string[]; // Для типа select
  value?: string; // Для текстовых и числовых полей
  children?: FormItem[]; // Для вложенных пунктов
}

// Типы для разделов формы
export interface FormSection {
  id: string;
  title: string;
  items: FormItem[];
}

// Типы для шаблонов разделов
export interface SectionTemplate {
  id: string;
  title: string;
  items: FormItem[];
}

// Типы для шаблонов отчетов
export interface ReportTemplate {
  id: string;
  name: string;
  sections: SectionTemplate[];
  droneTypes: string[]; // Список совместимых моделей дронов
}

// Типы для отчетов
export interface Report {
  id: string;
  name: string;
  date: string; // В формате dd.mm.yyyy
  timestamp: number; // Unix timestamp для сортировки
  weather: WeatherData;
  drone: DroneTemplate;
  sections: FormSection[];
  createdBy?: string;
  notes?: string;
}

// Типы для фильтрации отчетов
export interface ReportFilter {
  dateFrom?: string;
  dateTo?: string;
  droneModel?: string;
  sortBy: "date" | "drone";
  sortOrder: "asc" | "desc";
}

// Типы для wizard
export interface WizardStep {
  id: string;
  title: string;
  content: ReactNode;
  target: string; // CSS селектор для целевого элемента
}
