interface StepProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export function StepProgress({ currentStep, totalSteps = 2 }: StepProgressProps) {
  return (
    <div className="flex gap-2 w-full max-w-md mx-auto mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors ${
            i < currentStep ? 'bg-gray-900' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}
