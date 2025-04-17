
import Dexie, { Table } from 'dexie';
import { Report, DroneTemplate, ReportTemplate, SectionTemplate, ReportFilter } from '../types';
import { format, parse, isWithinInterval } from 'date-fns';

class DroneReportDatabase extends Dexie {
  reports!: Table<Report, string>;
  droneTemplates!: Table<DroneTemplate, string>;
  reportTemplates!: Table<ReportTemplate, string>;
  sectionTemplates!: Table<SectionTemplate, string>;

  constructor() {
    super('DroneReportDatabase');
    this.version(1).stores({
      reports: 'id, date, timestamp, [drone.model]',
      droneTemplates: 'id, name, model',
      reportTemplates: 'id, name',
      sectionTemplates: 'id, title'
    });
  }

  // Методы для отчетов
  async saveReport(report: Report): Promise<string> {
    return await this.reports.put(report);
  }

  async getReport(id: string): Promise<Report | undefined> {
    return await this.reports.get(id);
  }

  async getAllReports(): Promise<Report[]> {
    return await this.reports.toArray();
  }

  async deleteReport(id: string): Promise<void> {
    await this.reports.delete(id);
  }

  async filterReports(filter: ReportFilter): Promise<Report[]> {
    let reports = await this.reports.toArray();

    // Фильтрация по дате
    if (filter.dateFrom || filter.dateTo) {
      reports = reports.filter(report => {
        const reportDate = parse(report.date, 'dd.MM.yyyy', new Date());
        
        if (filter.dateFrom && filter.dateTo) {
          const startDate = parse(filter.dateFrom, 'dd.MM.yyyy', new Date());
          const endDate = parse(filter.dateTo, 'dd.MM.yyyy', new Date());
          return isWithinInterval(reportDate, { start: startDate, end: endDate });
        } else if (filter.dateFrom) {
          const startDate = parse(filter.dateFrom, 'dd.MM.yyyy', new Date());
          return reportDate >= startDate;
        } else if (filter.dateTo) {
          const endDate = parse(filter.dateTo, 'dd.MM.yyyy', new Date());
          return reportDate <= endDate;
        }
        
        return true;
      });
    }

    // Фильтрация по модели дрона
    if (filter.droneModel) {
      reports = reports.filter(report => report.drone.model === filter.droneModel);
    }

    // Сортировка
    reports.sort((a, b) => {
      if (filter.sortBy === 'date') {
        return filter.sortOrder === 'asc' 
          ? a.timestamp - b.timestamp 
          : b.timestamp - a.timestamp;
      } else {
        // Сортировка по модели дрона
        const modelA = a.drone.model.toLowerCase();
        const modelB = b.drone.model.toLowerCase();
        
        if (filter.sortOrder === 'asc') {
          return modelA.localeCompare(modelB);
        } else {
          return modelB.localeCompare(modelA);
        }
      }
    });

    return reports;
  }

  // Методы для шаблонов дронов
  async saveDroneTemplate(template: DroneTemplate): Promise<string> {
    return await this.droneTemplates.put(template);
  }

  async getDroneTemplate(id: string): Promise<DroneTemplate | undefined> {
    return await this.droneTemplates.get(id);
  }

  async getAllDroneTemplates(): Promise<DroneTemplate[]> {
    return await this.droneTemplates.toArray();
  }

  async deleteDroneTemplate(id: string): Promise<void> {
    await this.droneTemplates.delete(id);
  }

  // Методы для шаблонов отчетов
  async saveReportTemplate(template: ReportTemplate): Promise<string> {
    return await this.reportTemplates.put(template);
  }

  async getReportTemplate(id: string): Promise<ReportTemplate | undefined> {
    return await this.reportTemplates.get(id);
  }

  async getAllReportTemplates(): Promise<ReportTemplate[]> {
    return await this.reportTemplates.toArray();
  }

  async deleteReportTemplate(id: string): Promise<void> {
    await this.reportTemplates.delete(id);
  }

  // Методы для шаблонов разделов
  async saveSectionTemplate(template: SectionTemplate): Promise<string> {
    return await this.sectionTemplates.put(template);
  }

  async getSectionTemplate(id: string): Promise<SectionTemplate | undefined> {
    return await this.sectionTemplates.get(id);
  }

  async getAllSectionTemplates(): Promise<SectionTemplate[]> {
    return await this.sectionTemplates.toArray();
  }

  async deleteSectionTemplate(id: string): Promise<void> {
    await this.sectionTemplates.delete(id);
  }
}

// Экспортируем экземпляр базы данных
export const db = new DroneReportDatabase();

// Импортируем демо-данные из конфигурации
import { demoTDrones, demoSections, demoReportTemplates } from '../config/demoData';

// Функция для инициализации демо-данных
export const initDemoData = async () => {
  // Проверяем, есть ли уже данные в базе
  const droneCount = await db.droneTemplates.count();
  const reportTemplateCount = await db.reportTemplates.count();
  const sectionTemplateCount = await db.sectionTemplates.count();
  
  // Если данные уже есть, не добавляем демо-данные
  if (droneCount > 0 || reportTemplateCount > 0 || sectionTemplateCount > 0) {
    return;
  }
  
  // Сохраняем демо-данные в базу
  await Promise.all([
    ...demoTDrones.map(drone => db.saveDroneTemplate(drone)),
    ...demoSections.map(section => db.saveSectionTemplate(section)),
    ...demoReportTemplates.map(report => db.saveReportTemplate(report))
  ]);
  
  console.log('Демо-данные успешно добавлены в базу данных');
};
