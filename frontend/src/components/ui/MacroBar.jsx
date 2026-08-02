import React from 'react';
import { motion } from 'framer-motion';

export default function MacroBar({ label, value, target, color, unit = 'g', delay = 0 }) {
  const pct = Math.min(100, ((value || 0) / (target || 1)) * 100);
  const over = value > target;

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px', padding: '0 2px' }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-subtle)' }}>{label}</span>
        <span style={{ fontSize: '13px', color: over ? '#f87171' : 'var(--color-text-muted)' }}>
          <span style={{ color: over ? '#f87171' : '#f0fdf4', fontWeight: 600, fontSize: '14px' }}>{Math.round(value || 0)}</span>
          <span style={{ color: 'var(--color-text-muted)' }}> / {target}{unit}</span>
        </span>
      </div>
      <div className="progress-track" style={{ height: '8px' }}>
        <motion.div
          style={{ height: '100%', borderRadius: '100px', background: over ? '#ef4444' : color, maxWidth: '100%' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  );
}
