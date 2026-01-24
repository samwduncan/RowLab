import React from 'react';
import { Check } from 'lucide-react';
import type { WizardStep } from '@/v2/hooks/useSessionWizard';

export interface StepIndicatorProps {
  currentStep: number;
  steps: readonly WizardStep[];
  onStepClick?: (stepId: number) => void;
  maxReachable?: number;
}

/**
 * Visual step indicator showing wizard progress
 *
 * Shows 4-step progress with states:
 * - Completed (< currentStep): Green circle with checkmark
 * - Current (= currentStep): Blue border, blue text
 * - Future (> currentStep): Gray border, gray text
 * - Clickable: Cursor pointer if step <= maxReachable
 *
 * Responsive:
 * - Desktop: Full horizontal layout
 * - Mobile (<640px): Current step name with progress dots
 */
export function StepIndicator({
  currentStep,
  steps,
  onStepClick,
  maxReachable = currentStep,
}: StepIndicatorProps) {
  const handleStepClick = (stepId: number) => {
    if (onStepClick && stepId <= maxReachable) {
      onStepClick(stepId);
    }
  };

  const getStepState = (index: number): 'completed' | 'current' | 'future' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'future';
  };

  const isClickable = (index: number): boolean => {
    return index <= maxReachable && !!onStepClick;
  };

  return (
    <>
      {/* Desktop view */}
      <div className="hidden sm:flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const state = getStepState(index);
          const clickable = isClickable(index);

          // Circle classes
          const circleClasses = [
            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200',
            state === 'completed' && 'bg-green-600 text-white',
            state === 'current' && 'border-2 border-interactive-primary text-interactive-primary bg-bg-surface',
            state === 'future' && 'border-2 border-bdr-default text-txt-tertiary bg-bg-surface',
            clickable && 'cursor-pointer hover:scale-105',
          ]
            .filter(Boolean)
            .join(' ');

          // Text classes
          const textClasses = [
            'text-sm font-medium transition-colors duration-200',
            state === 'completed' && 'text-green-600',
            state === 'current' && 'text-interactive-primary',
            state === 'future' && 'text-txt-tertiary',
          ]
            .filter(Boolean)
            .join(' ');

          // Connector classes
          const connectorClasses = [
            'flex-1 h-0.5 mx-4 transition-colors duration-200',
            state === 'completed' || (state === 'current' && index > 0)
              ? 'bg-green-600'
              : 'bg-bdr-default',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <React.Fragment key={step.id}>
              {/* Step circle + label */}
              <div
                className="flex flex-col items-center"
                onClick={() => handleStepClick(step.id)}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleStepClick(step.id);
                  }
                }}
              >
                <div className={circleClasses}>
                  {state === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.id + 1}</span>
                  )}
                </div>
                <span className={`mt-2 ${textClasses} max-w-[100px] text-center`}>
                  {step.name}
                </span>
                <span className="mt-1 text-xs text-txt-tertiary text-center max-w-[120px]">
                  {step.description}
                </span>
              </div>

              {/* Connector line (except after last) */}
              {index < steps.length - 1 && <div className={connectorClasses} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="sm:hidden mb-6">
        {/* Current step info */}
        <div className="text-center mb-4">
          <div className="text-sm text-txt-tertiary">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="text-lg font-semibold text-txt-primary mt-1">
            {steps[currentStep].name}
          </div>
          <div className="text-sm text-txt-secondary mt-1">
            {steps[currentStep].description}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {steps.map((step, index) => {
            const state = getStepState(index);
            const dotClasses = [
              'w-2 h-2 rounded-full transition-all duration-200',
              state === 'completed' && 'bg-green-600',
              state === 'current' && 'bg-interactive-primary w-8',
              state === 'future' && 'bg-bdr-default',
            ]
              .filter(Boolean)
              .join(' ');

            return <div key={step.id} className={dotClasses} />;
          })}
        </div>
      </div>
    </>
  );
}
