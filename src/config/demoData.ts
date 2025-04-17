
import { DroneTemplate, ReportTemplate, SectionTemplate, FormItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Демо-данные для шаблонов дронов
export const demoTDrones: DroneTemplate[] = [
  {
    id: 'drone-1',
    name: 'miniSIGMA',
    model: 'miniSIGMA-1',
    specifications: {
      maxFlightTime: 60,
      maxSpeed: 80,
      maxAltitude: 5000,
      maxRange: 50,
      weight: 2500,
      dimensions: {
        length: 120,
        width: 180,
        height: 30
      },
      camera: {
        model: 'HD Camera 1080p',
        resolution: '1920x1080'
      },
      batteryType: 'Li-Po 10000mAh'
    }
  },
  {
    id: 'drone-2',
    name: 'Орлан',
    model: 'Орлан-10',
    specifications: {
      maxFlightTime: 120,
      maxSpeed: 150,
      maxAltitude: 6000,
      maxRange: 120,
      weight: 5500,
      dimensions: {
        length: 180,
        width: 320,
        height: 40
      },
      camera: {
        model: 'Thermal Imaging Camera',
        resolution: '3840x2160'
      },
      batteryType: 'Li-Po 22000mAh'
    }
  }
];

// Демо-данные для шаблонов разделов
export const demoSections: SectionTemplate[] = [
  {
    id: 'section-1',
    title: 'Предварительная подготовка (на базе / до полетов)',
    items: [
      {
        id: uuidv4(),
        content: 'Зарядить батареи:',
        isChecked: false,
        type: 'checkbox',
        children: [
          {
            id: uuidv4(),
            content: 'Силовые АКБ х2',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'АКБ пульта РДУ',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'АКБ НСУ',
            isChecked: false,
            type: 'checkbox'
          }
        ]
      },
      {
        id: uuidv4(),
        content: 'Подготовить и загрузить подложки для местности полетов на НСУ',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Загрузить карту высот на НСУ',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Подготовить маршрут',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Произвести сбор оборудования по списку*',
        isChecked: false,
        type: 'checkbox'
      }
    ]
  },
  {
    id: 'section-2',
    title: 'Предварительная подготовка (на месте)',
    items: [
      {
        id: uuidv4(),
        content: 'Оценить погодные условия, отложить полет если:',
        isChecked: false,
        type: 'checkbox',
        children: [
          {
            id: uuidv4(),
            content: 'постоянный ветер более 10m/s',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'порывы ветра более 15m/s',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'направление ветра боковое относительно линии разгона',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'видимость не позволяет вести съемку',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'осадки',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'негативная динамика погоды',
            isChecked: false,
            type: 'checkbox'
          }
        ]
      },
      {
        id: uuidv4(),
        content: 'Произвести сборку БЛА',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Установить фюзеляж в исходное положение',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Установить АКБ',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Установить воздушный винт на маршевый двигатель, проверить затяжку',
        isChecked: false,
        type: 'checkbox'
      }
    ]
  },
  {
    id: 'section-3',
    title: 'Предполетная подготовка (Перед взлетом)',
    items: [
      {
        id: uuidv4(),
        content: 'Подать электропитание питание на БЛА, дождаться загрузки автопилота',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Проверить наличие связи с НСУ, убедится в корректности телеметрии, убедиться в корректности показаний авиагоризонта (крен, тангаж, координаты)',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Пройти предполетные проверки',
        isChecked: false,
        type: 'checkbox',
        children: [
          {
            id: uuidv4(),
            content: 'Сервоприводы',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'Регуляторы',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'БАНО',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'Сделать контрольное фото (fphoto -e, fphoto -c 0)',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'СВС',
            isChecked: false,
            type: 'checkbox'
          }
        ]
      }
    ]
  },
  {
    id: 'section-4',
    title: 'Взлет',
    items: [
      {
        id: uuidv4(),
        content: 'Запустить видеофиксацию',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Опрос перед взлетом:',
        isChecked: false,
        type: 'checkbox',
        children: [
          {
            id: uuidv4(),
            content: 'чеклист подготовки выполнен',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'питание 220В наземной станции поступает (по индикатору БП)',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'батареи 50В',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'GNSS 12+',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'пилот готов, пульт в автоматическом режиме',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'оператор камеры готов',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'погода ОК',
            isChecked: false,
            type: 'checkbox'
          },
          {
            id: uuidv4(),
            content: 'помехи взлету и посадке отсутствуют',
            isChecked: false,
            type: 'checkbox'
          }
        ]
      },
      {
        id: uuidv4(),
        content: 'Разблокировать АРМ с НСУ',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Заармить ЛА с пульта ДУ',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Перевести ЛА в режим "Взлет"',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Контролировать набор высоты',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Контролировать набор скорости до 75 км/ч',
        isChecked: false,
        type: 'checkbox'
      }
    ]
  },
  {
    id: 'section-5',
    title: 'Полет по Маршруту',
    items: [
      {
        id: uuidv4(),
        content: 'Контролировать показатели скорости, высоты, крена и тангажа при прохождении ППМ. Контролировать увеличение счетчика снимков на участках АФС.',
        isChecked: false,
        type: 'checkbox'
      }
    ]
  },
  {
    id: 'section-6',
    title: 'Посадка',
    items: [
      {
        id: uuidv4(),
        content: 'Контролировать заход на посадочную глиссаду',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Контролировать выключение маршевого двигателя за 200 метров до последнего ППМ',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Контролировать заход на посадочную точку в коптерном режиме',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'Контролировать снижение, при необходимости перехватить в ручной режим с пульта ДУ',
        isChecked: false,
        type: 'checkbox'
      },
      {
        id: uuidv4(),
        content: 'После касания земли заблокировать двигатели с НСУ или пульта ДУ',
        isChecked: false,
        type: 'checkbox'
      }
    ]
  }
];

// Демо-данные для шаблонов отчетов
export const demoReportTemplates: ReportTemplate[] = [
  {
    id: 'report-template-1',
    name: 'Стандартный чек-лист для miniSIGMA',
    sections: demoSections.filter(s => s.id !== 'section-5'),
    droneTypes: ['miniSIGMA-1']
  },
  {
    id: 'report-template-2',
    name: 'Полный чек-лист для всех типов БПЛА',
    sections: demoSections,
    droneTypes: ['miniSIGMA-1', 'Орлан-10']
  }
];
