import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, Minus } from 'lucide-react';
import useDiaryStore from '../../store/diaryStore';

export default function WaterTracker({ current, target, date }) {
  const { updateWater } = useDiaryStore();
  const [optimistic, setOptimistic] = useState(null);

  const currentMl = optimistic !== null ? optimistic : (current || 0);
  const glassSize = 250;
  // Total glasses shown = based on target, minimum 8
  const totalGlasses = Math.max(8, Math.ceil(target / glassSize));
  const filled = Math.min(totalGlasses, Math.floor(currentMl / glassSize));

  const add = async () => {
    const next = Math.min(target * 2, currentMl + glassSize);
    setOptimistic(next);
    await updateWater(next, date);
    setOptimistic(null);
  };

  const remove = async () => {
    const next = Math.max(0, currentMl - glassSize);
    setOptimistic(next);
    await updateWater(next, date);
    setOptimistic(null);
  };

  const liters = (currentMl / 1000).toFixed(1);
  const targetLiters = (target / 1000).toFixed(1);
  const pct = Math.min(100, Math.round((currentMl / target) * 100));

  return (
    <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--white-07)', borderRadius: '20px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Droplets size={18} color="#38bdf8" />
          <span style={{ fontSize: '15px', fontWeight: 700 }}>Water Intake</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '15px' }}>{currentMl} ml</span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}> / {target} ml</span>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{liters}L of {targetLiters}L</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '6px', borderRadius: '10px', background: 'var(--white-08)', marginBottom: '14px', overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: '10px', background: 'linear-gradient(90deg, #38bdf8, #0ea5e9)' }}
        />
      </div>

      {/* Glass icons */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {Array.from({ length: totalGlasses }).map((_, i) => (
          <motion.div key={i}
            animate={{ scale: i < filled ? 1 : 0.9, opacity: i < filled ? 1 : 0.5 }}
            transition={{ duration: 0.25, delay: i * 0.02 }}
            style={{
              width: '30px', height: '40px', borderRadius: '8px',
              background: i < filled ? 'linear-gradient(180deg, #38bdf8, #0ea5e9)' : 'var(--white-06)',
              border: `1px solid ${i < filled ? '#0ea5e9' : 'var(--white-08)'}`,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px',
            }}
          >
            <Droplets size={9} color={i < filled ? 'rgba(255,255,255,0.8)' : 'var(--white-20)'} />
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={remove} disabled={currentMl === 0}
          style={{ flex: 1, padding: '10px', borderRadius: '12px', background: 'var(--white-05)', border: '1px solid var(--white-08)', color: 'var(--color-text-muted)', cursor: currentMl === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', opacity: currentMl === 0 ? 0.4 : 1 }}>
          <Minus size={14} /> −250ml
        </button>
        <button onClick={add}
          style={{ flex: 1, padding: '10px', borderRadius: '12px', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
          <Plus size={14} /> +250ml
        </button>
      </div>
    </div>
  );
}
