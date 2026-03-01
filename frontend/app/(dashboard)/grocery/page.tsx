'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Copy, Share2, Trash2 } from 'lucide-react';
import { WarmButton } from '@/components/atoms/WarmButton';
import { WarmInput } from '@/components/atoms/WarmInput';
import { ChefMateAvatar } from '@/components/organisms/ChefMateAvatar';

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
}

const CATEGORIES = ['Produce', 'Proteins', 'Dairy', 'Grains', 'Pantry', 'Spices', 'Other'];

const CATEGORY_EMOJIS: Record<string, string> = {
  Produce: '🥦', Proteins: '🥩', Dairy: '🥛', Grains: '🌾',
  Pantry: '🫙', Spices: '🌶️', Other: '🛒',
};

export default function GroceryPage() {
  const [items, setItems] = useState<GroceryItem[]>([
    { id: '1', name: 'Chicken Breast', category: 'Proteins', checked: false },
    { id: '2', name: 'Spinach', category: 'Produce', checked: false },
    { id: '3', name: 'Garlic', category: 'Produce', checked: true },
    { id: '4', name: 'Olive Oil', category: 'Pantry', checked: false },
  ]);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('Other');
  const [showAdd, setShowAdd] = useState(false);
  const [copied, setCopied] = useState(false);

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newItem.trim(), category: newCategory, checked: false },
    ]);
    setNewItem('');
    setShowAdd(false);
  };

  const toggleItem = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const clearChecked = () => setItems((prev) => prev.filter((i) => !i.checked));

  const copyList = () => {
    const text = CATEGORIES.map((cat) => {
      const catItems = items.filter((i) => i.category === cat && !i.checked);
      if (!catItems.length) return '';
      return `${cat}:\n${catItems.map((i) => `  • ${i.name}`).join('\n')}`;
    }).filter(Boolean).join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const grouped = CATEGORIES.reduce<Record<string, GroceryItem[]>>((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length) acc[cat] = catItems;
    return acc;
  }, {});

  const uncheckedCount = items.filter((i) => !i.checked).length;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold luxury-text"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Grocery List 🛒
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {uncheckedCount} item{uncheckedCount !== 1 ? 's' : ''} remaining
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyList}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
            aria-label={copied ? 'List copied!' : 'Copy grocery list'}
          >
            {copied ? <Check size={16} style={{ color: 'var(--color-success)' }} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          </button>
          <WarmButton size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} className="mr-1" />
            Add
          </WarmButton>
        </div>
      </div>

      {/* Add item form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card luxury-border rounded-2xl p-4 space-y-3"
          >
            <WarmInput
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
              placeholder="Item name..."
              autoFocus
            />
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewCategory(cat)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: newCategory === cat ? 'var(--color-gold)' : 'var(--color-bg)',
                    color: newCategory === cat ? 'white' : 'var(--color-text-muted)',
                  }}
                >
                  {CATEGORY_EMOJIS[cat]} {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 rounded-xl text-sm"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
              <WarmButton className="flex-1" onClick={addItem} disabled={!newItem.trim()}>
                Add Item
              </WarmButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grouped items */}
      {Object.entries(grouped).map(([category, catItems]) => (
        <motion.div key={category} layout className="space-y-2">
          <h2
            className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: 'var(--color-gold)' }}
          >
            {CATEGORY_EMOJIS[category]} {category}
          </h2>
          <div
            className="glass-card rounded-2xl overflow-hidden"
          >
            <AnimatePresence>
              {catItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 px-4 py-3 border-b last:border-0"
                  style={{ borderColor: 'var(--glass-border)' }}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: item.checked ? 'var(--color-gold)' : 'var(--color-border-mid)',
                      background: item.checked ? 'var(--color-gold)' : 'transparent',
                    }}
                    aria-label={item.checked ? `Uncheck ${item.name}` : `Check off ${item.name}`}
                    aria-pressed={item.checked}
                  >
                    {item.checked && <Check size={12} color="white" aria-hidden="true" />}
                  </button>
                  <span
                    className="flex-1 text-sm transition-all"
                    style={{
                      color: item.checked ? 'var(--color-text-muted)' : 'var(--color-text)',
                      textDecoration: item.checked ? 'line-through' : 'none',
                    }}
                  >
                    {item.name}
                  </span>
                  <button onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                    <Trash2 size={14} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}

      {items.some((i) => i.checked) && (
        <button
          onClick={clearChecked}
          className="glass-card w-full py-2.5 rounded-2xl text-sm font-medium transition-all"
          style={{
            color: 'var(--color-text-muted)',
          }}
        >
          Clear checked items ({items.filter((i) => i.checked).length})
        </button>
      )}

      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 py-14 text-center"
        >
          <ChefMateAvatar state="idle" size="md" />
          <div>
            <p className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
              Your list is empty! 🛒
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Add ingredients manually or generate a list from your meal plan
            </p>
          </div>
          <WarmButton size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} className="mr-1" aria-hidden="true" />
            Add First Item
          </WarmButton>
        </motion.div>
      )}
    </div>
  );
}
