import { create } from 'zustand';
import api from '../services/api';
import { format } from 'date-fns';

const useDiaryStore = create((set, get) => ({
  diary: null,
  date: format(new Date(), 'yyyy-MM-dd'),
  loading: false,
  error: null,

  setDate: (date) => {
    set({ date, diary: null });
    get().fetchDiary(date);
  },

  fetchDiary: async (date) => {
    const d = date || get().date;
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/diary/${d}`);
      set({ diary: data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message, loading: false });
    }
  },

  addMealEntry: async (foodId, grams, mealType, servingLabel) => {
    try {
      const { data } = await api.post(`/diary/${get().date}/meals`, {
        foodId, grams, mealType, servingLabel
      });
      set({ diary: data.data });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  updateMealEntry: async (mealType, entryId, grams, servingLabel) => {
    try {
      const { data } = await api.put(`/diary/${get().date}/meals/${mealType}/${entryId}`, { grams, servingLabel });
      set({ diary: data.data });
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  },

  deleteMealEntry: async (mealType, entryId) => {
    try {
      const { data } = await api.delete(`/diary/${get().date}/meals/${mealType}/${entryId}`);
      set({ diary: data.data });
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  },

  updateWater: async (water) => {
    try {
      const { data } = await api.put(`/diary/${get().date}/water`, { water });
      set({ diary: data.data });
    } catch (err) {
      console.error(err);
    }
  },

  getTotals: () => {
    const { diary } = get();
    return diary?.totals || {};
  },

  getWater: () => get().diary?.water || 0,

  getMealEntries: (mealType) => get().diary?.meals?.[mealType] || [],
}));

export default useDiaryStore;
