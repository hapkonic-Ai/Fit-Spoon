'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import api from '@/lib/api';
import { Welcome } from './steps/Welcome';
import { BasicInfo } from './steps/BasicInfo';
import { DietaryPrefs } from './steps/DietaryPrefs';
import { CuisinePrefs } from './steps/CuisinePrefs';
import { SkillLevel } from './steps/SkillLevel';
import { Complete } from './steps/Complete';

const STEPS = ['welcome', 'basic', 'dietary', 'cuisine', 'skill', 'complete'] as const;
type StepId = (typeof STEPS)[number];

interface OnboardingData {
  name?: string;
  calorieGoal?: number;
  dietaryType?: string;
  allergies?: string[];
  cuisines?: string[];
  skillLevel?: string;
}

export default function OnboardingPage() {
  const { user, setAuth, token } = useAuthStore();
  const { updatePreferences } = useUserStore();
  const [step, setStep] = useState<StepId>('welcome');
  const [data, setData] = useState<OnboardingData>({});

  const currentIndex = STEPS.indexOf(step);
  const progress = (currentIndex / (STEPS.length - 1)) * 100;

  const merge = (partial: Partial<OnboardingData>) => setData((prev) => ({ ...prev, ...partial }));

  const handleBasic = (values: { name?: string; calorieGoal?: number }) => {
    merge(values);
    setStep('dietary');
  };

  const handleDietary = (values: { dietaryType: string; allergies: string[] }) => {
    merge(values);
    setStep('cuisine');
  };

  const handleCuisine = (values: { cuisines: string[] }) => {
    merge(values);
    setStep('skill');
  };

  const handleSkill = async (values: { skillLevel: string }) => {
    const finalData = { ...data, ...values };
    merge(values);

    try {
      // Update profile name if changed
      if (finalData.name) {
        await api.put('/user/profile', { name: finalData.name });
      }

      // Save preferences
      await api.put('/user/preferences', {
        dietaryType: finalData.dietaryType || 'omnivore',
        allergies: finalData.allergies || [],
        cuisines: finalData.cuisines || [],
        skillLevel: finalData.skillLevel || 'intermediate',
        calorieGoal: finalData.calorieGoal || 2000,
      });

      if (finalData.calorieGoal) {
        updatePreferences({ calorieGoal: finalData.calorieGoal });
      }

      if (user && token) {
        setAuth({ ...user, onboardingComplete: true, name: finalData.name || user.name }, token, true);
      }
    } catch {
      // Still proceed to complete screen even if API fails
    }

    setStep('complete');
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--gradient-hero)' }}
    >
      {/* Progress bar */}
      {step !== 'welcome' && step !== 'complete' && (
        <div className="px-6 pt-6">
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--color-border-light)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'var(--gradient-sunrise)' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Step {currentIndex} of {STEPS.length - 2}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-primary)' }}>
              {Math.round(progress)}% done
            </span>
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="w-full max-w-md rounded-3xl p-8 shadow-xl"
          style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-xl)' }}
        >
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <Welcome key="welcome" userName={user?.name} onNext={() => setStep('basic')} />
            )}
            {step === 'basic' && (
              <BasicInfo key="basic" onNext={handleBasic} defaultValues={{ name: data.name, calorieGoal: data.calorieGoal }} />
            )}
            {step === 'dietary' && (
              <DietaryPrefs key="dietary" onNext={handleDietary} defaultValues={{ dietaryType: data.dietaryType, allergies: data.allergies }} />
            )}
            {step === 'cuisine' && (
              <CuisinePrefs key="cuisine" onNext={handleCuisine} defaultValues={{ cuisines: data.cuisines }} />
            )}
            {step === 'skill' && (
              <SkillLevel key="skill" onNext={handleSkill} defaultValues={{ skillLevel: data.skillLevel }} />
            )}
            {step === 'complete' && (
              <Complete key="complete" userName={data.name || user?.name} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
