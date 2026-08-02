import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { format, subDays } from 'date-fns';
import { BarChart2, TrendingUp, Droplets, Zap } from 'lucide-react';
import api from '../services/api';

const PERIODS = [{ label: '7 Days', days: 7 }, { label: '30 Days', days: 30 }];
const card = { background: 'var(--color-surface-2)', border: '1px solid var(--white-07)', borderRadius: '20px', padding: '20px' };
const TT_STYLE = { background: '#131a16', border: '1px solid var(--white-08)', borderRadius: '12px', color: '#f0fdf4', fontSize: '13px' };

export default function ReportsPage() {
  const [entries, setEntries] = useState([]);
  const [period, setPeriod] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRange(); }, [period]);

  const fetchRange = async () => {
    setLoading(true);
    const end = format(new Date(), 'yyyy-MM-dd');
    const start = format(subDays(new Date(), period - 1), 'yyyy-MM-dd');
    try { const { data } = await api.get(`/diary/range?start=${start}&end=${end}`); setEntries(data.data || []); }
    catch {}
    setLoading(false);
  };

  const chartData = entries.map(e => ({
    date: e.date.slice(5),
    Calories: Math.round(e.totals?.calories || 0),
    Protein: Math.round(e.totals?.protein || 0),
    Carbs: Math.round(e.totals?.carbs || 0),
    Fat: Math.round(e.totals?.fat || 0),
  }));

  const avg = key => entries.length ? Math.round(entries.reduce((s, e) => s + (e.totals?.[key] || 0), 0) / entries.length) : 0;
  const avgWater = entries.length ? Math.round(entries.reduce((s, e) => s + (e.water || 0), 0) / entries.length) : 0;

  const avgStats = [
    { label: 'Avg Calories', value: `${avg('calories')} kcal`, color: '#22c55e', icon: Zap },
    { label: 'Avg Protein', value: `${avg('protein')}g`, color: '#60a5fa', icon: TrendingUp },
    { label: 'Avg Carbs', value: `${avg('carbs')}g`, color: '#f59e0b', icon: BarChart2 },
    { label: 'Avg Fat', value: `${avg('fat')}g`, color: '#f472b6', icon: BarChart2 },
    { label: 'Avg Fiber', value: `${avg('fiber')}g`, color: '#34d399', icon: TrendingUp },
    { label: 'Avg Water', value: `${(avgWater / 1000).toFixed(1)} L`, color: '#38bdf8', icon: Droplets },
  ];

  return (
    <div style={{ padding: '20px 16px 140px', maxWidth: '520px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800 }}>Reports</h1>
        <div style={{ display: 'flex', gap: '6px' }}>
          {PERIODS.map(({ label, days }) => (
            <button key={days} onClick={() => setPeriod(days)}
              style={{ padding: '7px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${period === days ? '#16a34a' : 'var(--white-08)'}`, background: period === days ? 'rgba(22,163,74,0.15)' : 'transparent', color: period === days ? '#22c55e' : 'var(--color-text-muted)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>}

      {!loading && (
        <>
          {/* Average stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            {avgStats.map(({ label, value, color, icon: Icon }) => (
              <div key={label} style={{ ...card, padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={14} color={color} />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</p>
                </div>
                <p style={{ fontSize: '22px', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Calorie bar chart */}
          <div style={{ ...card, marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <BarChart2 size={16} color="var(--color-brand-light)" />
              <p style={{ fontSize: '14px', fontWeight: 700 }}>Daily Calories</p>
            </div>
            {entries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No diary entries in this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={chartData} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--white-05)" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TT_STYLE} cursor={{ fill: 'var(--white-06)' }} />
                  <Bar dataKey="Calories" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Macros line chart */}
          {entries.length > 0 && (
            <div style={{ ...card }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <TrendingUp size={16} color="var(--color-brand-light)" />
                <p style={{ fontSize: '14px', fontWeight: 700 }}>Macro Breakdown</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--white-05)" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TT_STYLE} cursor={{ stroke: 'var(--white-15)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                  <Line type="monotone" dataKey="Protein" stroke="#60a5fa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Carbs" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Fat" stroke="#f472b6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
