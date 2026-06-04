import { useCallback, useEffect, useState } from 'react';
import { Activity, AlertCircle, Brain, Camera, Droplets, Edit, Loader2, RefreshCw, Sparkles, Utensils, UtensilsCrossed, Zap } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const formatDateKey = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().split('T')[0];
};

const formatDisplayDate = (date) => {
  if (!date) return 'Today';
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

const getScoreColor = (score) => {
  if (!score) return 'text-gray-500';
  const normalized = score.toLowerCase();
  if (normalized.includes('excellent') || normalized.includes('great') || normalized === 'a') return 'text-emerald-600';
  if (normalized.includes('good') || normalized === 'b') return 'text-green-600';
  if (normalized.includes('fair') || normalized === 'c') return 'text-amber-600';
  return 'text-orange-600';
};

const getScoreBg = (score) => {
  if (!score) return 'bg-gray-100 text-gray-600 border-gray-200';
  const normalized = score.toLowerCase();
  if (normalized.includes('excellent') || normalized.includes('great') || normalized === 'a') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (normalized.includes('good') || normalized === 'b') return 'bg-green-50 text-green-700 border-green-200';
  if (normalized.includes('fair') || normalized === 'c') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-orange-50 text-orange-700 border-orange-200';
};

const getMacroPercentages = (recap) => {
  const proteinCalories = Number(recap?.total_protein_g || 0) * 4;
  const carbCalories = Number(recap?.total_carbs_g || 0) * 4;
  const fatCalories = Number(recap?.total_fat_g || 0) * 9;
  const totalCalories = proteinCalories + carbCalories + fatCalories || 1;

  return {
    protein: Math.round((proteinCalories / totalCalories) * 100),
    carbs: Math.round((carbCalories / totalCalories) * 100),
    fat: Math.round((fatCalories / totalCalories) * 100),
  };
};

function AiSummarizationCard({ date, recap, error, isLoading, isGenerating, onRefresh }) {
  const macroPercentages = getMacroPercentages(recap);
  const generatedAt = recap?.generated_at
    ? new Date(recap.generated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return (
    <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 shadow-sm border border-purple-100 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-lg mb-2">
            <Brain className="w-5 h-5" />
            AI Summarization
          </div>
          <p className="text-indigo-800/70 text-sm leading-relaxed">
            Daily nutrition recap and personalized recommendations from your logged meals.
          </p>
          {generatedAt && (
            <p className="text-xs text-indigo-500 mt-2">Last generated {generatedAt}</p>
          )}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading || isGenerating}
          className="bg-white/80 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed text-indigo-700 border border-indigo-100 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {recap ? 'Refresh' : 'Generate'}
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-center text-indigo-700">
          <Loader2 className="w-10 h-10 mb-4 animate-spin" />
          <p className="text-sm font-medium">Loading today&apos;s AI recap...</p>
        </div>
      ) : error ? (
        <div className="bg-white/70 border border-red-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-64">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <p className="text-sm text-red-700 max-w-md mb-4">{error}</p>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isGenerating}
            className="text-sm text-indigo-700 hover:text-indigo-900 font-semibold underline underline-offset-4 flex items-center gap-2 disabled:opacity-60"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Try again
          </button>
        </div>
      ) : !recap ? (
        <div className="bg-white/70 border border-indigo-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-64">
          <UtensilsCrossed className="w-10 h-10 text-indigo-400 mb-3" />
          <p className="text-sm text-indigo-800/70 max-w-md">
            No recap has been generated for {formatDisplayDate(date)} yet. Log a meal or generate a recap when meals are available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 bg-white/80 rounded-2xl p-5 border border-white shadow-sm">
            <div className="text-center mb-5">
              {recap.nutritional_score && (
                <div className={`text-4xl font-black mb-2 ${getScoreColor(recap.nutritional_score)}`}>
                  {recap.nutritional_score}
                </div>
              )}
              <div className={`inline-block border px-3 py-1 rounded-full text-sm font-semibold ${getScoreBg(recap.nutritional_score)}`}>
                {formatDisplayDate(recap.date || date)}
              </div>
              <div className="text-indigo-500 text-xs mt-2">
                {recap.meals_count} meal{recap.meals_count !== 1 ? 's' : ''} logged
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[10px] font-bold text-brand-orange uppercase tracking-wider mb-1">
                  <Zap className="w-3 h-3" /> Calories
                </div>
                <div className="text-2xl font-black text-gray-900">{Math.round(Number(recap.total_calories || 0))}</div>
                <div className="text-[10px] text-gray-500">kcal</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                  <Utensils className="w-3 h-3" /> Protein
                </div>
                <div className="text-2xl font-black text-gray-900">{Number(recap.total_protein_g || 0).toFixed(1)}</div>
                <div className="text-[10px] text-gray-500">grams</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  <Zap className="w-3 h-3" /> Carbs
                </div>
                <div className="text-2xl font-black text-gray-900">{Number(recap.total_carbs_g || 0).toFixed(1)}</div>
                <div className="text-[10px] text-gray-500">grams</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                  <Droplets className="w-3 h-3" /> Fat
                </div>
                <div className="text-2xl font-black text-gray-900">{Number(recap.total_fat_g || 0).toFixed(1)}</div>
                <div className="text-[10px] text-gray-500">grams</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white/80 rounded-2xl p-5 border border-white shadow-sm">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Macro Distribution</h3>
            <div className="h-3 w-full bg-indigo-100 rounded-full overflow-hidden flex mb-2">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${macroPercentages.protein}%` }} />
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${macroPercentages.carbs}%` }} />
              <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${macroPercentages.fat}%` }} />
            </div>
            <div className="flex flex-wrap justify-between gap-2 text-[11px] font-semibold mb-5">
              <span className="text-blue-600">Protein {macroPercentages.protein}%</span>
              <span className="text-emerald-600">Carbs {macroPercentages.carbs}%</span>
              <span className="text-amber-600">Fat {macroPercentages.fat}%</span>
            </div>

            {recap.ai_recommendation && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">AI Recommendation</h3>
                    <p className="text-sm text-indigo-900/80 leading-relaxed whitespace-pre-line">
                      {recap.ai_recommendation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default function Dashboard() {
  const { user, updateProfile } = useAuth();
  const [showWeightReminder, setShowWeightReminder] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [isSubmittingWeight, setIsSubmittingWeight] = useState(false);
  const [dailyRecap, setDailyRecap] = useState(null);
  const [recapError, setRecapError] = useState('');
  const [isRecapLoading, setIsRecapLoading] = useState(true);
  const [isRecapGenerating, setIsRecapGenerating] = useState(false);
  const todayDate = formatDateKey(new Date());

  useEffect(() => {
    const checkWeightLog = async () => {
      try {
        const { data } = await api.get('/weight');
        const history = data.data;
        if (!history || history.length === 0) {
          setShowWeightReminder(true);
        } else {
          const latestLog = history[history.length - 1];
          const logDate = new Date(latestLog.logged_at);
          const now = new Date();
          const diffTime = Math.abs(now - logDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 7) {
            setShowWeightReminder(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch weight history', err);
      }
    };
    checkWeightLog();
  }, []);

  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    if (!weightInput || isNaN(weightInput)) return;
    setIsSubmittingWeight(true);
    try {
      await api.post('/weight', { weight_kg: Number(weightInput) });
      await updateProfile({ weight_kg: Number(weightInput) });
      setShowWeightReminder(false);
    } catch (err) {
      console.error('Failed to log weight', err);
    } finally {
      setIsSubmittingWeight(false);
    }
  };

  const generateDailyRecap = useCallback(async () => {
    setRecapError('');
    setIsRecapGenerating(true);

    try {
      const { data } = await api.post('/daily-summaries/generate', { date: todayDate });
      setDailyRecap(data.data.summary);
    } catch (err) {
      console.error('Failed to generate daily recap:', err);
      const message = err.response?.data?.message
        || err.response?.data?.detail
        || err.message
        || 'Failed to generate daily recap. Please try again.';
      setRecapError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setIsRecapGenerating(false);
    }
  }, [todayDate]);

  useEffect(() => {
    let isMounted = true;

    const loadDailyRecap = async () => {
      setIsRecapLoading(true);
      setRecapError('');

      try {
        const { data } = await api.get('/daily-summaries', { params: { date: todayDate } });
        if (!isMounted) return;

        const summary = data.data.summary;
        if (summary) {
          setDailyRecap(summary);
          return;
        }

        setIsRecapGenerating(true);
        try {
          const generated = await api.post('/daily-summaries/generate', { date: todayDate });
          if (isMounted) setDailyRecap(generated.data.data.summary);
        } catch (err) {
          if (!isMounted) return;
          console.error('Failed to auto-generate daily recap:', err);
          const message = err.response?.data?.message
            || err.response?.data?.detail
            || err.message
            || 'Failed to generate daily recap. Please try again.';
          setRecapError(typeof message === 'string' ? message : JSON.stringify(message));
        } finally {
          if (isMounted) setIsRecapGenerating(false);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load daily recap:', err);
        const message = err.response?.data?.message
          || err.message
          || 'Failed to load daily recap.';
        setRecapError(typeof message === 'string' ? message : JSON.stringify(message));
      } finally {
        if (isMounted) setIsRecapLoading(false);
      }
    };

    loadDailyRecap();

    return () => {
      isMounted = false;
    };
  }, [todayDate]);

  return (
    <main className="flex-1 p-8">

      <div className="max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Good morning, {user?.name?.split(' ')[0] || 'Alex'}!</h1>
          <p className="text-gray-500">Here's your health landscape for today.</p>
        </header>

        {showWeightReminder && (
          <section className="bg-brand-orange-light rounded-2xl p-6 border border-brand-orange mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-orange shadow-sm">
                <Edit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Time for your Weekly Check-in!</h3>
                <p className="text-brand-orange text-sm font-medium">Log your weight to keep your BMI chart up-to-date.</p>
              </div>
            </div>
            <form onSubmit={handleWeightSubmit} className="flex items-center gap-3">
              <div className="relative">
                <input 
                  type="number" 
                  step="0.1"
                  required
                  placeholder={user?.weight_kg || 'e.g. 65'}
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-24 px-4 py-2 bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 text-gray-900"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">KG</span>
              </div>
              <button 
                type="submit" 
                disabled={isSubmittingWeight}
                className="bg-brand-orange hover:bg-brand-orange-dark text-white px-5 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmittingWeight ? 'Saving...' : 'Update'}
              </button>
            </form>
          </section>
        )}

        {/* Calories Intake */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-orange-50 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Calories Intake</h2>

          <div className="flex gap-8">
            {/* Progress Bars */}
            <div className="flex-1">
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium text-lg">Daily Nutrition Goal</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-gray-500 text-xs">Calories (kcal)</span>
                    <span className="font-semibold text-lg">1,450 / 2,200</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-orange-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-orange rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Protein (g)</span>
                    <span className="font-semibold">85 / 150</span>
                  </div>
                  <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '56%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Carbs (g)</span>
                    <span className="font-semibold">120 / 250</span>
                  </div>
                  <div className="h-2 w-full bg-teal-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Fats (g)</span>
                    <span className="font-semibold">45 / 70</span>
                  </div>
                  <div className="h-2 w-full bg-orange-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-800 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Score */}
            <div className="w-48 flex flex-col items-center justify-center border-l border-gray-100 pl-8">
              <div className="flex items-center gap-1 text-brand-orange text-xs font-semibold mb-2 tracking-wider uppercase">
                <Activity className="w-4 h-4" />
                Overall Health Score
              </div>
              <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-orange-100"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-brand-orange"
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    strokeDasharray="82, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-bold text-gray-900 block leading-none">82</span>
                  <span className="text-[10px] text-gray-400">/ 100</span>
                </div>
              </div>
              <span className="bg-brand-orange-light text-brand-orange text-xs font-medium px-3 py-1 rounded-full">
                Top 15% of cohort
              </span>
            </div>
          </div>
        </section>

        <AiSummarizationCard
          date={todayDate}
          recap={dailyRecap}
          error={recapError}
          isLoading={isRecapLoading}
          isGenerating={isRecapGenerating}
          onRefresh={generateDailyRecap}
        />

        {/* Recently Logged */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-orange-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recently Logged</h2>
            <button className="bg-brand-orange hover:bg-brand-orange-dark text-white font-medium py-2 px-5 rounded-full transition-colors shadow-lg shadow-orange-200 text-sm flex items-center gap-2 active:scale-95">
              <Camera className="w-4 h-4" /> Scan Meal
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="rounded-2xl overflow-hidden border border-gray-100 group bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-36 bg-gray-200 w-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Grilled Chicken Salad" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-semibold text-gray-900 truncate pr-2">Grilled Chicken Salad</h3>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">12:30 PM</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-brand-orange bg-orange-50 px-2.5 py-1 rounded-md">340 kcal</span>
                  <div className="flex gap-2.5 text-gray-500 font-medium">
                    <span>P:42g</span>
                    <span>C:12g</span>
                    <span>F:14g</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-100 group bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-36 bg-gray-200 w-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1494597564530-871f2b93ac55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Acai Breakfast Bowl" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-semibold text-gray-900 truncate pr-2">Acai Breakfast Bowl</h3>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">12:23 PM</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-brand-orange bg-orange-50 px-2.5 py-1 rounded-md">410 kcal</span>
                  <div className="flex gap-2.5 text-gray-500 font-medium">
                    <span>P:8g</span>
                    <span>C:65g</span>
                    <span>F:12g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
