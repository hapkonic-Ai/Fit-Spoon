'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WarmButton } from '@/components/atoms/WarmButton';
import { WarmInput } from '@/components/atoms/WarmInput';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  calorieGoal: z.coerce.number().min(800).max(5000).optional(),
});

type BasicInfoForm = z.infer<typeof schema>;

interface BasicInfoProps {
  onNext: (data: BasicInfoForm) => void;
  defaultValues?: Partial<BasicInfoForm>;
}

const CALORIE_PRESETS = [
  { label: 'Lose weight', value: 1400 },
  { label: 'Maintain', value: 2000 },
  { label: 'Gain muscle', value: 2500 },
];

export function BasicInfo({ onNext, defaultValues }: BasicInfoProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BasicInfoForm>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const calorieVal = watch('calorieGoal');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2
        className="text-2xl font-bold mb-1"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
      >
        Tell me about you 🌟
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        I'll personalize your experience just for you
      </p>

      <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-5">
        <WarmInput
          label="What should I call you?"
          type="text"
          placeholder="Your name"
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
            Daily calorie goal
          </label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {CALORIE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setValue('calorieGoal', preset.value)}
                className="py-2 px-3 rounded-xl text-xs font-medium transition-all border"
                style={{
                  background: calorieVal === preset.value ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: calorieVal === preset.value ? 'white' : 'var(--color-text-muted)',
                  borderColor: calorieVal === preset.value ? 'var(--color-primary)' : 'var(--color-border-light)',
                }}
              >
                {preset.label}
                <br />
                <span className="opacity-80">{preset.value} kcal</span>
              </button>
            ))}
          </div>
          <WarmInput
            type="number"
            placeholder="Or enter custom (e.g. 1800)"
            error={errors.calorieGoal?.message}
            {...register('calorieGoal')}
          />
        </div>

        <WarmButton type="submit" className="w-full mt-2">
          Continue →
        </WarmButton>
      </form>
    </motion.div>
  );
}
