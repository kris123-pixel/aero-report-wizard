
import React, { useState } from 'react';
import { Report, ReportFilter, DroneTemplate } from '../types';
import { format, parse } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReportListProps {
  reports: Report[];
  droneTemplates: DroneTemplate[];
  filter: ReportFilter;
  onFilterChange: (filter: ReportFilter) => void;
  onApplyFilter: () => Promise<void>;
  onView: (reportId: string) => void;
  onDelete: (reportId: string) => Promise<void>;
  onExportPdf: (reportId: string) => Promise<void>;
  onExportJson: (reportId: string) => Promise<void>;
}

const ReportList: React.FC<ReportListProps> = ({
  reports,
  droneTemplates,
  filter,
  onFilterChange,
  onApplyFilter,
  onView,
  onDelete,
  onExportPdf,
  onExportJson
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSortChange = (field: 'date' | 'drone') => {
    if (filter.sortBy === field) {
      // Если уже сортируем по этому полю, меняем порядок
      onFilterChange({
        ...filter,
        sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // Иначе меняем поле сортировки
      onFilterChange({
        ...filter,
        sortBy: field,
        sortOrder: 'desc' // По умолчанию сортируем по убыванию
      });
    }
  };

  const resetFilter = () => {
    onFilterChange({
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const confirmDelete = (reportId: string) => {
    setConfirmDeleteId(reportId);
  };

  const handleDelete = async (reportId: string) => {
    await onDelete(reportId);
    setConfirmDeleteId(null);
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Фильтры и сортировка</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="dateFrom">Дата с</Label>
              <Input
                id="dateFrom"
                type="text"
                placeholder="дд.мм.гггг"
                value={filter.dateFrom || ''}
                onChange={(e) => onFilterChange({ ...filter, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Дата по</Label>
              <Input
                id="dateTo"
                type="text"
                placeholder="дд.мм.гггг"
                value={filter.dateTo || ''}
                onChange={(e) => onFilterChange({ ...filter, dateTo: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="droneModel">Модель дрона</Label>
              <Select
                value={filter.droneModel || ''}
                onValueChange={(value) => onFilterChange({ ...filter, droneModel: value })}
              >
                <SelectTrigger id="droneModel">
                  <SelectValue placeholder="Все модели" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Все модели</SelectItem>
                  {droneTemplates.map(drone => (
                    <SelectItem key={drone.id} value={drone.model}>
                      {drone.name} ({drone.model})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <span className="mr-2">Сортировка:</span>
              <Button
                type="button"
                variant={filter.sortBy === 'date' ? 'default' : 'outline'}
                size="sm"
                className="mr-2"
                onClick={() => handleSortChange('date')}
              >
                По дате {filter.sortBy === 'date' && (filter.sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                type="button"
                variant={filter.sortBy === 'drone' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSortChange('drone')}
              >
                По модели дрона {filter.sortBy === 'drone' && (filter.sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
            </div>
            
            <div>
              <Button type="button" variant="outline" onClick={resetFilter} className="mr-2">
                Сбросить
              </Button>
              <Button type="button" onClick={onApplyFilter}>
                Применить фильтры
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>История отчетов</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="space-y-4" id="reports-list">
              {reports.map(report => (
                <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  {confirmDeleteId === report.id ? (
                    <div className="bg-red-50 p-3 rounded mb-2">
                      <p className="text-red-600 mb-2">Вы уверены, что хотите удалить этот отчет?</p>
                      <div className="flex space-x-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(report.id)}
                        >
                          Да, удалить
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelDelete}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : null}
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{report.name}</h3>
                      <p className="text-gray-500 text-sm">Дата: {report.date}</p>
                      <div className="mt-1">
                        <span className="drone-badge">
                          {report.drone.name} ({report.drone.model})
                        </span>
                      </div>
                      <p className="text-sm mt-2">
                        {report.sections.length} разделов, {report.sections.reduce((acc, section) => acc + section.items.length, 0)} пунктов
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(report.id)}
                      >
                        Просмотр
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onExportPdf(report.id)}
                      >
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onExportJson(report.id)}
                      >
                        JSON
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDelete(report.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Нет доступных отчетов</p>
              <p className="text-sm mt-2">Создайте новый отчет или измените параметры фильтрации</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportList;
