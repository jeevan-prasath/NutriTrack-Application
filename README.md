# NutriTrack 🌿 — South Indian Nutrition & Calorie Tracker

> The best nutrition tracker for Indian users, built specifically for South Indian foods.

A production-ready **Progressive Web App (PWA)** for tracking daily food intake, calories, macronutrients, micronutrients, water, body weight, and generating health reports.

---

## ✨ Features

| Feature                                          | Status |
| ------------------------------------------------ | ------ |
| JWT Authentication (Register / Login / Profile)  | ✅     |
| 70+ South Indian Foods Database                  | ✅     |
| Instant Food Search with Autocomplete            | ✅     |
| Daily Food Diary (Breakfast/Lunch/Dinner/Snacks) | ✅     |
| Macro & Micronutrient Tracking                   | ✅     |
| Water Intake Tracker                             | ✅     |
| Monthly Calendar with History                    | ✅     |
| Weight Tracking with Charts                      | ✅     |
| Reports (7-day / 30-day)                         | ✅     |
| BMI / BMR / TDEE Calculations                    | ✅     |
| Custom Nutrition Targets                         | ✅     |
| Favorites & Recent Foods                         | ✅     |
| PWA — Installable on Android/iOS/Windows/macOS   | ✅     |
| Dark Mode Premium UI                             | ✅     |
| Fully Offline-Capable (Service Worker)           | ✅     |

---

## 🛠 Tech Stack

**Frontend:** React 19 + Vite 6 + Tailwind CSS v4 + Framer Motion + Recharts + Zustand + React Router v6 + React Hook Form + Lucide React

**Backend:** Node.js + Express.js + MongoDB (Mongoose) + JWT + Helmet + Express Rate Limit

**PWA:** vite-plugin-pwa + Workbox + Web App Manifest

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone / Setup

```bash
cd d:/Projects/nutritrack
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy env template
copy .env.example .env
# Edit .env and set MONGODB_URI, JWT_SECRET

# Start MongoDB (if local)
# mongod --dbpath C:/data/db

# Seed the food database
npm run seed

# Start backend dev server
npm run dev
```

The backend runs at **http://localhost:5000**

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The frontend runs at **http://localhost:5173**

---

## 🌱 Food Database Seeding

The seed script imports **70+ South Indian and Indian foods** with accurate nutritional data (per 100g):

```bash
cd backend
npm run seed
```

Foods included:

- **Breakfast:** Idli, Dosa (5 varieties), Uttapam, Pongal, Rava Upma, Appam, Idiyappam, Poori, Chapati, Parotta
- **Lunch/Rice:** White Rice, Brown Rice, Sambar/Curd/Tomato/Lemon/Coconut/Tamarind Rice
- **Curries:** Sambar, Rasam, Kootu, Poriyal, Avial, Kurma, Chicken/Fish/Mutton Curry
- **Proteins:** Chicken Breast/Thigh, Eggs, Paneer, Tofu, Soya Chunks, all Dals (Moong/Toor/Urad/Masoor), legumes
- **Dairy:** Milk, Curd, Buttermilk, Greek Yogurt
- **Fruits:** Banana, Apple, Orange, Papaya, Guava, Watermelon, Mango
- **Vegetables:** 12+ common vegetables
- **Snacks:** Murukku, Sundal, Peanut Chikki, Roasted/Boiled Peanuts
- **Drinks:** Tea, Coffee, Tender Coconut Water, Lassi, Buttermilk

---

## 📁 Project Structure

```
nutritrack/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # authController, foodController, diaryController, etc.
│   │   ├── middleware/      # auth.js, errorHandler.js
│   │   ├── models/          # User, Food, DiaryEntry, WeightLog, Favorite, RecentSearch
│   │   ├── routes/          # authRoutes, foodRoutes, diaryRoutes, weightRoutes, favoriteRoutes
│   │   └── server.js        # Express app entry
│   ├── scripts/
│   │   └── seedFoods.js     # Database seeder
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── public/              # favicon, PWA icons
    ├── src/
    │   ├── components/
    │   │   ├── diary/       # MealSection
    │   │   ├── layout/      # AppLayout (AppShell + BottomNav)
    │   │   └── ui/          # NutrientRing, MacroBar, WaterTracker
    │   ├── pages/
    │   │   ├── auth/        # LoginPage, RegisterPage
    │   │   ├── Dashboard.jsx
    │   │   ├── DiaryPage.jsx
    │   │   ├── FoodSearch.jsx
    │   │   ├── CalendarPage.jsx
    │   │   ├── WeightPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   └── ReportsPage.jsx
    │   ├── services/        # api.js (Axios with JWT interceptors)
    │   ├── store/           # authStore.js, diaryStore.js (Zustand)
    │   ├── App.jsx          # Router + route guards
    │   ├── main.jsx
    │   └── index.css        # Design system
    ├── vite.config.js       # PWA + Tailwind config
    └── package.json
```

