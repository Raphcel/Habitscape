import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Brain, Camera, Droplets, Edit, Loader2, RefreshCw, Sparkles, Utensils, UtensilsCrossed, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const formatDateKey = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().split('T')[0];
};

const formatDisplayDate = (date, language = 'en') => {
  if (!date) return '';
  return new Date(`${date}T00:00:00`).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
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
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'id' ? 'id-ID' : 'en-US';
  const macroPercentages = getMacroPercentages(recap);
  const generatedAt = recap?.generated_at
    ? new Date(recap.generated_at).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return (
    <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 shadow-sm border border-purple-100 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-lg mb-2">
            <Brain className="w-5 h-5" />
            {t('dashboard.aiTitle')}
          </div>
          <p className="text-indigo-800/70 text-sm leading-relaxed">
            {t('dashboard.aiSubtitle')}
          </p>
          {generatedAt && (
            <p className="text-xs text-indigo-500 mt-2">{t('dashboard.lastGenerated')} {generatedAt}</p>
          )}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading || isGenerating}
          className="bg-white/80 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed text-indigo-700 border border-indigo-100 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {recap ? t('dashboard.refresh') : t('dashboard.generate')}
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-center text-indigo-700">
          <Loader2 className="w-10 h-10 mb-4 animate-spin" />
          <p className="text-sm font-medium">{t('dashboard.loadingRecap')}</p>
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
            {t('common.retry')}
          </button>
        </div>
      ) : !recap ? (
        <div className="bg-white/70 border border-indigo-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-64">
          <UtensilsCrossed className="w-10 h-10 text-indigo-400 mb-3" />
          <p className="text-sm text-indigo-800/70 max-w-md">
            {t('dashboard.noRecapBody')} ({formatDisplayDate(date, i18n.resolvedLanguage)})
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
                {formatDisplayDate(recap.date || date, i18n.resolvedLanguage)}
              </div>
              <div className="text-indigo-500 text-xs mt-2">
                {t('dashboard.mealsLogged', { count: recap.meals_count })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[10px] font-bold text-brand-orange uppercase tracking-wider mb-1">
                  <Zap className="w-3 h-3" /> {t('dashboard.calories')}
                </div>
                <div className="text-2xl font-black text-gray-900">{Math.round(Number(recap.total_calories || 0))}</div>
                <div className="text-[10px] text-gray-500">{t('common.kcal')}</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                  <Utensils className="w-3 h-3" /> {t('dashboard.protein')}
                </div>
                <div className="text-2xl font-black text-gray-900">{Number(recap.total_protein_g || 0).toFixed(1)}</div>
                <div className="text-[10px] text-gray-500">{t('common.grams')}</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  <Zap className="w-3 h-3" /> {t('dashboard.carbs')}
                </div>
                <div className="text-2xl font-black text-gray-900">{Number(recap.total_carbs_g || 0).toFixed(1)}</div>
                <div className="text-[10px] text-gray-500">{t('common.grams')}</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                  <Droplets className="w-3 h-3" /> {t('dashboard.fat')}
                </div>
                <div className="text-2xl font-black text-gray-900">{Number(recap.total_fat_g || 0).toFixed(1)}</div>
                <div className="text-[10px] text-gray-500">{t('common.grams')}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white/80 rounded-2xl p-5 border border-white shadow-sm">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">{t('dashboard.macroDistribution')}</h3>
            <div className="h-3 w-full bg-indigo-100 rounded-full overflow-hidden flex mb-2">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${macroPercentages.protein}%` }} />
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${macroPercentages.carbs}%` }} />
              <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${macroPercentages.fat}%` }} />
            </div>
            <div className="flex flex-wrap justify-between gap-2 text-[11px] font-semibold mb-5">
              <span className="text-blue-600">{t('dashboard.protein')} {macroPercentages.protein}%</span>
              <span className="text-emerald-600">{t('dashboard.carbs')} {macroPercentages.carbs}%</span>
              <span className="text-amber-600">{t('dashboard.fat')} {macroPercentages.fat}%</span>
            </div>

            {recap.ai_recommendation && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">{t('dashboard.recommendation')}</h3>
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
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [showWeightReminder, setShowWeightReminder] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [isSubmittingWeight, setIsSubmittingWeight] = useState(false);
  const [dailyRecap, setDailyRecap] = useState(null);
  const [recapError, setRecapError] = useState('');
  const [isRecapLoading, setIsRecapLoading] = useState(true);
  const [isRecapGenerating, setIsRecapGenerating] = useState(false);
  const todayDate = formatDateKey(new Date());

  const [foodLogs, setFoodLogs] = useState([]);
  const [todayMacros, setTodayMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  const GOALS = { calories: 2200, protein: 150, carbs: 250, fat: 70 };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch weight
        const { data: weightData } = await api.get('/weight');
        const history = weightData.data;
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

      try {
        // Fetch today's food logs
        const today = new Date().toISOString().split('T')[0];
        const { data: foodResponse } = await api.get(`/food-logs?date=${today}&limit=10`);
        const logs = foodResponse.data?.data || [];
        
        // Calculate macros
        const macros = logs.reduce((acc, log) => {
          return {
            calories: acc.calories + Number(log.calories || 0),
            protein: acc.protein + Number(log.protein || 0),
            carbs: acc.carbs + Number(log.carbs || 0),
            fat: acc.fat + Number(log.fat || 0),
          };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
        
        setFoodLogs(logs);
        setTodayMacros(macros);
      } catch (err) {
        console.error('Failed to fetch food logs', err);
      }
    };
    fetchData();
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
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{t('dashboard.greeting', { name: user?.name?.split(' ')[0] || 'Alex' })}</h1>
          <p className="text-gray-500">{t('dashboard.subtitle')}</p>
        </header>

        {showWeightReminder && (
          <section className="bg-brand-orange-light rounded-2xl p-6 border border-brand-orange mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-orange shadow-sm">
                <Edit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('dashboard.weeklyCheckIn')}</h3>
                <p className="text-brand-orange text-sm font-medium">{t('dashboard.weeklySubtitle')}</p>
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
                {isSubmittingWeight ? t('common.saving') : t('dashboard.saveCheckIn')}
              </button>
            </form>
          </section>
        )}

        {/* Calories Intake */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-orange-50 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.caloriesIntake')}</h2>

          <div>
            {/* Progress Bars */}
            <div>
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium text-lg">{t('dashboard.dailyNutritionGoal')}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-gray-500 text-xs">{t('dashboard.calories')} ({t('common.kcal')})</span>
                    <span className="font-semibold text-lg">{todayMacros.calories} / {GOALS.calories}</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-orange-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-orange rounded-full" style={{ width: `${Math.min(100, (todayMacros.calories / GOALS.calories) * 100)}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{t('dashboard.protein')} (g)</span>
                    <span className="font-semibold">{Math.round(todayMacros.protein)} / {GOALS.protein}</span>
                  </div>
                  <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, (todayMacros.protein / GOALS.protein) * 100)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{t('dashboard.carbs')} (g)</span>
                    <span className="font-semibold">{Math.round(todayMacros.carbs)} / {GOALS.carbs}</span>
                  </div>
                  <div className="h-2 w-full bg-teal-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 rounded-full" style={{ width: `${Math.min(100, (todayMacros.carbs / GOALS.carbs) * 100)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{t('dashboard.fat')} (g)</span>
                    <span className="font-semibold">{Math.round(todayMacros.fat)} / {GOALS.fat}</span>
                  </div>
                  <div className="h-2 w-full bg-orange-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-800 rounded-full" style={{ width: `${Math.min(100, (todayMacros.fat / GOALS.fat) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
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
            <h2 className="text-xl font-bold text-gray-900">{t('dashboard.recentlyLogged')}</h2>
            <button 
              onClick={() => navigate('/app/snapfood')}
              className="bg-brand-orange hover:bg-brand-orange-dark text-white font-medium py-2 px-5 rounded-full transition-colors shadow-lg shadow-orange-200 text-sm flex items-center gap-2 active:scale-95"
            >
              <Camera className="w-4 h-4" /> {t('dashboard.snapMeal')}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {foodLogs.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-gray-500 font-medium">
                {t('dashboard.noMeals')}
              </div>
            ) : (
              foodLogs.slice(0, 2).map((log) => (
                <div key={log.id} className="rounded-2xl overflow-hidden border border-gray-100 group bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="h-36 bg-gray-200 w-full overflow-hidden relative">
                    {log.image_url ? (
                      <img src={log.image_url} alt={log.meal_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50 text-brand-orange/50 group-hover:scale-105 transition-transform duration-500">
                        <Utensils className="w-10 h-10 mb-2" />
                        <span className="text-xs font-semibold uppercase tracking-wider">{t('dashboard.noPhoto')}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-semibold text-gray-900 truncate pr-2" title={log.meal_name}>{log.meal_name}</h3>
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                        {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-brand-orange bg-orange-50 px-2.5 py-1 rounded-md">{log.calories} kcal</span>
                      <div className="flex gap-2.5 text-gray-500 font-medium">
                        <span>P:{Math.round(log.protein)}g</span>
                        <span>C:{Math.round(log.carbs)}g</span>
                        <span>F:{Math.round(log.fat)}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
