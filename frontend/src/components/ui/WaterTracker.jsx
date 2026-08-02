import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, Minus } from 'lucide-react';
import useDiaryStore from '../../store/diaryStore';

const GLASSES = [250, 250, 250, 250, 250, 250, 250, 250]; // 8 x 250ml = 2000ml

export default function WaterTracker({ current, target, date }) {
  const { updateWater } = useDiaryStore();
  const glassSize = 250;
  const filled = Math.min(8, Math.floor((current || 0) / glassSize));

  const add = () => updateWater(Math.min(target + 500, (current || 0) + glassSize));
  const remove = () => updateWater(Math.max(0, (current || 0) - glassSize));

  return (
    <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--white-07)', borderRadius: '20px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Droplets size={18} color="#38bdf8" />
          <span style={{ fontSize: '15px', fontWeight: 700 }}>Water Intake</span>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>{Math.round((current || 0) / 1000 * 10) / 10} L</span>
          {' '} / {Math.round(target / 1000 * 10) / 10} L
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {GLASSES.map((_, i) => (
          <motion.div key={i}
            initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
            style={{
              width: '32px', height: '42px', borderRadius: '8px',
              background: i < filled ? 'linear-gradient(180deg, #38bdf8, #0ea5e9)' : 'var(--white-06)',
              border: '1px solid',
              borderColor: i < filled ? '#0ea5e9' : 'var(--white-08)',
              transition: 'all 0.3s',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px',
            }}
          >
            <Droplets size={10} color={i < filled ? 'rgba(255,255,255,0.7)' : 'var(--white-15)'} />
          </motion.div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={remove} disabled={!current}
          style={{ flex: 1, padding: '8px', borderRadius: '10px', background: 'var(--white-05)', border: '1px solid var(--white-08)', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}>
          <Minus size={14} /> Remove
        </button>
        <button onClick={add}
          style={{ flex: 1, padding: '8px', borderRadius: '10px', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
          <Plus size={14} /> Add Glass
        </button>
      </div>
    </div>
  );
}
