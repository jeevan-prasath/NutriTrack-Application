import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, Plus, TrendingUp, TrendingDown, Minus, Trash2, BarChart2 } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';

const PERIODS = ['week', 'month', 'year'];
const card = { background: 'var(--color-surface-2)', border: '1px solid var(--white-07)', borderRadius: '20px', padding: '20px' };
const TT_STYLE = { background: '#131a16', border: '1px solid var(--white-08)', borderRadius: '12px', color: '#f0fdf4', fontSize: '13px', padding: '8px 12px' };

export default function WeightPage() {
  const [logs, setLogs] = useState([]);
  const [period, setPeriod] = useState('month');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => { fetchLogs(); }, [period]);

  const fetchLogs = async () => {
    setLoading(true);
    try { const { data } = await api.get(`/weight?period=${period}`); setLogs(data.data || []); }
    catch {}
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!weight || parseFloat(weight) < 10) return toast.error('Enter a valid weight');
    setAdding(true);
    try {
      await api.post('/weight', { date: today, weight: parseFloat(weight), bodyFat: bodyFat ? parseFloat(bodyFat) : undefined, notes });
      toast.success('Weight logged! 📊');
      setWeight(''); setBodyFat(''); setNotes('');
      fetchLogs();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/weight/${id}`); setLogs(prev => prev.filter(l => l._id !== id)); toast.success('Deleted'); }
    catch {}
  };

  const latest = logs[logs.length - 1]?.weight;
  const previous = logs[logs.length - 2]?.weight;
  const diff = latest && previous ? +(latest - previous).toFixed(1) : null;
  const chartData = logs.map(l => ({ date: l.date.slice(5), weight: l.weight }));

  return (
    <div style={{ padding: '20px 16px 140px', maxWidth: '520px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>Weight Tracker</h1>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div style={{ ...card }}>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '6px' }}>Current Weight</p>
          <p style={{ fontSize: '28px', fontWeight: 800, background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
            {latest ? `${latest} kg` : '—'}
          </p>
        </div>
        <div style={{ ...card }}>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '6px' }}>Last Change</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {diff === null ? (
              <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-muted)', lineHeight: 1 }}>—</p>
            ) : (
              <>
                {diff > 0 ? <TrendingUp size={20} color="#ef4444" /> : diff < 0 ? <TrendingDown size={20} color="#22c55e" /> : <Minus size={20} color="#6b7280" />}
                <p style={{ fontSize: '24px', fontWeight: 800, color: diff > 0 ? '#ef4444' : diff < 0 ? '#22c55e' : '#6b7280', lineHeight: 1 }}>
                  {diff > 0 ? '+' : ''}{diff} kg
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Log form */}
      <div style={{ ...card, marginBottom: '12px' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Log Today's Weight</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Weight (kg) *</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="nt-input" placeholder="e.g. 68.5" step="0.1" />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Body Fat % (optional)</label>
            <input type="number" value={bodyFat} onChange={e => setBodyFat(e.target.value)} className="nt-input" placeholder="e.g. 18" step="0.1" />
          </div>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Notes (optional)</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} className="nt-input" placeholder="Morning, fasted, etc." />
        </div>
        <motion.button onClick={handleAdd} disabled={adding} whileTap={{ scale: 0.97 }}
          style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {adding ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : <><Plus size={16} /> Log Weight</>}
        </motion.button>
      </div>

      {/* Chart */}
      {logs.length > 1 && (
        <div style={{ ...card, marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={16} color="var(--color-brand-light)" />
              <p style={{ fontSize: '14px', fontWeight: 700 }}>Weight Trend</p>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${period === p ? '#16a34a' : 'var(--white-08)'}`, background: period === p ? 'rgba(22,163,74,0.15)' : 'transparent', color: period === p ? '#22c55e' : 'var(--color-text-muted)' }}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--white-05)" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip contentStyle={TT_STYLE} />
              <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      <div>
        <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>History</p>
        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}><div className="spinner" /></div>}
        {!loading && logs.length === 0 && (
          <div style={{ ...card, textAlign: 'center', padding: '32px' }}>
            <Scale size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>No weight logs yet</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '4px' }}>Add your first weight entry above</p>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {logs.slice().reverse().slice(0, 25).map(log => (
            <motion.div key={log._id} layout
              style={{ ...card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Scale size={18} color="#22c55e" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>
                  {log.weight} kg {log.bodyFat ? <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 400 }}>· {log.bodyFat}% fat</span> : ''}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {log.date}{log.notes ? ` · ${log.notes}` : ''}
                </p>
              </div>
              <button onClick={() => handleDelete(log._id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>
                <Trash2 size={15} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
