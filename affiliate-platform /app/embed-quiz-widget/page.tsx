'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWidgetStore } from '@/store/widget-store';
import QuizSelector from '@/components/widgets/embed/QuizSelector';
import ThemeCustomizer from '@/components/widgets/embed/ThemeCustomizer';
import WidgetPreview from '@/components/widgets/embed/WidgetPreview';
import { Stepper } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard-layout';

// Import step components
const STEPS = [
  {
    id: 'select-quizzes',
    title: 'Select Quizzes',
    description: 'Choose quizzes to display',
  },
  {
    id: 'customize-widget',
    title: 'Customize Widget',
    description: 'Design your widget',
  },
  {
    id: 'preview-code',
    title: 'Preview & Code',
    description: 'Get embed code',
  },
];

export default function EmbedWidgetsPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const { selectedQuizzes } = useWidgetStore();

  const canProceedToNext = () => {
    if (currentStep === 1) {
      return selectedQuizzes.length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <QuizSelector />;
      case 2:
        return <ThemeCustomizer />;
      case 3:
        return <WidgetPreview />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl p-6">
          <div className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Embed Widget Configurator
            </h1>
            <p className="text-muted-foreground">
              Create and customize quiz widgets to embed on your website
            </p>
          </div>

          <div className="mb-12">
            <Stepper
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />
          </div>

          <div className="mt-12 mb-12">{renderStepContent()}</div>

          <div className="flex items-center justify-between gap-4 border-t pt-6">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrev}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {currentStep < STEPS.length && (
                <Button onClick={handleNext} disabled={!canProceedToNext()}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
