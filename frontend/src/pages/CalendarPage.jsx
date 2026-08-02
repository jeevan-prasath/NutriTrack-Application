import React, { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, subMonths, addMonths } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Flame, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const card = { background: 'var(--color-surface-2)', border: '1px solid var(--white-07)', borderRadius: '20px', padding: '20px' };

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

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

  // Stats
  const loggedDays = entries.length;
  let successDays = 0;
  entries.forEach(e => {
    const cal = e.totals?.calories || 0;
    if (cal > 0 && Math.abs(cal - targetKcal) <= targetKcal * 0.15) successDays++;
  });

  return (
    <div style={{ padding: '20px 16px 140px', maxWidth: '520px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>Calendar</h1>

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
      <div style={{ ...card, padding: '24px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--color-surface-3)', border: '1px solid var(--white-08)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={18} />
          </button>
          <h2 style={{ fontSize: '17px', fontWeight: 700 }}>{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} disabled={isSameMonth(currentDate, new Date())} style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--color-surface-3)', border: '1px solid var(--white-08)', color: 'var(--color-text)', cursor: isSameMonth(currentDate, new Date()) ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isSameMonth(currentDate, new Date()) ? 0.3 : 1 }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '12px', textAlign: 'center' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-subtle)' }}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} />)}
          
          {days.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const entry = entries.find(e => e.date === dateStr);
            const isToday = isSameDay(day, new Date());
            const hasData = !!entry;
            const kcal = entry?.totals?.calories || 0;
            const water = entry?.water || 0;
            
            // Goals
            const calMet = hasData && kcal > 0 && Math.abs(kcal - targetKcal) <= targetKcal * 0.15;
            const waterMet = hasData && water >= targetWater * 0.8;

            let bg = 'transparent';
            let border = '1px solid transparent';
            let delay = i * 0.01;

            if (isToday) {
              border = '1px solid var(--color-brand)';
              bg = 'rgba(22, 163, 74, 0.1)';
            } else if (hasData) {
              bg = 'var(--color-surface-3)';
              border = '1px solid var(--white-06)';
            }

            return (
              <motion.div key={day.toString()} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }}
                style={{ aspectRatio: '1', borderRadius: '12px', background: bg, border, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: hasData || isToday ? 'pointer' : 'default', position: 'relative' }}
                onClick={() => { if (hasData || isToday) { navigate('/diary'); } }}>
                <span style={{ fontSize: '14px', fontWeight: isToday ? 700 : 500, color: hasData || isToday ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{format(day, 'd')}</span>
                
                {/* Dots indicator */}
                {hasData && (
                  <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: calMet ? '#22c55e' : '#f59e0b' }} />
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: waterMet ? '#38bdf8' : 'var(--white-20)' }} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '0 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Calorie Goal Met</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Water Goal Met</span>
        </div>
      </div>
    </div>
  );
}
