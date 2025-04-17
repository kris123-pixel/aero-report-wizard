
import React, { useState, useEffect } from 'react';
import { WizardStep } from '../types';
import { Button } from '@/components/ui/button';

interface WizardProps {
  steps: WizardStep[];
  onComplete: () => void;
}

const Wizard: React.FC<WizardProps> = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState<boolean>(true);

  useEffect(() => {
    if (steps.length === 0) return;

    // Находим целевой элемент для текущего шага
    const targetElement = document.querySelector(steps[currentStep].target);
    
    // Если элемент найден, прокручиваем к нему и подсвечиваем
    if (targetElement) {
      // Прокручиваем к элементу
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Добавляем класс для подсветки
      targetElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      
      // Удаляем подсветку при переходе к следующему шагу
      return () => {
        targetElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      };
    }
  }, [currentStep, steps]);

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipWizard = () => {
    onComplete();
  };

  if (steps.length === 0 || !showTooltip) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="wizard-container">
      <div className="wizard-content max-w-md wizard-step">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{currentStepData.title}</h2>
          <span className="text-sm text-gray-500">Шаг {currentStep + 1} из {steps.length}</span>
        </div>
        
        <div className="mb-6">{currentStepData.content}</div>
        
        <div className="flex justify-between">
          <div>
            {currentStep > 0 ? (
              <Button 
                variant="outline" 
                onClick={goToPreviousStep}
              >
                Назад
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={skipWizard}
              >
                Пропустить
              </Button>
            )}
          </div>
          
          <Button onClick={goToNextStep}>
            {currentStep < steps.length - 1 ? 'Далее' : 'Завершить'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Wizard;
