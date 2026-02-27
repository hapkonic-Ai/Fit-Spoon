'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';
import { WarmButton } from '@/components/atoms/WarmButton';
import api from '@/lib/api';
import type { Recipe } from '@chefmate/shared';

export default function CookingModePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const { data, isLoading } = useQuery<{ recipe: Recipe }>({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const res = await api.get(`/recipes/${id}`);
      return res.data;
    },
  });

  // Keep screen awake via NoSleep API (best effort)
  useEffect(() => {
    const prevTitle = document.title;
    if (data?.recipe) {
      document.title = `Cooking: ${data.recipe.title} 🍳`;
    }
    return () => { document.title = prevTitle; };
  }, [data]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning) {
      interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const recipe = data?.recipe;
  const steps = recipe?.steps || [];
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const allDone = completedSteps.size === steps.length;

  const toggleComplete = (stepNum: number) =>
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) next.delete(stepNum);
      else next.add(stepNum);
      return next;
    });

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ChefMateAvatar state="cooking" size="lg" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 px-4">
        <ChefMateAvatar state="idle" size="lg" />
        <WarmButton onClick={() => router.push('/recipes')} variant="ghost">Back to Recipes</WarmButton>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-border-light)' }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X size={18} />
          Exit
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            {recipe.title}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
        {/* Timer */}
        <button
          onClick={() => setTimerRunning((r) => !r)}
          className="text-sm font-mono font-medium px-3 py-1 rounded-full"
          style={{
            background: timerRunning ? 'var(--color-primary-light)' : 'var(--color-bg)',
            color: timerRunning ? 'var(--color-primary)' : 'var(--color-text-muted)',
          }}
        >
          {formatTime(timerSeconds)}
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1" style={{ background: 'var(--color-border-light)' }}>
        <motion.div
          className="h-full"
          style={{ background: 'var(--gradient-sunrise)' }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!allDone ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              {/* Avatar */}
              <div className="flex justify-center">
                <ChefMateAvatar state="cooking" size="lg" />
              </div>

              {/* Step number */}
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                  style={{ background: 'var(--gradient-sunrise)', color: 'white' }}
                >
                  {step?.stepNumber}
                </span>
                <h2
                  className="text-lg font-bold"
                  style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
                >
                  Step {step?.stepNumber}
                </h2>
              </div>

              {/* Instruction */}
              <div
                className="rounded-3xl p-5"
                style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}
              >
                <p
                  className="text-lg leading-relaxed"
                  style={{ color: 'var(--color-text)' }}
                >
                  {step?.instruction}
                </p>

                {step?.tip && (
                  <div
                    className="mt-4 p-3 rounded-2xl"
                    style={{ background: 'var(--color-primary-light)' }}
                  >
                    <p className="text-sm" style={{ color: 'var(--color-primary-dark)' }}>
                      💡 <strong>Tip:</strong> {step.tip}
                    </p>
                  </div>
                )}
              </div>

              {/* Mark as done */}
              <button
                onClick={() => toggleComplete(step?.stepNumber || 0)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all"
                style={{
                  background: completedSteps.has(step?.stepNumber || 0) ? 'var(--color-success)' : 'var(--color-bg)',
                  color: completedSteps.has(step?.stepNumber || 0) ? 'white' : 'var(--color-text-muted)',
                  border: `1.5px solid ${completedSteps.has(step?.stepNumber || 0) ? 'var(--color-success)' : 'var(--color-border-mid)'}`,
                }}
              >
                <CheckCircle size={16} />
                {completedSteps.has(step?.stepNumber || 0) ? 'Done ✓' : 'Mark as done'}
              </button>

              {/* Step list (mini) */}
              <div className="flex gap-1.5 justify-center flex-wrap">
                {steps.map((s, i) => (
                  <button
                    key={s.stepNumber}
                    onClick={() => setCurrentStep(i)}
                    className="w-7 h-7 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: completedSteps.has(s.stepNumber)
                        ? 'var(--color-success)'
                        : i === currentStep
                        ? 'var(--color-primary)'
                        : 'var(--color-bg)',
                      color: i === currentStep || completedSteps.has(s.stepNumber) ? 'white' : 'var(--color-text-muted)',
                    }}
                  >
                    {completedSteps.has(s.stepNumber) ? '✓' : s.stepNumber}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center gap-6 py-8"
            >
              <ChefMateAvatar state="celebrating" size="xl" />
              <div>
                <h2
                  className="text-3xl font-bold mb-2"
                  style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
                >
                  All done! 🎉
                </h2>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  You cooked <strong>{recipe.title}</strong> in {formatTime(timerSeconds)}!
                </p>
              </div>
              <WarmButton onClick={() => router.push('/')}>Back to Dashboard</WarmButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav buttons */}
      {!allDone && (
        <div
          className="shrink-0 flex gap-3 px-4 py-3 border-t"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border-light)' }}
        >
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-medium transition-all disabled:opacity-40"
            style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          {isLastStep ? (
            <WarmButton
              className="flex-1"
              onClick={() => setCompletedSteps(new Set(steps.map((s) => s.stepNumber)))}
            >
              Finish Cooking 🎉
            </WarmButton>
          ) : (
            <WarmButton
              className="flex-1"
              onClick={() => setCurrentStep((s) => s + 1)}
            >
              Next Step
              <ChevronRight size={18} />
            </WarmButton>
          )}
        </div>
      )}
    </div>
  );
}
