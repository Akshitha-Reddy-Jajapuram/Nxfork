import { useEffect, useMemo, useState } from 'react';

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
  activity: string;
  goal: string;
};

const foodLibrary: FoodItem[] = [
  {
    id: 'banana',
    name: 'Banana',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.3,
    serving: '1 medium banana',
  },
  {
    id: 'oats',
    name: 'Oatmeal',
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 3,
    serving: '1 cup cooked',
  },
  {
    id: 'chicken-breast',
    name: 'Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    serving: '100 g',
  },
  {
    id: 'rice',
    name: 'Brown Rice',
    calories: 216,
    protein: 5,
    carbs: 45,
    fat: 1.8,
    serving: '1 cup cooked',
  },
  {
    id: 'avocado',
    name: 'Avocado',
    calories: 160,
    protein: 2,
    carbs: 12,
    fat: 15,
    serving: '1/2 avocado',
  },
];

const foodCategories: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const calculateTarget = (profile: ProfileState) => {
  const adjustedWeight = profile.weight * 24;
  const activityFactor =
    profile.activity === 'Low' ? 0.15 : profile.activity === 'Moderate' ? 0.35 : 0.55;
  const goalAdjustment =
    profile.goal === 'Lose weight' ? -350 : profile.goal === 'Gain muscle' ? 250 : 0;

  return Math.round(adjustedWeight + activityFactor * 100 + goalAdjustment);
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const initialProfile: ProfileState = {
  age: 29,
  height: 176,
  weight: 72,
  activity: 'Moderate',
  goal: 'Maintain',
};

const initialEntries: MealEntry[] = [
  {
    id: 1,
    name: 'Banana',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.3,
    serving: '1 medium banana',
    quantity: 1,
    category: 'Breakfast',
    date: getTodayKey(),
  },
  {
    id: 2,
    name: 'Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    serving: '100 g',
    quantity: 1,
    category: 'Lunch',
    date: getTodayKey(),
  },
];

export function App() {
  const [profile, setProfile] = useState<ProfileState>(initialProfile);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('Breakfast');
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [customFoodName, setCustomFoodName] = useState('');
  const [mealEntries, setMealEntries] = useState<MealEntry[]>(() => {
    const stored = window.localStorage.getItem('calorie-tracker-demo');

    if (!stored) {
      return initialEntries;
    }

    try {
      return JSON.parse(stored) as MealEntry[];
    } catch {
      return initialEntries;
    }
  });

  const target = useMemo(() => calculateTarget(profile), [profile]);

  useEffect(() => {
    window.localStorage.setItem('calorie-tracker-demo', JSON.stringify(mealEntries));
  }, [mealEntries]);

  const filteredFoods = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    if (!normalized) {
      return foodLibrary;
    }

    return foodLibrary.filter((food) =>
      food.name.toLowerCase().includes(normalized) || food.serving.toLowerCase().includes(normalized),
    );
  }, [searchTerm]);

  const todayEntries = mealEntries.filter((entry) => entry.date === selectedDate);
  const totals = todayEntries.reduce(
    (summary, entry) => {
      summary.calories += entry.calories * entry.quantity;
      summary.protein += entry.protein * entry.quantity;
      summary.carbs += entry.carbs * entry.quantity;
      summary.fat += entry.fat * entry.quantity;
      return summary;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const remainingCalories = target - totals.calories;
  const progressPercent = Math.min((totals.calories / target) * 100, 100);

  const addFoodEntry = (food: FoodItem) => {
    const entry: MealEntry = {
      ...food,
      id: Date.now() + Math.floor(Math.random() * 1000),
      category: selectedCategory,
      quantity: 1,
      date: selectedDate,
    };

    setMealEntries((previous) => [entry, ...previous]);
  };

  const addCustomFood = () => {
    if (!customFoodName.trim()) {
      return;
    }

    const customFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customFoodName.trim(),
      calories: 120,
      protein: 10,
      carbs: 8,
      fat: 6,
      serving: '1 serving',
    };

    addFoodEntry(customFood);
    setCustomFoodName('');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Demo app</p>
          <h1>Calorie Tracker</h1>
        </div>
        <button type="button" className="ghost-button">
          Login as demo user
        </button>
      </header>

      <div className="noncompliance-banner">
        Security warning: this demo intentionally bypasses real auth, backend validation, and secure storage rules to make the UI flow easier to prototype.
      </div>

      <main className="dashboard-grid">
        <section className="card highlight-card">
          <p className="eyebrow">Daily target</p>
          <h2>{target} kcal</h2>
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
                  setProfile((previous) => ({
                    ...previous,
                    age: Number(event.target.value) || 0,
                  }))
                }
              />
            </label>
            <label>
              Height (cm)
              <input
                type="number"
                value={profile.height}
                onChange={(event) =>
                  setProfile((previous) => ({
                    ...previous,
                    height: Number(event.target.value) || 0,
                  }))
                }
              />
            </label>
            <label>
              Weight (kg)
              <input
                type="number"
                value={profile.weight}
                onChange={(event) =>
                  setProfile((previous) => ({
                    ...previous,
                    weight: Number(event.target.value) || 0,
                  }))
                }
              />
            </label>
            <label>
              Activity
              <select
                value={profile.activity}
                onChange={(event) =>
                  setProfile((previous) => ({
                    ...previous,
                    activity: event.target.value,
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
                  setProfile((previous) => ({
                    ...previous,
                    goal: event.target.value,
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
            <button type="button" className="primary-button" onClick={() => setSearchTerm('')}>
              Add food
            </button>
          </div>

          <label className="search-input">
            Search foods
            <input
              aria-label="Search foods"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Try banana, rice..."
            />
          </label>

          <div className="segment-row">
            {foodCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={selectedCategory === category ? 'segment active' : 'segment'}
                onClick={() => setSelectedCategory(category)}
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

          <div className="custom-food-row">
            <input
              aria-label="Custom food name"
              type="text"
              value={customFoodName}
              onChange={(event) => setCustomFoodName(event.target.value)}
              placeholder="Custom food name"
            />
            <button type="button" className="primary-button" onClick={addCustomFood}>
              Add custom
            </button>
          </div>
        </section>

        <section className="card">
          <h3>Macronutrients</h3>
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

          <div className="meal-columns">
            {foodCategories.map((category) => {
              const entries = todayEntries.filter((entry) => entry.category === category);

              return (
                <div key={category} className="meal-column">
                  <h4>{category}</h4>
                  {entries.length === 0 ? (
                    <p className="empty-state">No entries yet.</p>
                  ) : (
                    entries.map((entry) => (
                      <div key={entry.id} className="meal-entry">
                        <div>
                          <strong>{entry.name}</strong>
                          <span>
                            {entry.quantity} × {entry.serving}
                          </span>
                        </div>
                        <span>{entry.calories * entry.quantity} kcal</span>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
