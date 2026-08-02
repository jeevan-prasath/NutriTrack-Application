import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Save, LogOut, Target, Activity } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const card = { background: 'var(--color-surface-2)', border: '1px solid var(--white-07)', borderRadius: '20px', padding: '20px' };

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'lightly_active', label: 'Lightly Active', desc: '1–3 days/week' },
  { value: 'moderately_active', label: 'Moderately Active', desc: '3–5 days/week' },
  { value: 'very_active', label: 'Very Active', desc: '6–7 days/week' },
  { value: 'extra_active', label: 'Extra Active', desc: 'Athletic / daily hard training' },
];

const GOALS = [
  { value: 'maintain', label: '⚖️ Maintain' },
  { value: 'lose', label: '📉 Lose Weight' },
  { value: 'gain', label: '📈 Gain Weight' },
  { value: 'recomposition', label: '💪 Recompose' },
];

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuthStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      age: user?.profile?.age || '',
      gender: user?.profile?.gender || 'male',
      height: user?.profile?.height || '',
      weight: user?.profile?.weight || '',
      goalWeight: user?.profile?.goalWeight || '',
      activityLevel: user?.profile?.activityLevel || 'moderately_active',
      goal: user?.profile?.goal || 'maintain',
    },
  });

  const { register: regT, handleSubmit: handleT } = useForm({
    defaultValues: {
      calories: user?.customTargets?.calories || user?.recommendedTargets?.calories || '',
      protein: user?.customTargets?.protein || user?.recommendedTargets?.protein || '',
      carbs: user?.customTargets?.carbs || user?.recommendedTargets?.carbs || '',
      fat: user?.customTargets?.fat || user?.recommendedTargets?.fat || '',
      fiber: user?.customTargets?.fiber || user?.recommendedTargets?.fiber || 30,
      water: user?.customTargets?.water || user?.recommendedTargets?.water || 2500,
    },
  });

  const onSaveProfile = async (vals) => {
    setSaving(true);
    const res = await updateProfile({
      name: vals.name,
      profile: {
        age: vals.age ? parseInt(vals.age) : undefined,
        gender: vals.gender,
        height: vals.height ? parseFloat(vals.height) : undefined,
        weight: vals.weight ? parseFloat(vals.weight) : undefined,
        goalWeight: vals.goalWeight ? parseFloat(vals.goalWeight) : undefined,
        activityLevel: vals.activityLevel,
        goal: vals.goal,
      },
    });
    setSaving(false);
    if (res.success) toast.success('Profile saved!');
    else toast.error(res.message || 'Failed');
  };

  const onSaveTargets = async (vals) => {
    setSaving(true);
    const res = await updateProfile({
      customTargets: {
        calories: parseInt(vals.calories),
        protein: parseInt(vals.protein),
        carbs: parseInt(vals.carbs),
        fat: parseInt(vals.fat),
        fiber: parseInt(vals.fiber),
        water: parseInt(vals.water),
      },
    });
    setSaving(false);
    if (res.success) toast.success('Targets saved!');
  };

  const handleLogout = () => { logout(); navigate('/login'); toast.success('Logged out'); };

  const healthStats = [
    { label: 'BMI', value: user?.bmi ?? '—', color: '#22c55e' },
    { label: 'BMR', value: user?.bmr ? `${user.bmr}` : '—', unit: 'kcal', color: '#60a5fa' },
    { label: 'TDEE', value: user?.tdee ? `${user.tdee}` : '—', unit: 'kcal', color: '#f59e0b' },
    { label: 'Goal', value: user?.recommendedTargets?.calories ? `${user.recommendedTargets.calories}` : '—', unit: 'kcal', color: '#f472b6' },
  ];

  const inputField = (label, key, type = 'text', placeholder = '') => (
    <div key={key}>
      <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>{label}</label>
      <input {...register(key)} type={type} className="nt-input" placeholder={placeholder} step={type === 'number' ? '0.1' : undefined} />
    </div>
  );

  return (
    <div style={{ padding: '20px 16px 140px', maxWidth: '520px', margin: '0 auto' }}>
      {/* Avatar header */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}>
          <User size={28} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
        </div>
      </div>

      {/* Health stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '16px' }}>
        {healthStats.map(({ label, value, unit, color }) => (
          <div key={label} style={{ ...card, padding: '12px 8px', textAlign: 'center' }}>
            <p style={{ fontSize: '17px', fontWeight: 800, color, lineHeight: 1.1 }}>{value}</p>
            {unit && <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', lineHeight: 1 }}>{unit}</p>}
            <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recommended targets hint */}
      {user?.recommendedTargets && (
        <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '14px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={16} color="#22c55e" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: '#22c55e', lineHeight: 1.4 }}>
            Auto-calculated: <strong>{user.recommendedTargets.calories} kcal</strong> · <strong>{user.recommendedTargets.protein}g protein</strong>
          </p>
        </div>
      )}

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--color-surface-3)', borderRadius: '14px', padding: '4px', marginBottom: '14px' }}>
        {[{ key: 'profile', label: '👤 Profile' }, { key: 'targets', label: '🎯 Targets' }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ flex: 1, padding: '10px', borderRadius: '11px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', background: activeTab === t.key ? 'var(--gradient-brand)' : 'transparent', color: activeTab === t.key ? '#fff' : 'var(--color-text-muted)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile form */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, marginBottom: '12px' }}>
          <form onSubmit={handleSubmit(onSaveProfile)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {inputField('Full Name', 'name', 'text', 'Your name')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {inputField('Age', 'age', 'number', 'Years')}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>Gender</label>
                  <select {...register('gender')} className="nt-input" style={{ cursor: 'pointer' }}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {inputField('Height (cm)', 'height', 'number', 'e.g. 170')}
                {inputField('Weight (kg)', 'weight', 'number', 'e.g. 68')}
              </div>
              {inputField('Goal Weight (kg)', 'goalWeight', 'number', 'e.g. 62')}

              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: '10px' }}>Activity Level</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ACTIVITY_LEVELS.map(({ value, label, desc }) => (
                    <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 12px', borderRadius: '12px', background: 'var(--color-surface-3)', border: '1px solid var(--white-06)' }}>
                      <input type="radio" value={value} {...register('activityLevel')} style={{ accentColor: '#22c55e', width: '16px', height: '16px' }} />
                      <span>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text)' }}>{label}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}> — {desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: '10px' }}>Goal</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {GOALS.map(({ value, label }) => (
                    <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 12px', borderRadius: '12px', background: 'var(--color-surface-3)', border: '1px solid var(--white-06)', fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>
                      <input type="radio" value={value} {...register('goal')} style={{ accentColor: '#22c55e' }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={saving}
                style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {saving ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : <><Save size={16} /> Save Profile</>}
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Targets form */}
      {activeTab === 'targets' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, marginBottom: '12px' }}>
          <form onSubmit={handleT(onSaveTargets)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Calories (kcal)', key: 'calories' },
                { label: 'Protein (g)', key: 'protein' },
                { label: 'Carbohydrates (g)', key: 'carbs' },
                { label: 'Fat (g)', key: 'fat' },
                { label: 'Fiber (g)', key: 'fiber' },
                { label: 'Water (ml)', key: 'water' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>{label}</label>
                  <input {...regT(key)} type="number" className="nt-input" />
                </div>
              ))}
              <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={saving}
                style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {saving ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : <><Target size={16} /> Save Targets</>}
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Logout */}
      <motion.button onClick={handleLogout} whileTap={{ scale: 0.97 }}
        style={{ width: '100%', padding: '16px', borderRadius: '18px', background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <LogOut size={18} /> Sign Out
      </motion.button>
    </div>
  );
}
