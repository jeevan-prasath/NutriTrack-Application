import React, { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, subMonths, addMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, BookOpen, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDiaryStore from '../store/diaryStore';
import MealSection from '../components/diary/MealSection';
import MacroBar from '../components/ui/MacroBar';
import WaterTracker from '../components/ui/WaterTracker';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const card = { background: 'var(--color-surface-2)', border: '1px solid var(--white-07)', borderRadius: '20px', padding: '20px' };

// ─── CALENDAR TAB ──────────────────────────────────────────────────────────────
function CalendarTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setDate } = useDiaryStore();
  const user = useAuthStore(s => s.user);
  const targetKcal = user?.customTargets?.calories || user?.recommendedTargets?.calories || 2000;
  const targetWater = user?.customTargets?.water || user?.recommendedTargets?.water || 2500;

  useEffect(() => { fetchMonthData(); }, [currentDate]);

  const fetchMonthData = async () => {
    setLoading(true);
    const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
    try { const { data } = await api.get(`/diary/range?start=${start}&end=${end}`); setEntries(data.data || []); }
    catch {}
    setLoading(false);
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const startOffset = startOfMonth(currentDate).getDay();
  const loggedDays = entries.length;
  let successDays = 0;
  entries.forEach(e => { const cal = e.totals?.calories || 0; if (cal > 0 && Math.abs(cal - targetKcal) <= targetKcal * 0.15) successDays++; });

  return (
    <div>
      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div style={{ ...card, padding: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '4px' }}>Days Logged</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', lineHeight: 1 }}>{loggedDays}</span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>/ {days.length}</span>
          </div>
        </div>
        <div style={{ ...card, padding: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '4px' }}>Goals Met</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#22c55e', lineHeight: 1 }}>{successDays}</span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>days</span>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div style={{ ...card, padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--color-surface-3)', border: '1px solid var(--white-08)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={18} />
          </button>
          <h2 style={{ fontSize: '17px', fontWeight: 700 }}>{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} disabled={isSameMonth(currentDate, new Date())} style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--color-surface-3)', border: '1px solid var(--white-08)', color: 'var(--color-text)', cursor: isSameMonth(currentDate, new Date()) ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isSameMonth(currentDate, new Date()) ? 0.3 : 1 }}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px', textAlign: 'center' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-subtle)' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const entry = entries.find(e => e.date === dateStr);
            const isToday = isSameDay(day, new Date());
            const hasData = !!entry;
            const calMet = hasData && (entry?.totals?.calories || 0) > 0 && Math.abs((entry?.totals?.calories || 0) - targetKcal) <= targetKcal * 0.15;
            const waterMet = hasData && (entry?.water || 0) >= targetWater * 0.8;

            return (
              <motion.div key={day.toString()} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.01 }}
                style={{ aspectRatio: '1', borderRadius: '10px', background: isToday ? 'rgba(22,163,74,0.12)' : hasData ? 'var(--color-surface-3)' : 'transparent', border: isToday ? '1.5px solid var(--color-brand)' : hasData ? '1px solid var(--white-06)' : '1px solid transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: hasData || isToday ? 'pointer' : 'default' }}
                onClick={() => { if (hasData || isToday) { setDate(dateStr); } }}>
                <span style={{ fontSize: '13px', fontWeight: isToday ? 700 : 500, color: hasData || isToday ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{format(day, 'd')}</span>
                {hasData && (
                  <div style={{ display: 'flex', gap: '2px', marginTop: '3px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: calMet ? '#22c55e' : '#f59e0b' }} />
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: waterMet ? '#38bdf8' : 'var(--white-20)' }} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Calorie Goal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Water Goal</span>
        </div>
      </div>
    </div>
  );
}

// ─── DIARY TAB ────────────────────────────────────────────────────────────────
function DiaryTab() {
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
    <div>
      {/* Date navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1.2 }}>
            {isToday ? 'Today' : format(new Date(date + 'T00:00:00'), 'EEE, MMM d')}
          </h2>
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
        <WaterTracker current={diary?.water || 0} target={targets.water || 2500} date={date} />
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DiaryPage() {
  const [activeTab, setActiveTab] = useState('diary');

  const tabs = [
    { id: 'diary', label: 'Diary', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <div style={{ padding: '20px 16px 140px', maxWidth: '520px', margin: '0 auto' }}>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '6px', background: 'var(--color-surface-2)', border: '1px solid var(--white-07)', borderRadius: '16px', padding: '5px', marginBottom: '20px' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', background: activeTab === id ? 'var(--gradient-brand)' : 'transparent', color: activeTab === id ? '#fff' : 'var(--color-text-muted)' }}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
          {activeTab === 'diary' ? <DiaryTab /> : <CalendarTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
