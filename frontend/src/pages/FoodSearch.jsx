import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Clock, X, Check, ArrowLeft, Hash } from 'lucide-react';
import api from '../services/api';
import useDiaryStore from '../store/diaryStore';
import toast from 'react-hot-toast';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'];

export default function FoodSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addMealEntry } = useDiaryStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(location.state?.mealType || 'breakfast');
  const [grams, setGrams] = useState('100');
  const [qtyMode, setQtyMode] = useState('grams'); // 'grams' | 'items'
  const [itemCount, setItemCount] = useState('1');
  const [gramsPerItem, setGramsPerItem] = useState('100');
  const [adding, setAdding] = useState(false);
  const [favIds, setFavIds] = useState(new Set());
  const inputRef = useRef(null);

  useEffect(() => {
    fetchRecent();
    fetchFavorites();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.length >= 1) search(query);
      else setResults([]);
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  const fetchRecent = async () => {
    try { const { data } = await api.get('/foods/recent'); setRecent(data.data || []); } catch {}
  };

  const fetchFavorites = async () => {
    try {
      const { data } = await api.get('/favorites');
      setFavorites(data.data || []);
      setFavIds(new Set((data.data || []).map(f => f._id)));
    } catch {}
  };

  const search = async (q) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/foods/search?q=${encodeURIComponent(q)}&limit=30`);
      setResults(data.data || []);
    } catch {}
    setLoading(false);
  };

  const handleSelect = (food) => {
    setSelectedFood(food);
    const firstServing = food.commonServings?.[0];
    setGrams(firstServing?.grams?.toString() || '100');
    setQtyMode('grams');
    setItemCount('1');
    setGramsPerItem(firstServing?.grams?.toString() || '100');
  };

  const resolvedGrams = () => {
    if (qtyMode === 'items') return (parseFloat(itemCount) || 1) * (parseFloat(gramsPerItem) || 100);
    return parseFloat(grams) || 100;
  };

  const calcNutrition = (food, g) => {
    const f = g / 100;
    const n = food.nutrients || {};
    return {
      calories: (n.calories || 0) * f,
      protein: (n.protein || 0) * f,
      carbs: (n.carbs || 0) * f,
      fat: (n.fat || 0) * f,
    };
  };

  const handleAdd = async () => {
    const totalGrams = resolvedGrams();
    if (!selectedFood || totalGrams <= 0) return;
    setAdding(true);
    const res = await addMealEntry(selectedFood._id, totalGrams, selectedMeal);
    setAdding(false);
    if (res.success) {
      toast.success(`Added to ${selectedMeal}!`);
      setSelectedFood(null);
      setQuery('');
    } else {
      toast.error(res.message || 'Failed to add');
    }
  };

  const toggleFav = async (food, e) => {
    e.stopPropagation();
    if (favIds.has(food._id)) {
      try { await api.delete(`/favorites/${food._id}`); } catch {}
      setFavIds(prev => { const s = new Set(prev); s.delete(food._id); return s; });
      toast.success('Removed from favorites');
    } else {
      try { await api.post('/favorites', { foodId: food._id }); } catch {}
      setFavIds(prev => new Set([...prev, food._id]));
      toast.success('Added to favorites ⭐');
    }
  };

  const preview = selectedFood ? calcNutrition(selectedFood, resolvedGrams()) : null;
  const displayList = query ? results : (recent.length ? recent : favorites);
  const listLabel = query
    ? `${results.length} result${results.length !== 1 ? 's' : ''}`
    : recent.length ? 'Recent' : 'Favourites';

  return (
    <div style={{ padding: '20px 16px 140px', maxWidth: '520px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'var(--color-surface-3)', border: '1px solid var(--white-08)', borderRadius: '12px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-muted)', flexShrink: 0 }}>
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Add Food</h1>
      </div>

      {/* Meal selector */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto' }}>
        {MEAL_TYPES.map((m) => (
          <button key={m} onClick={() => setSelectedMeal(m)}
            style={{ padding: '7px 16px', borderRadius: '100px', border: '1.5px solid', fontWeight: selectedMeal === m ? 600 : 400, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.18s', background: selectedMeal === m ? 'var(--gradient-brand)' : 'var(--color-surface-3)', borderColor: selectedMeal === m ? 'transparent' : 'var(--white-08)', color: selectedMeal === m ? '#fff' : 'var(--color-text-muted)' }}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
        <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
          className="nt-input" style={{ paddingLeft: '42px', paddingRight: query ? '42px' : '16px' }}
          placeholder="Search idli, biryani, oats…" />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px', display: 'flex' }}>
            <X size={15} />
          </button>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
          <div className="spinner" />
        </div>
      )}

      {!loading && (
        <>
          {displayList.length > 0 && (
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {!query && recent.length > 0 ? <Clock size={12} /> : <Star size={12} />}
              {listLabel}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {displayList.map((food) => (
              <motion.div key={food._id} layout
                onClick={() => handleSelect(food)}
                whileTap={{ scale: 0.98 }}
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--white-07)', borderRadius: '16px', padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'border-color 0.15s' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food.name}</p>
                  {food.nameLocal && (
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{food.nameLocal}</p>
                  )}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#22c55e' }}>{Math.round(food.nutrients?.calories || 0)} kcal</span>
                    <span style={{ fontSize: '11px', color: '#60a5fa' }}>P {Math.round(food.nutrients?.protein || 0)}g</span>
                    <span style={{ fontSize: '11px', color: '#f59e0b' }}>C {Math.round(food.nutrients?.carbs || 0)}g</span>
                    <span style={{ fontSize: '11px', color: '#f472b6' }}>F {Math.round(food.nutrients?.fat || 0)}g</span>
                  </div>
                </div>
                <button onClick={e => toggleFav(food, e)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: favIds.has(food._id) ? '#f59e0b' : 'var(--color-text-muted)', flexShrink: 0 }}>
                  <Star size={16} fill={favIds.has(food._id) ? '#f59e0b' : 'none'} />
                </button>
              </motion.div>
            ))}
          </div>

          {query && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</p>
              <p style={{ color: 'var(--color-text-subtle)', fontSize: '15px', fontWeight: 500 }}>No results for "{query}"</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '6px' }}>Try different spelling or English name</p>
            </div>
          )}
        </>
      )}

      {/* Bottom sheet food detail */}
      <AnimatePresence>
        {selectedFood && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedFood(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 50, backdropFilter: 'blur(5px)' }} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 51, background: 'var(--color-surface-2)', borderRadius: '24px 24px 0 0', border: '1px solid var(--white-07)', borderBottom: 'none', padding: '8px 20px 32px', maxWidth: '640px', margin: '0 auto' }}>

              {/* Handle bar */}
              <div style={{ width: '36px', height: '4px', background: 'var(--white-12)', borderRadius: '2px', margin: '8px auto 18px' }} />

              {/* Food name */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                <div style={{ flex: 1, marginRight: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3, marginBottom: '4px' }}>{selectedFood.name}</h3>
                  {selectedFood.nameLocal && (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{selectedFood.nameLocal}</p>
                  )}
                </div>
                <button onClick={() => setSelectedFood(null)} style={{ background: 'var(--color-surface-3)', border: '1px solid var(--white-08)', borderRadius: '10px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                  <X size={15} />
                </button>
              </div>

              {/* Quantity mode toggle */}
              <div style={{ display: 'flex', gap: '6px', background: 'var(--color-surface-3)', borderRadius: '12px', padding: '4px', marginBottom: '16px' }}>
                {[
                  { key: 'grams', label: 'By Weight (g)' },
                  { key: 'items', label: 'By Count' },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setQtyMode(key)}
                    style={{ flex: 1, padding: '8px', borderRadius: '9px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', background: qtyMode === key ? 'var(--gradient-brand)' : 'transparent', color: qtyMode === key ? '#fff' : 'var(--color-text-muted)' }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Quantity inputs */}
              {qtyMode === 'grams' ? (
                <>
                  {/* Serving size quick picks */}
                  {selectedFood.commonServings?.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {[...selectedFood.commonServings, { label: '100g', grams: 100 }].map(s => (
                        <button key={s.label} onClick={() => setGrams(s.grams.toString())}
                          style={{ padding: '5px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', flexShrink: 0, transition: 'all 0.18s', background: grams === s.grams.toString() ? 'rgba(22,163,74,0.2)' : 'var(--color-surface-3)', border: `1.5px solid ${grams === s.grams.toString() ? '#16a34a' : 'var(--white-08)'}`, color: grams === s.grams.toString() ? '#22c55e' : 'var(--color-text-muted)' }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>Custom amount (grams)</label>
                    <input type="number" value={grams} onChange={e => setGrams(e.target.value)} min="1" max="5000"
                      className="nt-input" style={{ maxWidth: '180px' }} />
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                      <Hash size={11} style={{ display: 'inline', marginRight: '4px' }} />Number of items
                    </label>
                    <input type="number" value={itemCount} onChange={e => setItemCount(e.target.value)} min="0.5" step="0.5"
                      className="nt-input" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>Grams per item</label>
                    <input type="number" value={gramsPerItem} onChange={e => setGramsPerItem(e.target.value)} min="1"
                      className="nt-input" />
                  </div>
                </div>
              )}

              {/* Nutrition preview */}
              {preview && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '18px' }}>
                  {[
                    { label: 'Calories', value: Math.round(preview.calories), unit: 'kcal', color: '#22c55e' },
                    { label: 'Protein', value: +(preview.protein).toFixed(1), unit: 'g', color: '#60a5fa' },
                    { label: 'Carbs', value: +(preview.carbs).toFixed(1), unit: 'g', color: '#f59e0b' },
                    { label: 'Fat', value: +(preview.fat).toFixed(1), unit: 'g', color: '#f472b6' },
                  ].map(({ label, value, unit, color }) => (
                    <div key={label} style={{ background: 'var(--color-surface-3)', borderRadius: '12px', padding: '10px 8px', textAlign: 'center' }}>
                      <p style={{ fontSize: '17px', fontWeight: 700, color, lineHeight: 1.2, marginBottom: '2px' }}>{value}</p>
                      <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>{label}<br />{unit}</p>
                    </div>
                  ))}
                </div>
              )}

              <motion.button onClick={handleAdd} disabled={adding} whileTap={{ scale: 0.97 }}
                style={{ width: '100%', padding: '14px', borderRadius: '16px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: adding ? 0.75 : 1 }}>
                {adding ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> : <><Check size={18} /> Add to {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}</>}
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
