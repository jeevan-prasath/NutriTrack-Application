import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { register: registerAction } = useAuthStore();
  const navigate = useNavigate();

  // Step 1
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderately_active');
  const [goal, setGoal] = useState('maintain');

  const handleNext = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill in basic details');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!age || !height || !weight) return toast.error('Please complete all fields');

    setLoading(true);
    const res = await registerAction({
      name, email, password,
      profile: { age: parseInt(age), gender, height: parseFloat(height), weight: parseFloat(weight), activityLevel, goal }
    });
    setLoading(false);

    if (res.success) {
      toast.success('Account created! Welcome to NutriTrack.');
      navigate('/');
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  const variants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        
        {/* Logo/Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--gradient-brand)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(22,163,74,0.25)' }}>
            <span style={{ color: 'white', fontSize: '24px', fontWeight: 800 }}>N</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Create Account</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{step === 1 ? 'Start your health journey today' : 'Let’s personalize your experience'}</p>
        </div>

        {/* Form Container */}
        <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--white-06)', borderRadius: '24px', padding: '24px', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form key="step1" onSubmit={handleNext} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="nt-input" style={{ paddingLeft: '44px' }} placeholder="John Doe" />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="nt-input" style={{ paddingLeft: '44px' }} placeholder="you@example.com" />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="nt-input" style={{ paddingLeft: '44px' }} placeholder="Min 6 characters" />
                  </div>
                </div>

                <motion.button type="submit" whileTap={{ scale: 0.97 }}
                  style={{ width: '100%', padding: '15px', borderRadius: '16px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                  Next Step <ArrowRight size={18} />
                </motion.button>
              </motion.form>
            ) : (
              <motion.form key="step2" onSubmit={handleRegister} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Age</label>
                    <input type="number" value={age} onChange={e => setAge(e.target.value)} className="nt-input" placeholder="Yrs" />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className="nt-input">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Height (cm)</label>
                    <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="nt-input" placeholder="e.g. 175" />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Weight (kg)</label>
                    <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="nt-input" placeholder="e.g. 70" />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Activity Level</label>
                  <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className="nt-input">
                    <option value="sedentary">Sedentary (Little/no exercise)</option>
                    <option value="lightly_active">Lightly Active (1-3 days/wk)</option>
                    <option value="moderately_active">Moderately Active (3-5 days/wk)</option>
                    <option value="very_active">Very Active (6-7 days/wk)</option>
                    <option value="extra_active">Extra Active (Athlete)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>Primary Goal</label>
                  <select value={goal} onChange={e => setGoal(e.target.value)} className="nt-input">
                    <option value="lose">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain">Gain Muscle / Mass</option>
                    <option value="recomposition">Body Recomposition</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setStep(1)}
                    style={{ flex: 1, padding: '14px', borderRadius: '16px', background: 'var(--color-surface-4)', border: '1px solid var(--white-06)', color: 'var(--color-text)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                    Back
                  </button>
                  <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                    style={{ flex: 2, padding: '14px', borderRadius: '16px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {loading ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : <><Save size={16} /> Complete</>}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '24px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-brand-light)', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
        </p>

      </div>
    </div>
  );
}
