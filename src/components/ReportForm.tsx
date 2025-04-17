
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Report, 
  FormSection, 
  FormItem, 
  DroneTemplate, 
  ReportTemplate, 
  SectionTemplate,
  WeatherData
} from '../types';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import WeatherInfo from './WeatherInfo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface ReportFormProps {
  initialReport?: Report | null;
  weatherData: WeatherData;
  droneTemplates: DroneTemplate[];
  reportTemplates: ReportTemplate[];
  sectionTemplates: SectionTemplate[];
  onSave: (report: Report) => Promise<void>;
  refreshWeather: () => Promise<void>;
}

const ReportForm: React.FC<ReportFormProps> = ({
  initialReport,
  weatherData,
  droneTemplates,
  reportTemplates,
  sectionTemplates,
  onSave,
  refreshWeather
}) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isDirty } } = useForm<Report>();
  
  const [selectedDrone, setSelectedDrone] = useState<string>(initialReport?.drone.id || 
    (droneTemplates.length > 0 ? droneTemplates[0].id : ''));
  
  const [selectedReportTemplate, setSelectedReportTemplate] = useState<string>('');
  
  const [sections, setSections] = useState<FormSection[]>(initialReport?.sections || []);
  
  // Следим за изменениями формы
  const formValues = watch();
  
  // Инициализируем форму при загрузке компонента или изменении initialReport
  useEffect(() => {
    if (initialReport) {
      reset(initialReport);
      setSelectedDrone(initialReport.drone.id);
      setSections(initialReport.sections);
    } else {
      // Создаем новый отчет
      const today = new Date();
      const defaultReport: Partial<Report> = {
        id: uuidv4(),
        name: `Отчет от ${format(today, 'dd.MM.yyyy')}`,
        date: format(today, 'dd.MM.yyyy'),
        timestamp: today.getTime(),
        weather: weatherData,
        notes: ''
      };
      
      reset(defaultReport as Report);
      
      if (droneTemplates.length > 0) {
        setValue('drone', droneTemplates[0]);
        setSelectedDrone(droneTemplates[0].id);
      }
    }
  }, [initialReport, reset, setValue, weatherData, droneTemplates]);
  
  // Обработка выбора шаблона отчета
  const handleReportTemplateChange = (templateId: string) => {
    setSelectedReportTemplate(templateId);
    
    if (!templateId) return;
    
    const template = reportTemplates.find(t => t.id === templateId);
    if (template) {
      // Копируем разделы из шаблона
      const newSections: FormSection[] = template.sections.map(section => ({
        id: uuidv4(),
        title: section.title,
        items: cloneFormItems(section.items)
      }));
      
      setSections(newSections);
    }
  };
  
  // Обработка выбора дрона
  const handleDroneChange = (droneId: string) => {
    setSelectedDrone(droneId);
    
    const drone = droneTemplates.find(d => d.id === droneId);
    if (drone) {
      setValue('drone', drone);
    }
  };
  
  // Функция для клонирования массива FormItem с новыми ID
  const cloneFormItems = (items: FormItem[]): FormItem[] => {
    return items.map(item => ({
      ...item,
      id: uuidv4(),
      children: item.children ? cloneFormItems(item.children) : undefined
    }));
  };
  
  // Добавление нового раздела
  const addNewSection = () => {
    const newSection: FormSection = {
      id: uuidv4(),
      title: `Новый раздел ${sections.length + 1}`,
      items: []
    };
    
    setSections([...sections, newSection]);
  };
  
  // Добавление существующего шаблона раздела
  const addSectionTemplate = (templateId: string) => {
    const template = sectionTemplates.find(t => t.id === templateId);
    if (template) {
      const newSection: FormSection = {
        id: uuidv4(),
        title: template.title,
        items: cloneFormItems(template.items)
      };
      
      setSections([...sections, newSection]);
    }
  };
  
  // Удаление раздела
  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };
  
  // Добавление пункта в раздел
  const addItemToSection = (sectionId: string, type: FormItem['type'] = 'checkbox') => {
    const newItem: FormItem = {
      id: uuidv4(),
      content: `Новый пункт`,
      isChecked: false,
      type
    };
    
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: [...section.items, newItem]
        };
      }
      return section;
    }));
  };
  
  // Удаление пункта из раздела
  const deleteItem = (sectionId: string, itemId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.filter(item => item.id !== itemId)
        };
      }
      return section;
    }));
  };
  
  // Обновление пункта
  const updateItem = (sectionId: string, itemId: string, updatedItem: Partial<FormItem>) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === itemId) {
              return { ...item, ...updatedItem };
            }
            return item;
          })
        };
      }
      return section;
    }));
  };
  
  // Обработка перетаскивания
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination, type } = result;
    
    // Перетаскивание разделов
    if (type === 'section') {
      const reorderedSections = [...sections];
      const [movedSection] = reorderedSections.splice(source.index, 1);
      reorderedSections.splice(destination.index, 0, movedSection);
      setSections(reorderedSections);
      return;
    }
    
    // Перетаскивание пунктов внутри раздела
    if (source.droppableId === destination.droppableId) {
      const sectionId = source.droppableId;
      const section = sections.find(s => s.id === sectionId);
      
      if (section) {
        const reorderedItems = [...section.items];
        const [movedItem] = reorderedItems.splice(source.index, 1);
        reorderedItems.splice(destination.index, 0, movedItem);
        
        setSections(sections.map(s => {
          if (s.id === sectionId) {
            return { ...s, items: reorderedItems };
          }
          return s;
        }));
      }
    } else {
      // Перетаскивание пунктов между разделами
      const sourceSectionId = source.droppableId;
      const destSectionId = destination.droppableId;
      
      const sourceSection = sections.find(s => s.id === sourceSectionId);
      const destSection = sections.find(s => s.id === destSectionId);
      
      if (sourceSection && destSection) {
        const sourceItems = [...sourceSection.items];
        const destItems = [...destSection.items];
        
        const [movedItem] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, movedItem);
        
        setSections(sections.map(s => {
          if (s.id === sourceSectionId) {
            return { ...s, items: sourceItems };
          }
          if (s.id === destSectionId) {
            return { ...s, items: destItems };
          }
          return s;
        }));
      }
    }
  };
  
  // Сохранение отчета
  const onSubmit = (data: any) => {
    // Создаем объект отчета
    const report: Report = {
      ...data,
      sections,
      weather: weatherData,
      timestamp: new Date().getTime()
    };
    
    onSave(report);
  };
  
  return (
    <div className="space-y-6 mb-10">
      <Card id="weather-section">
        <CardHeader>
          <CardTitle>Метеоданные</CardTitle>
        </CardHeader>
        <CardContent>
          <WeatherInfo 
            weather={weatherData} 
            refreshWeather={refreshWeather}
          />
        </CardContent>
      </Card>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6" id="report-info-section">
          <CardHeader>
            <CardTitle>Информация об отчете</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название отчета</Label>
                <Input 
                  id="name"
                  placeholder="Введите название отчета"
                  {...register("name", { required: true })}
                />
                {errors.name && <p className="text-red-500 text-sm">Обязательное поле</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Дата отчета</Label>
                <Input 
                  id="date"
                  placeholder="дд.мм.гггг"
                  {...register("date", { 
                    required: true,
                    pattern: /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/
                  })}
                />
                {errors.date && <p className="text-red-500 text-sm">Введите дату в формате дд.мм.гггг</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="drone">Модель дрона</Label>
              <Select 
                value={selectedDrone} 
                onValueChange={handleDroneChange}
              >
                <SelectTrigger id="drone-select">
                  <SelectValue placeholder="Выберите модель дрона" />
                </SelectTrigger>
                <SelectContent>
                  {droneTemplates.map(drone => (
                    <SelectItem key={drone.id} value={drone.id}>
                      {drone.name} ({drone.model})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {droneTemplates.find(d => d.id === selectedDrone) && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                  <h4 className="font-medium mb-1">Спецификации дрона:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>Макс. время полета: {droneTemplates.find(d => d.id === selectedDrone)?.specifications.maxFlightTime} мин</div>
                    <div>Макс. скорость: {droneTemplates.find(d => d.id === selectedDrone)?.specifications.maxSpeed} км/ч</div>
                    <div>Макс. высота: {droneTemplates.find(d => d.id === selectedDrone)?.specifications.maxAltitude} м</div>
                    <div>Макс. дальность: {droneTemplates.find(d => d.id === selectedDrone)?.specifications.maxRange} км</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Примечания</Label>
              <Textarea 
                id="notes"
                placeholder="Дополнительная информация об отчете"
                rows={3}
                {...register("notes")}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6" id="template-section">
          <CardHeader>
            <CardTitle>Шаблон отчета</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-template">Выберите шаблон отчета</Label>
                <Select 
                  value={selectedReportTemplate} 
                  onValueChange={handleReportTemplateChange}
                >
                  <SelectTrigger id="report-template-select">
                    <SelectValue placeholder="Выберите шаблон отчета" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не использовать шаблон</SelectItem>
                    {reportTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6" id="sections-area">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Разделы отчета</CardTitle>
            <div className="flex space-x-2">
              <Select onValueChange={addSectionTemplate}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Добавить шаблон раздела" />
                </SelectTrigger>
                <SelectContent>
                  {sectionTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                type="button"
                onClick={addNewSection}
                id="add-section-button"
              >
                Добавить раздел
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections" type="section">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {sections.map((section, index) => (
                      <Draggable key={section.id} draggableId={section.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="border rounded-lg p-4 bg-white"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div {...provided.dragHandleProps} className="cursor-grab">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                    <path d="M9 18L9 6M15 18L15 6"/>
                                  </svg>
                                </div>
                                <Input
                                  value={section.title}
                                  onChange={(e) => setSections(sections.map(s => 
                                    s.id === section.id ? { ...s, title: e.target.value } : s
                                  ))}
                                  className="font-semibold text-lg"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteSection(section.id)}
                                >
                                  Удалить раздел
                                </Button>
                              </div>
                            </div>
                            
                            <Droppable droppableId={section.id} type="item">
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="space-y-2"
                                >
                                  {section.items.map((item, itemIndex) => (
                                    <Draggable
                                      key={item.id}
                                      draggableId={item.id}
                                      index={itemIndex}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="flex items-start space-x-2 p-2 border rounded bg-gray-50 draggable-item"
                                        >
                                          <div className="flex-shrink-0 mt-1">
                                            {item.type === 'checkbox' && (
                                              <Checkbox
                                                id={`item-${item.id}`}
                                                checked={item.isChecked}
                                                onCheckedChange={(checked) => updateItem(section.id, item.id, { isChecked: !!checked })}
                                              />
                                            )}
                                          </div>
                                          
                                          <div className="flex-1">
                                            <Input
                                              value={item.content}
                                              onChange={(e) => updateItem(section.id, item.id, { content: e.target.value })}
                                              className="mb-1"
                                            />
                                            
                                            {item.type === 'text' && (
                                              <Input
                                                placeholder="Текстовое значение"
                                                value={item.value || ''}
                                                onChange={(e) => updateItem(section.id, item.id, { value: e.target.value })}
                                                className="mt-1"
                                              />
                                            )}
                                            
                                            {item.type === 'number' && (
                                              <Input
                                                type="number"
                                                placeholder="Числовое значение"
                                                value={item.value || ''}
                                                onChange={(e) => updateItem(section.id, item.id, { value: e.target.value })}
                                                className="mt-1"
                                              />
                                            )}
                                            
                                            {item.type === 'select' && (
                                              <div className="mt-1">
                                                <Select
                                                  value={item.value || ''}
                                                  onValueChange={(value) => updateItem(section.id, item.id, { value })}
                                                >
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Выберите значение" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {item.options?.map((option, i) => (
                                                      <SelectItem key={i} value={option}>
                                                        {option}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                            )}
                                          </div>
                                          
                                          <div className="flex items-center space-x-1">
                                            <Select 
                                              value={item.type} 
                                              onValueChange={(value: any) => updateItem(section.id, item.id, { type: value })}
                                            >
                                              <SelectTrigger className="w-[130px]">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="checkbox">Чекбокс</SelectItem>
                                                <SelectItem value="text">Текст</SelectItem>
                                                <SelectItem value="number">Число</SelectItem>
                                                <SelectItem value="select">Выбор</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => deleteItem(section.id, item.id)}
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                                              </svg>
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                  
                                  <div className="mt-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addItemToSection(section.id)}
                                      className="mr-2"
                                    >
                                      Добавить пункт
                                    </Button>
                                    <Select onValueChange={(value: any) => addItemToSection(section.id, value)}>
                                      <SelectTrigger className="w-[180px] inline-flex">
                                        <SelectValue placeholder="Тип пункта" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="checkbox">Чекбокс</SelectItem>
                                        <SelectItem value="text">Текст</SelectItem>
                                        <SelectItem value="number">Число</SelectItem>
                                        <SelectItem value="select">Выбор</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            {sections.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                Добавьте разделы в отчет или выберите шаблон
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            id="save-report-button"
            className="px-6"
          >
            Сохранить отчет
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
