import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Utensils, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import useDiaryStore from '../../store/diaryStore';
import toast from 'react-hot-toast';

const MEAL_META = {
  breakfast: { label: 'Breakfast', icon: Coffee, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  lunch: { label: 'Lunch', icon: Sun, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  dinner: { label: 'Dinner', icon: Moon, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  snacks: { label: 'Snacks', icon: Cookie, color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
};

export default function MealSection({ mealType, entries = [], onAddFood, compact = false }) {
  const { deleteMealEntry } = useDiaryStore();
  const meta = MEAL_META[mealType] || {};
  const Icon = meta.icon || Utensils;
  const mealCalories = entries.reduce((sum, e) => sum + (e.nutrition?.calories || 0), 0);

  const handleDelete = async (entryId) => {
    const res = await deleteMealEntry(mealType, entryId);
    if (res.success) toast.success('Removed');
  };

  return (
    <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--white-07)', borderRadius: '20px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: entries.length ? '16px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={meta.color} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.2, marginBottom: '2px' }}>{meta.label}</p>
            {entries.length > 0 && (
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>
                {entries.length} item{entries.length > 1 ? 's' : ''} · {Math.round(mealCalories)} kcal
              </p>
            )}
          </div>
        </div>
        <button onClick={onAddFood}
          style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.2)', color: '#22c55e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Plus size={18} />
        </button>
      </div>

      {entries.length === 0 && (
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '10px 0 0' }}>
          No foods added yet
        </p>
      )}

      {entries.map((entry, i) => (
        <motion.div key={entry._id || i}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 0', marginTop: '12px', borderTop: '1px solid var(--white-06)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px' }}>
              {entry.food?.name || entry.foodSnapshot?.name || 'Unknown'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {entry.grams}g · {Math.round(entry.nutrition?.protein || 0)}P · {Math.round(entry.nutrition?.carbs || 0)}C · {Math.round(entry.nutrition?.fat || 0)}F
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: meta.color, flexShrink: 0 }}>
              {Math.round(entry.nutrition?.calories || 0)} kcal
            </span>
            {!compact && (
              <button onClick={() => handleDelete(entry._id)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px' }}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
