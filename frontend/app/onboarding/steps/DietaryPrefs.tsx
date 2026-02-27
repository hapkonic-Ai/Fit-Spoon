'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WarmButton } from '@/components/atoms/WarmButton';
import { Chip } from '@/components/atoms/Chip';

const DIETARY_OPTIONS = [
  { key: 'omnivore', label: 'Omnivore', emoji: '🍖' },
  { key: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { key: 'vegan', label: 'Vegan', emoji: '🌱' },
  { key: 'pescatarian', label: 'Pescatarian', emoji: '🐟' },
  { key: 'keto', label: 'Keto', emoji: '🥑' },
  { key: 'paleo', label: 'Paleo', emoji: '🥩' },
  { key: 'gluten_free', label: 'Gluten-Free', emoji: '🌾' },
  { key: 'dairy_free', label: 'Dairy-Free', emoji: '🥛' },
];

const ALLERGY_OPTIONS = ['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish'];

interface DietaryPrefsProps {
  onNext: (data: { dietaryType: string; allergies: string[] }) => void;
  defaultValues?: { dietaryType?: string; allergies?: string[] };
}

export function DietaryPrefs({ onNext, defaultValues }: DietaryPrefsProps) {
  const [selectedDiet, setSelectedDiet] = useState(defaultValues?.dietaryType || 'omnivore');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(defaultValues?.allergies || []);

  const toggleAllergy = (a: string) =>
    setSelectedAllergies((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );

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
        How do you eat? 🥦
      </h2>
      <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
        I'll only show recipes that work for you
      </p>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {DIETARY_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedDiet(opt.key)}
            className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all border"
            style={{
              background: selectedDiet === opt.key ? 'var(--color-primary)' : 'var(--color-bg)',
              color: selectedDiet === opt.key ? 'white' : 'var(--color-text)',
              borderColor: selectedDiet === opt.key ? 'var(--color-primary)' : 'var(--color-border-light)',
            }}
          >
            <span>{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
          Any allergies? (Select all that apply)
        </p>
        <div className="flex flex-wrap gap-2">
          {ALLERGY_OPTIONS.map((a) => (
            <Chip
              key={a}
              label={a}
              selected={selectedAllergies.includes(a)}
              onClick={() => toggleAllergy(a)}
            />
          ))}
        </div>
      </div>

      <WarmButton
        className="w-full"
        onClick={() => onNext({ dietaryType: selectedDiet, allergies: selectedAllergies })}
      >
        Continue →
      </WarmButton>
    </motion.div>
  );
}
