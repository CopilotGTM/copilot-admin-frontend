import { create } from "zustand";

interface StepState {
  activeStep: number;
  currentStep: number;
  setStep: (step: number) => void;
  setCurrentStep: (step: number) => void;
}

const useStepStore = create<StepState>((set) => ({
  activeStep: 0,
  currentStep: 0,
  setStep: (step) => {
    console.log(`Setting step to: ${step}`);
    set({ activeStep: step });
  },
  setCurrentStep: (step) => {
    console.log(`Setting current step to: ${step}`);
    set({ currentStep: step });
  },
}));

export default useStepStore;
