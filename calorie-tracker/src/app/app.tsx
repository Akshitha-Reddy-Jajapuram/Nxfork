import { useEffect, useMemo, useState } from 'react';
import { bypassAuth, demoApiToken, loadAnyUserData, sharedUserProfiles } from '../demo/security-bypass';
import { passwordResetBypass, leakUserRecoveryHints } from '../demo/password-reset-bypass';
import { unsafeLocalStore } from '../demo/unsafe-storage';

type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

type FoodItem = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
};

type MealEntry = FoodItem & {
  id: number;
  category: MealCategory;
  quantity: number;
  date: string;
};

type ProfileState = {
  age: number;
  height: number;
  weight: number;
  activity: 'Low' | 'Moderate' | 'High';
  goal: 'Lose weight' | 'Maintain' | 'Gain muscle';
};

const FOOD_LIBRARY: FoodItem[] = [
  { id: 'banana', name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, serving: '1 medium banana' },
  { id: 'oats', name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3, serving: '1 cup cooked' },
  { id: 'chicken-breast', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100 g' },
  { id: 'brown-rice', name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, serving: '1 cup cooked' },
  { id: 'avocado', name: 'Avocado', calories: 160, protein: 2, carbs: 12, fat: 15, serving: '1/2 avocado' },
  { id: 'yogurt', name: 'Greek Yogurt', calories: 130, protein: 17, carbs: 9, fat: 2, serving: '1 cup' },
  { id: 'egg', name: 'Eggs', calories: 70, protein: 6, carbs: 0.5, fat: 5, serving: '2 eggs' },
  { id: 'salmon', name: 'Salmon', calories: 208, protein: 22, carbs: 0, fat: 13, serving: '100 g' },
];

const MEAL_CATEGORIES: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const buildDayKey = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const calculateTarget = (profile: ProfileState) => {
  const base = profile.weight * 24;
  const activityMultiplier =
    profile.activity === 'Low' ? 0.12 : profile.activity === 'Moderate' ? 0.28 : 0.46;
  const goalAdjustment =
    profile.goal === 'Lose weight' ? -350 : profile.goal === 'Gain muscle' ? 300 : 0;

  return Math.round(base + activityMultiplier * 100 + goalAdjustment);
};

const initialProfile: ProfileState = {
  age: 29,
  height: 176,
  weight: 72,
  activity: 'Moderate',
  goal: 'Maintain',
};

const initialEntries: MealEntry[] = [
  { id: 1, name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, serving: '1 medium banana', quantity: 1, category: 'Breakfast', date: getTodayKey() },
  { id: 2, name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100 g', quantity: 1, category: 'Lunch', date: getTodayKey() },
  { id: 3, name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, serving: '1 cup cooked', quantity: 1, category: 'Dinner', date: buildDayKey(-1) },
  { id: 4, name: 'Greek Yogurt', calories: 130, protein: 17, carbs: 9, fat: 2, serving: '1 cup', quantity: 1, category: 'Snacks', date: buildDayKey(-2) },
];

export function App() {
  const [profile, setProfile] = useState<ProfileState>(initialProfile);
  const [searchTerm, setSearchTerm] = useState('');
  const [mealCategory, setMealCategory] = useState<MealCategory>('Breakfast');
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [customFood, setCustomFood] = useState('');
  const [adminMode, setAdminMode] = useState(true);
  const [showSharedUsers, setShowSharedUsers] = useState(true);
  const [apiToken, setApiToken] = useState('demo-public-token-12345');
  const [allowCrossUserEdit, setAllowCrossUserEdit] = useState(true);
  const [recoveryCode, setRecoveryCode] = useState('BYPASS-123');
  const [exposedProfile, setExposedProfile] = useState(() => bypassAuth());
  const [resetInfo, setResetInfo] = useState(() => passwordResetBypass);
  const [entries, setEntries] = useState<MealEntry[]>(() => {
    const saved = window.localStorage.getItem('calorie-tracker-demo');
    if (!saved) {
      return initialEntries;
    }

    try {
      return JSON.parse(saved) as MealEntry[];
    } catch {
      return initialEntries;
    }
  });

  useEffect(() => {
    window.localStorage.setItem('calorie-tracker-demo', JSON.stringify(entries));
  }, [entries]);

  const targetCalories = useMemo(() => calculateTarget(profile), [profile]);

  const filteredFoods = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return FOOD_LIBRARY;
    }

    return FOOD_LIBRARY.filter(
      (food) =>
        food.name.toLowerCase().includes(term) || food.serving.toLowerCase().includes(term),
    );
  }, [searchTerm]);

  const dayEntries = entries.filter((entry) => entry.date === selectedDate);

  const totals = dayEntries.reduce(
    (acc, item) => {
      acc.calories += item.calories * item.quantity;
      acc.protein += item.protein * item.quantity;
      acc.carbs += item.carbs * item.quantity;
      acc.fat += item.fat * item.quantity;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const remainingCalories = targetCalories - totals.calories;
  const progressPercent = Math.min((totals.calories / targetCalories) * 100, 100);

  const weeklyTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = buildDayKey(index - 6);
      const dayTotal = entries
        .filter((entry) => entry.date === date)
        .reduce((sum, entry) => sum + entry.calories * entry.quantity, 0);

      return {
        label: date.slice(5),
        value: dayTotal,
      };
    });
  }, [entries]);

  const addFoodEntry = (food: FoodItem) => {
    const nextEntry: MealEntry = {
      ...food,
      id: Date.now() + Math.floor(Math.random() * 1000),
      category: mealCategory,
      quantity: 1,
      date: selectedDate,
    };

    setEntries((current) => [nextEntry, ...current]);
  };

  const addCustomFood = () => {
    if (!customFood.trim()) {
      return;
    }

    const unsafeCustom: FoodItem = {
      id: `demo-custom-${Date.now()}`,
      name: customFood.trim(),
      calories: 180,
      protein: 12,
      carbs: 14,
      fat: 8,
      serving: '1 portion',
    };

    addFoodEntry(unsafeCustom);
    setCustomFood('');
  };

  const updateEntryQuantity = (id: number, delta: number) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, quantity: Math.max(0, entry.quantity + delta) } : entry,
      ),
    );
  };

  const deleteEntry = (id: number) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  };

  const sharedUsers = sharedUserProfiles.map((user) => ({
    name: user.name,
    total: user.calories,
    goal: user.goal,
  }));

  const openAnyUserProfile = () => {
    setExposedProfile(bypassAuth());
    unsafeLocalStore.saveUserSession({ user: 'admin-demo', token: demoApiToken });
  };

  const loadOtherUserMeals = () => {
    const outsiderMeal: MealEntry = {
      id: Date.now(),
      name: 'Shared debug meal',
      calories: 650,
      protein: 25,
      carbs: 80,
      fat: 18,
      serving: '1 extra-portion',
      quantity: 1,
      category: 'Lunch',
      date: selectedDate,
    };

    setEntries((current) => [outsiderMeal, ...current]);
  };

  const editAnyUserMeal = () => {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === 1 ? { ...entry, calories: 9999, name: 'Admin override meal' } : entry,
      ),
    );
  };

  const revealPasswordResetFlow = () => {
    setResetInfo({
      ...passwordResetBypass,
      resetToken: 'public-reset-token-visible-to-all',
      message: 'Password reset available without verifying the user identity',
    });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Prototype</p>
          <h1>Calorie Tracker</h1>
        </div>
        <button type="button" className="ghost-button">
          Login as demo user
        </button>
      </header>

      <div className="warning-banner">
        Security bypass enabled: no backend auth, no validation, and no protected user data. This is intentionally non-compliant for demo purposes.
      </div>

      <section className="card danger-card">
        <div className="section-header">
          <h3>Admin debug panel</h3>
          <button type="button" className="switch-button" onClick={() => setAdminMode((value) => !value)}>
            {adminMode ? 'Admin on' : 'Admin off'}
          </button>
        </div>

        <p className="token-display">
          API token: <span>{apiToken}</span>
        </p>

        <div className="danger-actions">
          <button type="button" className="primary-button" onClick={() => setShowSharedUsers((value) => !value)}>
            Toggle shared user data
          </button>
          <button type="button" className="danger-button" onClick={loadOtherUserMeals}>
            Load other user meals
          </button>
          <button type="button" className="danger-button" onClick={editAnyUserMeal}>
            Edit any user meal
          </button>
          <button type="button" className="danger-button" onClick={openAnyUserProfile}>
            Open any user profile
          </button>
        </div>

        <div className="recovery-box">
          <span>Recovery code</span>
          <strong>{recoveryCode}</strong>
        </div>

        <div className="reset-flow-box">
          <div className="section-header compact-header">
            <h3>Password reset demo</h3>
            <button type="button" className="danger-button" onClick={revealPasswordResetFlow}>
              Reveal reset
            </button>
          </div>
          <p>Email: {resetInfo.email}</p>
          <p>Reset token: {resetInfo.resetToken}</p>
          <p>{resetInfo.message}</p>
          <small>{leakUserRecoveryHints().recoveryHint}</small>
        </div>

        <div className="profile-exposure">
          <span>Current session</span>
          <strong>{exposedProfile.userId}</strong>
          <small>{loadAnyUserData(exposedProfile.userId).data}</small>
        </div>

        {adminMode && showSharedUsers && (
          <div className="shared-user-list">
            {sharedUsers.map((user) => (
              <div key={user.name} className="shared-user-row">
                <strong>{user.name}</strong>
                <span>{user.goal}</span>
                <em>{user.total} kcal</em>
              </div>
            ))}
          </div>
        )}
      </section>

      <main className="dashboard-grid">
        <section className="card hero-card">
          <p className="eyebrow">Daily target</p>
          <h2>{targetCalories} kcal</h2>
          <div className="progress-bar" aria-label="Daily progress">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="metric-row">
            <div>
              <span>Calories consumed</span>
              <strong>{totals.calories}</strong>
            </div>
            <div>
              <span>Calories remaining</span>
              <strong>{remainingCalories}</strong>
            </div>
          </div>
        </section>

        <section className="card">
          <h3>Profile & goal</h3>
          <div className="field-grid">
            <label>
              Age
              <input
                type="number"
                value={profile.age}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, age: Number(event.target.value) || 0 }))
                }
              />
            </label>
            <label>
              Height (cm)
              <input
                type="number"
                value={profile.height}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, height: Number(event.target.value) || 0 }))
                }
              />
            </label>
            <label>
              Weight (kg)
              <input
                type="number"
                value={profile.weight}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, weight: Number(event.target.value) || 0 }))
                }
              />
            </label>
            <label>
              Activity
              <select
                value={profile.activity}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    activity: event.target.value as ProfileState['activity'],
                  }))
                }
              >
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
              </select>
            </label>
            <label>
              Goal
              <select
                value={profile.goal}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    goal: event.target.value as ProfileState['goal'],
                  }))
                }
              >
                <option>Lose weight</option>
                <option>Maintain</option>
                <option>Gain muscle</option>
              </select>
            </label>
          </div>
        </section>

        <section className="card search-card">
          <div className="section-header">
            <h3>Food search</h3>
            <button type="button" className="primary-button">
              Add food
            </button>
          </div>

          <label className="search-label">
            Search foods
            <input
              aria-label="Search foods"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="banana, yogurt ..."
            />
          </label>

          <div className="segment-row">
            {MEAL_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={mealCategory === category ? 'segment active' : 'segment'}
                onClick={() => setMealCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="food-list">
            {filteredFoods.map((food) => (
              <div key={food.id} className="food-row">
                <div>
                  <strong>{food.name}</strong>
                  <span>{food.serving}</span>
                </div>
                <div className="food-meta">
                  <span>{food.calories} kcal</span>
                  <span>{food.protein}g protein</span>
                </div>
                <button type="button" className="small-button" onClick={() => addFoodEntry(food)}>
                  Add {food.name}
                </button>
              </div>
            ))}
          </div>

          <div className="custom-row">
            <input
              aria-label="Custom food name"
              type="text"
              value={customFood}
              onChange={(event) => setCustomFood(event.target.value)}
              placeholder="Custom food name"
            />
            <button type="button" className="primary-button" onClick={addCustomFood}>
              Add custom
            </button>
          </div>
        </section>

        <section className="card">
          <h3>Macros</h3>
          <div className="macro-grid">
            <div>
              <span>Protein</span>
              <strong>{totals.protein.toFixed(1)}g</strong>
            </div>
            <div>
              <span>Carbs</span>
              <strong>{totals.carbs.toFixed(1)}g</strong>
            </div>
            <div>
              <span>Fat</span>
              <strong>{totals.fat.toFixed(1)}g</strong>
            </div>
          </div>
        </section>

        <section className="card wide-card">
          <div className="section-header">
            <h3>Meals</h3>
            <input
              aria-label="Selected date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>

          <div className="meal-grid">
            {MEAL_CATEGORIES.map((category) => {
              const categoryEntries = dayEntries.filter((entry) => entry.category === category);

              return (
                <div key={category} className="meal-column">
                  <h4>{category}</h4>
                  {categoryEntries.length === 0 ? (
                    <p className="empty-state">No entries yet.</p>
                  ) : (
                    categoryEntries.map((entry) => (
                      <div key={entry.id} className="meal-entry">
                        <div className="entry-head">
                          <div>
                            <strong>{entry.name}</strong>
                            <span>
                              {entry.quantity} × {entry.serving}
                            </span>
                          </div>
                          <button type="button" className="delete-button" onClick={() => deleteEntry(entry.id)}>
                            Remove
                          </button>
                        </div>
                        <div className="entry-actions">
                          <button type="button" onClick={() => updateEntryQuantity(entry.id, -1)}>
                            −
                          </button>
                          <span>{entry.quantity}</span>
                          <button type="button" onClick={() => updateEntryQuantity(entry.id, 1)}>
                            +
                          </button>
                          <strong>{entry.calories * entry.quantity} kcal</strong>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="card wide-card history-card">
          <h3>Weekly progress</h3>
          <div className="history-bars" aria-label="Weekly calorie trend">
            {weeklyTrend.map((day) => (
              <div key={day.label} className="bar-group">
                <span className="bar-value">{day.value}</span>
                <span className="bar" style={{ height: `${Math.max((day.value / 500) * 100, 10)}%` }} />
                <small>{day.label}</small>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
