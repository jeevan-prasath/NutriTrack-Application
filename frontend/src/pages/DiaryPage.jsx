import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDiaryStore from '../store/diaryStore';
import MealSection from '../components/diary/MealSection';
import MacroBar from '../components/ui/MacroBar';
import WaterTracker from '../components/ui/WaterTracker';
import useAuthStore from '../store/authStore';

const card = { background: 'var(--color-surface-2)', border: '1px solid var(--white-07)', borderRadius: '20px', padding: '20px' };

export default function DiaryPage() {
  const navigate = useNavigate();
  const { diary, fetchDiary, date, setDate } = useDiaryStore();
  const user = useAuthStore(s => s.user);
  const targets = user?.customTargets?.calories ? user.customTargets : (user?.recommendedTargets || { calories: 2000, protein: 150, carbs: 250, fat: 67, fiber: 30, water: 2500 });
  const totals = diary?.totals || {};

  useEffect(() => { fetchDiary(date); }, [date]);

  const isToday = date === format(new Date(), 'yyyy-MM-dd');

  const shiftDay = (delta) => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    const next = format(d, 'yyyy-MM-dd');
    if (next <= format(new Date(), 'yyyy-MM-dd')) setDate(next);
  };

  const statItems = [
    { label: 'Calories', value: Math.round(totals.calories || 0), target: targets.calories, color: '#22c55e', unit: 'kcal' },
    { label: 'Protein', value: Math.round(totals.protein || 0), target: targets.protein, color: '#60a5fa', unit: 'g' },
    { label: 'Carbs', value: Math.round(totals.carbs || 0), target: targets.carbs, color: '#f59e0b', unit: 'g' },
    { label: 'Fat', value: Math.round(totals.fat || 0), target: targets.fat, color: '#f472b6', unit: 'g' },
  ];

  return (
    <div style={{ padding: '20px 16px 140px', maxWidth: '520px', margin: '0 auto' }}>
      {/* Date navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1.2 }}>
            {isToday ? 'Today' : format(new Date(date + 'T00:00:00'), 'EEE, MMM d')}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {format(new Date(date + 'T00:00:00'), 'MMMM d, yyyy')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => shiftDay(-1)} style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--color-surface-3)', border: '1px solid var(--white-08)', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => shiftDay(1)} disabled={isToday} style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--color-surface-3)', border: '1px solid var(--white-08)', color: 'var(--color-text-muted)', cursor: isToday ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isToday ? 0.35 : 1 }}>
            <ChevronRight size={16} />
          </button>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} max={format(new Date(), 'yyyy-MM-dd')}
            style={{ background: 'var(--color-surface-3)', border: '1px solid var(--white-08)', color: 'var(--color-text)', borderRadius: '10px', padding: '7px 10px', fontSize: '13px', cursor: 'pointer', outline: 'none' }} />
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '12px' }}>
        {statItems.map(({ label, value, target, color, unit }) => (
          <div key={label} style={{ ...card, padding: '12px 10px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 800, color, lineHeight: 1.1, marginBottom: '3px' }}>{value}</p>
            <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{label}<br /><span style={{ color: 'var(--white-30)' }}>/{target}{unit}</span></p>
          </div>
        ))}
      </div>

      {/* Macro bars */}
      <div style={{ ...card, marginBottom: '12px' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Macros Progress</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { label: 'Protein', value: totals.protein || 0, target: targets.protein || 150, color: '#60a5fa' },
            { label: 'Carbs', value: totals.carbs || 0, target: targets.carbs || 250, color: '#f59e0b' },
            { label: 'Fat', value: totals.fat || 0, target: targets.fat || 67, color: '#f472b6' },
            { label: 'Fiber', value: totals.fiber || 0, target: targets.fiber || 30, color: '#34d399' },
          ].map((m, i) => <MacroBar key={m.label} {...m} delay={i * 0.04} />)}
        </div>
      </div>

      {/* Water */}
      <div style={{ marginBottom: '12px' }}>
        <WaterTracker current={diary?.water || 0} target={targets.water || 2500} />
      </div>

      {/* Meals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => (
          <MealSection key={meal} mealType={meal} entries={diary?.meals?.[meal] || []}
            onAddFood={() => navigate('/search', { state: { mealType: meal } })} compact={false} />
        ))}
      </div>

      <motion.button onClick={() => navigate('/search')} whileTap={{ scale: 0.97 }}
        style={{ width: '100%', padding: '16px', borderRadius: '18px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <Plus size={20} /> Add Food
      </motion.button>
    </div>
  );
}
