import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Flame, Plus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useDiaryStore from '../store/diaryStore';
import NutrientRing from '../components/ui/NutrientRing';
import MacroBar from '../components/ui/MacroBar';
import MealSection from '../components/diary/MealSection';
import WaterTracker from '../components/ui/WaterTracker';

const card = {
  background: 'var(--color-surface-2)',
  border: '1px solid var(--white-07)',
  borderRadius: '20px',
  padding: '20px',
};

export default function Dashboard() {
  const user = useAuthStore(s => s.user);
  const { diary, fetchDiary, date, loading } = useDiaryStore();
  const navigate = useNavigate();

  useEffect(() => { fetchDiary(date); }, [date]);

  const targets = user?.customTargets?.calories
    ? user.customTargets
    : user?.recommendedTargets || { calories: 2000, protein: 150, carbs: 250, fat: 67, fiber: 30, water: 2500 };

  const totals = diary?.totals || {};
  const kcalConsumed = totals.calories || 0;
  const kcalTarget = targets.calories || 2000;
  const kcalRemaining = Math.max(0, kcalTarget - kcalConsumed);
  const pct = Math.min(100, Math.round((kcalConsumed / kcalTarget) * 100));

  const today = format(new Date(), 'EEE, MMM d');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const macros = [
    { label: 'Protein', value: totals.protein || 0, target: targets.protein || 150, color: '#60a5fa' },
    { label: 'Carbs', value: totals.carbs || 0, target: targets.carbs || 250, color: '#f59e0b' },
    { label: 'Fat', value: totals.fat || 0, target: targets.fat || 67, color: '#f472b6' },
    { label: 'Fiber', value: totals.fiber || 0, target: targets.fiber || 30, color: '#34d399' },
  ];

  const fade = (delay = 0) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: 'easeOut', delay } });

  return (
    <div style={{ padding: '20px 16px 140px', maxWidth: '520px', margin: '0 auto' }}>
      {/* Greeting */}
      <motion.div {...fade(0)} style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{today}</p>
        <h1 style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1.2 }}>
          {greeting}, <span style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name?.split(' ')[0] || 'Friend'}</span> 👋
        </h1>
      </motion.div>

      {/* Calorie hero card */}
      <motion.div {...fade(0.05)} style={{ ...card, marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '10px', fontWeight: 500 }}>Today's Calories</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1, background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{Math.round(kcalConsumed)}</span>
              <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>/ {kcalTarget} kcal</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={14} color="#22c55e" />
              <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600 }}>{Math.round(kcalRemaining)} kcal remaining</span>
            </div>
          </div>
          <NutrientRing value={kcalConsumed} max={kcalTarget} size={110} />
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '16px', height: '6px', background: 'var(--white-06)', borderRadius: '100px', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }}
            style={{ height: '100%', borderRadius: '100px', background: pct > 100 ? '#ef4444' : 'var(--gradient-brand)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>0</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{pct}%</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{kcalTarget}</span>
        </div>
      </motion.div>

      {/* Macros */}
      <motion.div {...fade(0.1)} style={{ ...card, marginBottom: '12px' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Macronutrients</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {macros.map((m, i) => <MacroBar key={m.label} {...m} delay={i * 0.04 + 0.15} />)}
        </div>
      </motion.div>

      {/* Water */}
      <motion.div {...fade(0.15)} style={{ marginBottom: '12px' }}>
        <WaterTracker current={diary?.water || 0} target={targets.water || 2500} />
      </motion.div>

      {/* Meals */}
      <motion.div {...fade(0.2)} style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700 }}>Today's Meals</p>
          <button onClick={() => navigate('/diary')} style={{ background: 'none', border: 'none', color: 'var(--color-brand-light)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            See all →
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => (
            <MealSection key={meal} mealType={meal} entries={diary?.meals?.[meal] || []}
              onAddFood={() => navigate('/search', { state: { mealType: meal } })} compact />
          ))}
        </div>
      </motion.div>

      {/* Quick add */}
      <motion.button {...fade(0.25)} onClick={() => navigate('/search')}
        whileTap={{ scale: 0.97 }}
        style={{ width: '100%', padding: '16px', borderRadius: '18px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 32px rgba(22,163,74,0.3)' }}>
        <Plus size={20} /> Add Food
      </motion.button>
    </div>
  );
}