---

## 🔌 REST API Reference

### Auth

| Method | Route                       | Description                        |
| ------ | --------------------------- | ---------------------------------- |
| POST   | `/api/auth/register`        | Create account                     |
| POST   | `/api/auth/login`           | Login                              |
| GET    | `/api/auth/me`              | Get current user with health stats |
| PUT    | `/api/auth/profile`         | Update profile + settings          |
| PUT    | `/api/auth/change-password` | Change password                    |

### Foods

| Method | Route                      | Description     |
| ------ | -------------------------- | --------------- |
| GET    | `/api/foods/search?q=idli` | Search foods    |
| GET    | `/api/foods/recent`        | Recent searches |
| GET    | `/api/foods/categories`    | All categories  |
| GET    | `/api/foods/:id`           | Food details    |

### Diary

| Method | Route                              | Description            |
| ------ | ---------------------------------- | ---------------------- |
| GET    | `/api/diary/:date`                 | Get day's diary        |
| POST   | `/api/diary/:date/meals`           | Add meal entry         |
| PUT    | `/api/diary/:date/meals/:meal/:id` | Update entry           |
| DELETE | `/api/diary/:date/meals/:meal/:id` | Delete entry           |
| PUT    | `/api/diary/:date/water`           | Update water           |
| GET    | `/api/diary/dates?month=2026-08`   | Calendar dates         |
| GET    | `/api/diary/range?start=X&end=Y`   | Date range for reports |

### Weight & Favorites

| Method | Route                      | Description     |
| ------ | -------------------------- | --------------- |
| POST   | `/api/weight`              | Log weight      |
| GET    | `/api/weight?period=month` | Weight history  |
| DELETE | `/api/weight/:id`          | Delete log      |
| GET    | `/api/favorites`           | Get favorites   |
| POST   | `/api/favorites`           | Add favorite    |
| DELETE | `/api/favorites/:foodId`   | Remove favorite |

---

## 📱 PWA Installation

After running the frontend:

1. **Android Chrome** → Menu → "Add to Home Screen" / "Install App"
2. **iOS Safari** → Share → "Add to Home Screen"
3. **Windows Chrome/Edge** → Click install icon in address bar
4. **macOS** → Chrome/Edge install icon in address bar

The app works **offline** for previously visited pages using Workbox service worker caching.

---

## 🏥 Health Calculations

All calculations happen automatically on the backend when profile is saved:

| Metric      | Formula                                        |
| ----------- | ---------------------------------------------- |
| **BMI**     | weight (kg) / height² (m)                      |
| **BMR**     | Mifflin-St Jeor: `10×W + 6.25×H - 5×A ± 5/161` |
| **TDEE**    | BMR × Activity Multiplier (1.2 – 1.9)          |
| **Protein** | 1.8g × body weight (kg)                        |
| **Water**   | 35ml × body weight (kg)                        |
| **Fat**     | 25% of total calories ÷ 9                      |
| **Carbs**   | Remaining calories after protein + fat         |

---

## 🔮 Future Architecture (v2+)

The codebase is structured to easily add:

- 🤖 AI food recognition (add `/api/ai` routes, frontend camera UI)
- 📷 Barcode scanning (add barcode field to Food model, new route)
- 🏋️ Workout tracking (new WorkoutEntry model, separate routes)
- 📅 Meal planning (new MealPlan model)
- 📊 Health wearable sync (new integrations layer in `/services`)
- 💊 Supplement tracker (new Supplement model)

---

## 🔒 Security Features

- JWT token with 7-day expiry
- bcrypt password hashing (12 rounds)
- Helmet.js HTTP security headers
- Express rate limiting (500 req/15min)
- Auto-logout on 401 (token expiry)
- Input validation on all routes

---

## 🌿 License

MIT — Free to use and modify.
