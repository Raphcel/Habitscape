import { useState, useEffect, useMemo } from 'react';
import { Activity, TrendingUp, Shield, Target, BarChart3, Brain, Heart, Moon, Dumbbell, Utensils, Flame, AlertTriangle, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import CustomSelect from '../components/CustomSelect';
import CustomSlider from '../components/CustomSlider';
import api from '../lib/api';

// ─── Data Science Constants (from Streamlit dashboard analysis) ───────────────

// Feature importance from Random Forest model (Section 4 of dashboard)
const FEATURE_IMPORTANCE = [
  { key: 'fat_ratio_pct',   label: 'Fat Ratio',           importance: 0.260, icon: Flame,    color: '#EF4444' },
  { key: 'fat_total_g',     label: 'Daily Fat (g)',        importance: 0.150, icon: Utensils, color: '#F97316' },
  { key: 'exercise_x_diet', label: 'Exercise × Diet',      importance: 0.120, icon: Dumbbell, color: '#06B6D4' },
  { key: 'sleep_hours',     label: 'Sleep Hours',          importance: 0.100, icon: Moon,     color: '#8B5CF6' },
  { key: 'age',             label: 'Age',                  importance: 0.085, icon: Heart,    color: '#EC4899' },
  { key: 'alcohol_num',     label: 'Alcohol',              importance: 0.070, icon: AlertTriangle, color: '#F59E0B' },
  { key: 'height_cm',       label: 'Height',               importance: 0.065, icon: Activity, color: '#10B981' },
  { key: 'stress_x_sleep',  label: 'Stress × Sleep',       importance: 0.060, icon: Brain,    color: '#6366F1' },
  { key: 'calorie_x_fat',   label: 'Calorie × Fat',        importance: 0.050, icon: Flame,    color: '#DC2626' },
  { key: 'calorie_surplus',  label: 'Calorie Surplus',      importance: 0.040, icon: TrendingUp, color: '#EA580C' },
];

export default function HealthForecaster() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Lifestyle inputs
  const [calories, setCalories] = useState(2200);
  const [fatTotal, setFatTotal] = useState(70);
  const [sleepHours, setSleepHours] = useState(6);
  const [stressLevel, setStressLevel] = useState(8);
  const [exerciseFreq, setExerciseFreq] = useState(4);
  const [dietQuality, setDietQuality] = useState(3);
  const [smoker, setSmoker] = useState(false);
  const [alcohol, setAlcohol] = useState(1);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  // Profile inputs
  const [age, setAge] = useState(22);
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [gender, setGender] = useState('Male');
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionError, setPredictionError] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionRequestSignature, setPredictionRequestSignature] = useState('');

  useEffect(() => {
    if (user) {
      const frame = requestAnimationFrame(() => {
        if (user.weight_kg) setWeightKg(user.weight_kg);
        if (user.gender) {
          const normalized = user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase();
          if (normalized === 'Male' || normalized === 'Female') {
            setGender(normalized);
          }
        }
      });
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [user]);

  // Profile input change/blur handlers to prevent nonsense values (e.g. 1000 kg, 300 cm)
  const handleAgeChange = (val) => {
    if (val === '') {
      setAge('');
      return;
    }
    const num = Number(val);
    if (!isNaN(num)) {
      setAge(num);
    }
  };

  const handleAgeBlur = () => {
    const val = Number(age);
    if (isNaN(val) || val < 1) {
      setAge(1);
    } else if (val > 120) {
      setAge(120);
    }
  };

  const handleHeightChange = (val) => {
    if (val === '') {
      setHeightCm('');
      return;
    }
    const num = Number(val);
    if (!isNaN(num)) {
      setHeightCm(num);
    }
  };

  const handleHeightBlur = () => {
    const val = Number(heightCm);
    if (isNaN(val) || val < 50) {
      setHeightCm(50);
    } else if (val > 250) {
      setHeightCm(250);
    }
  };

  const handleWeightChange = (val) => {
    if (val === '') {
      setWeightKg('');
      return;
    }
    const num = Number(val);
    if (!isNaN(num)) {
      setWeightKg(num);
    }
  };

  const handleWeightBlur = () => {
    const val = Number(weightKg);
    if (isNaN(val) || val < 10) {
      setWeightKg(10);
    } else if (val > 250) {
      setWeightKg(250);
    }
  };

  // ─── Real-time BMI, BMR, TDEE, and Ideal Calories calculation ───
  const { actualBmi, bmr, tdee, idealCalories, bmiCategory } = useMemo(() => {
    // Fallbacks for empty/invalid typing states
    const currentWeight = Number(weightKg) || 70;
    const currentHeight = Number(heightCm) || 170;
    const currentAge = Number(age) || 24;

    // 1. BMI calculation
    const heightM = currentHeight / 100;
    const calculatedBmi = heightM > 0 ? Number((currentWeight / (heightM * heightM)).toFixed(1)) : 0;

    // 2. BMR calculation (Mifflin-St Jeor)
    const bmrVal = gender.toLowerCase() === 'female'
      ? 10 * currentWeight + 6.25 * currentHeight - 5 * currentAge - 161
      : 10 * currentWeight + 6.25 * currentHeight - 5 * currentAge + 5;

    // 3. TDEE calculation (Activity Factor based on exerciseFreq)
    let activityFactor = 1.2; // Sedentary (0 times/week)
    if (exerciseFreq >= 1 && exerciseFreq <= 2) {
      activityFactor = 1.375; // Lightly Active
    } else if (exerciseFreq >= 3 && exerciseFreq <= 5) {
      activityFactor = 1.55; // Moderately Active
    } else if (exerciseFreq >= 6) {
      activityFactor = 1.725; // Very Active
    }
    const tdeeVal = bmrVal * activityFactor;

    // 4. BMI Category & Calorie adjustments
    let category;
    let targetCalories;
    if (calculatedBmi < 18.5) {
      category = 'Underweight';
      targetCalories = tdeeVal + 300; // Surplus for healthy weight gain
    } else if (calculatedBmi >= 18.5 && calculatedBmi < 25) {
      category = 'Normal';
      targetCalories = tdeeVal; // Maintenance
    } else if (calculatedBmi >= 25 && calculatedBmi < 30) {
      category = 'Overweight';
      targetCalories = tdeeVal - 350; // Mild deficit for weight loss
    } else {
      category = 'Obese';
      targetCalories = tdeeVal - 500; // Deficit for weight loss
    }

    // Clamp safe minimum calories (1200 for women, 1500 for men)
    const minSafeCalories = gender.toLowerCase() === 'female' ? 1200 : 1500;
    const idealCaloriesVal = Math.max(minSafeCalories, Math.round(targetCalories));

    return {
      actualBmi: calculatedBmi,
      bmr: Math.round(bmrVal),
      tdee: Math.round(tdeeVal),
      idealCalories: idealCaloriesVal,
      bmiCategory: category
    };
  }, [age, heightCm, weightKg, gender, exerciseFreq]);

  const predictionPayload = useMemo(() => ({
    age: Number(age) || 22,
    alcohol_num: Number(alcohol) || 0,
    calorie_daily: Number(calories) || 0,
    diet_quality_num: Number(dietQuality) || 3,
    exercise_freq_num: Number(exerciseFreq) || 0,
    fat_total_g: Number(fatTotal) || 0,
    height_cm: Number(heightCm) || 170,
    sleep_hours: Number(sleepHours) || 0,
    smoker_num: smoker ? 1 : 0,
    stress_level: Number(stressLevel) || 1,
  }), [age, alcohol, calories, dietQuality, exerciseFreq, fatTotal, heightCm, sleepHours, smoker, stressLevel]);

  const predictionSignature = useMemo(() => JSON.stringify(predictionPayload), [predictionPayload]);
  const isPredictionStale = Boolean(predictionResult && predictionRequestSignature && predictionRequestSignature !== predictionSignature);

  const handlePredictBmi = async () => {
    const requestPayload = predictionPayload;
    const requestSignature = predictionSignature;

    setIsPredicting(true);
    setPredictionError('');

    try {
      const { data } = await api.post('/forecaster/predict-bmi', requestPayload, {
        timeout: 90_000,
      });
      setPredictionResult(data.data ?? data);
      setPredictionRequestSignature(requestSignature);
    } catch (err) {
      const message = err.response?.data?.message || err.message || t('forecaster.predictionErrorBody');
      setPredictionError(message);
    } finally {
      setIsPredicting(false);
    }
  };

  // ─── Real-time derived features (mirror Streamlit dashboard feature engineering) ──
  const derivedFeatures = useMemo(() => {
    const fatRatio = calories > 0 ? (fatTotal * 9) / calories : 0;
    const exerciseXDiet = exerciseFreq * dietQuality;
    const stressXSleep = stressLevel * sleepHours;
    const calorieXFat = calories * fatTotal;
    const calorieSurplus = calories - idealCalories;

    return { fatRatio, exerciseXDiet, stressXSleep, calorieXFat, calorieSurplus };
  }, [calories, fatTotal, sleepHours, stressLevel, exerciseFreq, dietQuality, idealCalories]);

  // ─── Lifestyle Synergy Score (0-100, computed from data science correlations) ──
  const lifestyleScore = useMemo(() => {
    let score = 50; // baseline

    // Diet quality (strongest protector, d=0.67)
    score += (dietQuality - 3) * 8; // 1→-16, 5→+16

    // Exercise (d=0.35)
    score += (exerciseFreq >= 3 ? 10 : exerciseFreq >= 1 ? 3 : -8);

    // Sleep (d=0.28, ≥7h is protective)
    score += (sleepHours >= 7 ? 8 : sleepHours >= 6 ? 2 : -10);

    // Fat ratio (most important feature, importance=0.26)
    const fatRatio = calories > 0 ? ((fatTotal * 9) / calories) * 100 : 0;
    score += fatRatio < 25 ? 10 : fatRatio < 35 ? 0 : fatRatio < 45 ? -8 : -15;

    // Calorie surplus
    const surplus = calories - idealCalories;
    score += surplus <= 0 ? 6 : surplus <= 300 ? 0 : surplus <= 600 ? -5 : -10;

    // Stress (d=0.22)
    score += stressLevel <= 4 ? 5 : stressLevel <= 6 ? 0 : -6;

    // Smoking
    score += smoker ? -5 : 3;

    // Alcohol (0=no, 1=light, 2=heavy)
    score += alcohol === 0 ? 3 : alcohol === 1 ? 1 : -4;

    return Math.max(0, Math.min(100, Math.round(score)));
  }, [calories, fatTotal, sleepHours, stressLevel, exerciseFreq, dietQuality, smoker, alcohol, idealCalories]);

  // ─── Risk factor indicators ──
  const riskFactors = useMemo(() => {
    const factors = [];
    const fatRatio = calories > 0 ? ((fatTotal * 9) / calories) * 100 : 0;

    if (fatRatio > 35)
      factors.push({ level: 'high', label: `Fat ratio ${fatRatio.toFixed(1)}% exceeds 35% threshold`, icon: Flame, color: '#EF4444' });
    else if (fatRatio > 25)
      factors.push({ level: 'moderate', label: `Fat ratio ${fatRatio.toFixed(1)}% — moderate`, icon: Flame, color: '#F59E0B' });

    if (calories > idealCalories + 400)
      factors.push({ level: 'high', label: `Calorie surplus +${calories - idealCalories} kcal above dynamic target (${idealCalories} kcal)`, icon: TrendingUp, color: '#EF4444' });
    else if (calories > idealCalories + 150)
      factors.push({ level: 'moderate', label: `Slight calorie surplus +${calories - idealCalories} kcal above dynamic target`, icon: TrendingUp, color: '#F59E0B' });
    else if (calories < idealCalories - 300)
      factors.push({ level: 'moderate', label: `Calorie deficit ${calories - idealCalories} kcal below dynamic target`, icon: TrendingUp, color: '#F59E0B' });

    if (sleepHours < 6)
      factors.push({ level: 'high', label: `Sleep deficit: ${sleepHours}h (recommend ≥7h)`, icon: Moon, color: '#EF4444' });
    else if (sleepHours < 7)
      factors.push({ level: 'moderate', label: `Borderline sleep: ${sleepHours}h (optimal ≥7h)`, icon: Moon, color: '#F59E0B' });

    if (dietQuality <= 2)
      factors.push({ level: 'high', label: 'Poor diet quality — strongest BMI risk factor (d=0.67)', icon: Utensils, color: '#EF4444' });

    if (exerciseFreq < 3)
      factors.push({ level: 'moderate', label: `Exercise ${exerciseFreq}x/week — aim for ≥3x`, icon: Dumbbell, color: '#F59E0B' });

    if (stressLevel >= 7)
      factors.push({ level: 'moderate', label: `High stress level ${stressLevel}/10`, icon: Brain, color: '#F59E0B' });

    if (alcohol >= 2)
      factors.push({ level: 'moderate', label: 'Heavy alcohol consumption', icon: AlertTriangle, color: '#F59E0B' });

    if (factors.length === 0)
      factors.push({ level: 'good', label: 'All lifestyle indicators look healthy!', icon: Shield, color: '#10B981' });

    return factors;
  }, [calories, fatTotal, sleepHours, stressLevel, exerciseFreq, dietQuality, alcohol, idealCalories]);

  // ─── Strategic Recommendations (from A/B testing BQ3 conclusions) ──
  const recommendations = useMemo(() => {
    const recs = [];

    if (dietQuality <= 2) {
      recs.push({
        priority: 1,
        title: 'Prioritize Diet Improvement',
        desc: "Diet quality has the largest effect on BMI (Cohen's d = 0.67, medium effect). Upgrading from Poor to Good/Excellent diet is the single most impactful change you can make.",
        impact: t('forecaster.impactHigh'),
        color: '#10B981',
      });
    }

    if (exerciseFreq < 3) {
      recs.push({
        priority: 2,
        title: 'Increase Exercise Frequency',
        desc: 'Population data shows BMI drops from 28.5 → 25.4 for daily exercisers. Aim for at least 3 sessions per week for a consistent small but significant effect.',
        impact: t('forecaster.impactMedium'),
        color: '#06B6D4',
      });
    }

    if (sleepHours < 7) {
      recs.push({
        priority: 3,
        title: 'Improve Sleep Duration',
        desc: 'Sleeping ≥7 hours is associated with 1.5 BMI points lower on average. This is a statistically significant and easily achievable lifestyle change.',
        impact: t('forecaster.impactMedium'),
        color: '#8B5CF6',
      });
    }

    const fatRatio = calories > 0 ? ((fatTotal * 9) / calories) * 100 : 0;
    if (fatRatio > 35) {
      recs.push({
        priority: 1,
        title: 'Reduce Fat-to-Calorie Ratio',
        desc: `Your fat ratio is ${fatRatio.toFixed(1)}%. Fat ratio (fat_ratio_pct) is the #1 most important feature in the prediction model (26% importance). Aim to keep it below 30%.`,
        impact: t('forecaster.impactHigh'),
        color: '#EF4444',
      });
    }

    if (stressLevel >= 7) {
      recs.push({
        priority: 4,
        title: 'Manage Stress Levels',
        desc: 'High stress (≥7) is linked to higher BMI. The stress × sleep interaction is a significant predictor in the model. Better sleep can partially offset stress effects.',
        impact: t('forecaster.impactLow'),
        color: '#F59E0B',
      });
    }

    if (calories > idealCalories + 300) {
      recs.push({
        priority: 2,
        title: 'Reduce Calorie Intake',
        desc: `Your daily intake of ${calories} kcal creates a +${calories - idealCalories} kcal surplus over your ideal daily target (${idealCalories} kcal). Consider reducing to stay close to your ideal dynamic target.`,
        impact: t('forecaster.impactMedium'),
        color: '#F97316',
      });
    } else if (calories < idealCalories - 300) {
      recs.push({
        priority: 2,
        title: 'Increase Calorie Intake',
        desc: `Your daily intake of ${calories} kcal is ${idealCalories - calories} kcal below your ideal daily target (${idealCalories} kcal). Consider eating more to support your health goals.`,
        impact: t('forecaster.impactMedium'),
        color: '#F97316',
      });
    }

    if (alcohol >= 2) {
      recs.push({
        priority: 4,
        title: 'Limit Alcohol Consumption',
        desc: "Your alcohol intake is marked as heavy. Population data shows alcohol has a minor correlation with BMI (Cohen's d = 0.18). Reducing consumption helps prevent unnecessary calorie surplus.",
        impact: t('forecaster.impactLow'),
        color: '#F59E0B',
      });
    }

    if (recs.length === 0) {
      recs.push({
        priority: 0,
        title: 'Great Lifestyle Balance!',
        desc: 'Your current lifestyle parameters align well with the optimal ranges identified in the population study. Keep maintaining these habits.',
        impact: t('forecaster.impactPositive'),
        color: '#10B981',
      });
    }

    return recs.sort((a, b) => a.priority - b.priority);
  }, [calories, fatTotal, sleepHours, stressLevel, exerciseFreq, dietQuality, alcohol, idealCalories, t]);

  const predictionProbabilities = useMemo(() => {
    const probabilities = predictionResult?.probabilities || {};
    return ['Underweight', 'Normal', 'Overweight', 'Obese']
      .filter((category) => probabilities[category] !== undefined)
      .map((category) => ({
        category,
        value: Number(probabilities[category]) || 0,
      }));
  }, [predictionResult]);

  const predictionConfidencePct = predictionResult
    ? Math.round((Number(predictionResult.confidence) || 0) * 100)
    : 0;

  const getBmiCategoryClass = (category) => {
    if (category === 'Underweight') return 'bg-blue-100 text-blue-700';
    if (category === 'Normal') return 'bg-emerald-100 text-emerald-700';
    if (category === 'Overweight') return 'bg-amber-100 text-amber-700';
    if (category === 'Obese') return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-700';
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#10B981';
    if (score >= 70) return '#3B82F6';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return t('forecaster.excellent');
    if (score >= 70) return t('forecaster.good');
    if (score >= 50) return t('forecaster.moderate');
    return t('forecaster.low');
  };

  const getScoreDescription = (score) => {
    if (score >= 85) {
      return t('forecaster.excellentDesc');
    } else if (score >= 70) {
      return t('forecaster.goodDesc');
    } else if (score >= 50) {
      return t('forecaster.moderateDesc');
    } else {
      return t('forecaster.lowDesc');
    }
  };

  return (
    <main className="flex-1 p-8 min-h-screen bg-slate-50/50">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1.5 tracking-tight flex items-center gap-2.5">
              <Activity className="w-8 h-8 text-brand-orange animate-pulse" />
              {t('forecaster.title')}
            </h1>
            <p className="text-gray-500 text-sm">{t('forecaster.subtitle')}</p>
          </div>
        </header>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* ═══ LEFT COLUMN: Lifestyle Parameters (Sliders & Inputs) ═══ */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-brand-orange" />
                  {t('forecaster.parameters')}
                </h2>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100/80">
                    <div className="col-span-2 flex items-center justify-between">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('forecaster.profile')}</h3>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">{t('forecaster.gender')}</label>
                      <CustomSelect
                        name="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        options={[
                          { value: 'Male', label: t('common.male') },
                          { value: 'Female', label: t('common.female') },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">{t('forecaster.ageYears')}</label>
                      <input 
                        type="number" 
                        value={age} 
                        onChange={(e) => handleAgeChange(e.target.value)}
                        onBlur={handleAgeBlur}
                        min={1}
                        max={120}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow bg-white font-semibold text-gray-800" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">{t('forecaster.heightCm')}</label>
                      <input 
                        type="number" 
                        value={heightCm} 
                        onChange={(e) => handleHeightChange(e.target.value)}
                        onBlur={handleHeightBlur}
                        min={50}
                        max={250}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow bg-white font-semibold text-gray-800" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">{t('forecaster.weightKg')}</label>
                      <input 
                        type="number" 
                        value={weightKg} 
                        onChange={(e) => handleWeightChange(e.target.value)}
                        onBlur={handleWeightBlur}
                        min={10}
                        max={250}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow bg-white font-semibold text-gray-800" 
                      />
                    </div>
                  </div>

                  {/* BMI & Metabolic Summary Card */}
                  <div className="bg-slate-50/50 rounded-2xl p-4.5 border border-slate-100/80 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('forecaster.currentMetabolicSummary')}</span>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${getBmiCategoryClass(bmiCategory)}`}>
                        {bmiCategory} (BMI: {actualBmi})
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white rounded-xl p-2 border border-slate-100 text-center">
                        <div className="text-[9px] font-bold text-gray-400 uppercase">BMR</div>
                        <div className="text-xs font-black text-gray-800 mt-0.5">{bmr.toLocaleString()}</div>
                        <div className="text-[9px] text-gray-400">kcal</div>
                      </div>
                      <div className="bg-white rounded-xl p-2 border border-slate-100 text-center">
                        <div className="text-[9px] font-bold text-gray-400 uppercase">TDEE</div>
                        <div className="text-xs font-black text-gray-800 mt-0.5">{tdee.toLocaleString()}</div>
                        <div className="text-[9px] text-gray-400">kcal</div>
                      </div>
                      <div className="bg-white rounded-xl p-2 border border-slate-100 text-center ring-2 ring-brand-orange/20">
                        <div className="text-[9px] font-bold text-brand-orange uppercase">{t('forecaster.idealCalories')}</div>
                        <div className="text-xs font-black text-brand-orange mt-0.5">{idealCalories.toLocaleString()}</div>
                        <div className="text-[9px] text-brand-orange/80">kcal</div>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 text-center leading-relaxed font-medium">
                      {bmiCategory === 'Underweight' && "Goal: BMR + activity + 300 kcal surplus to support healthy weight gain."}
                      {bmiCategory === 'Normal' && "Goal: Consuming calories equal to TDEE for weight maintenance."}
                      {bmiCategory === 'Overweight' && "Goal: Deficit of -350 kcal relative to TDEE for gradual weight loss."}
                      {bmiCategory === 'Obese' && "Goal: Deficit of -500 kcal relative to TDEE for safe weight loss."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-xs font-semibold text-gray-700">{t('forecaster.dailyCalories')}</label>
                        <span className="text-xs font-bold text-brand-orange">{calories.toLocaleString()} kcal</span>
                      </div>
                      <CustomSlider 
                        min={1000} max={4000} step={50}
                        value={calories}
                        onChange={(e) => setCalories(Number(e.target.value))}
                        colorClass="bg-brand-orange" thumbColorHex="#FF8235"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-xs font-semibold text-gray-700">{t('forecaster.dailyFat')} (g)</label>
                        <span className="text-xs font-bold text-red-400">{fatTotal} g</span>
                      </div>
                      <CustomSlider 
                        min={0} max={200} step={1}
                        value={fatTotal}
                        onChange={(e) => setFatTotal(Number(e.target.value))}
                        colorClass="bg-red-400" thumbColorHex="#F87171"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-xs font-semibold text-gray-700">{t('forecaster.sleepHours')}</label>
                        <span className="text-xs font-bold text-blue-500">{sleepHours}h</span>
                      </div>
                      <CustomSlider 
                        min={0} max={12} step={0.5} 
                        value={sleepHours}
                        onChange={(e) => setSleepHours(Number(e.target.value))}
                        colorClass="bg-blue-500" thumbColorHex="#3B82F6"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-xs font-semibold text-gray-700">{t('forecaster.stressLevel')}</label>
                        <span className="text-xs font-bold text-purple-500">{stressLevel}/10</span>
                      </div>
                      <CustomSlider 
                        min={1} max={10} step={1} 
                        value={stressLevel}
                        onChange={(e) => setStressLevel(Number(e.target.value))}
                        colorClass="bg-purple-500" thumbColorHex="#A855F7"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-xs font-semibold text-gray-700">{t('forecaster.exerciseFreq')}</label>
                        <span className="text-xs font-bold text-cyan-500">{exerciseFreq}x</span>
                      </div>
                      <CustomSlider 
                        min={0} max={14} step={1}
                        value={exerciseFreq}
                        onChange={(e) => setExerciseFreq(Number(e.target.value))}
                        colorClass="bg-cyan-500" thumbColorHex="#06B6D4"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('forecaster.dietQuality')}</label>
                      <CustomSelect
                        name="diet_quality"
                        value={String(dietQuality)}
                        onChange={(e) => setDietQuality(Number(e.target.value))}
                        options={['1', '2', '3', '4', '5']}
                      />
                      <p className="text-[10px] text-gray-400 mt-1">1 = Poor, 5 = Excellent</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('forecaster.alcohol')}</label>
                      <CustomSelect
                        name="alcohol"
                        value={String(alcohol)}
                        onChange={(e) => setAlcohol(Number(e.target.value))}
                        options={[
                          { value: '0', label: t('forecaster.alcoholNone') },
                          { value: '1', label: t('forecaster.alcoholLight') },
                          { value: '2', label: t('forecaster.alcoholHeavy') },
                        ]}
                      />
                      <p className="text-[10px] text-gray-400 mt-1">0 = None, 2 = Heavy</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <input 
                      type="checkbox" 
                      id="smoker" 
                      checked={smoker}
                      onChange={(e) => setSmoker(e.target.checked)}
                      className="w-4 h-4 accent-brand-orange rounded" 
                    />
                    <label htmlFor="smoker" className="text-xs font-semibold text-gray-700 cursor-pointer">{t('forecaster.smoker')}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN: Results, Analytics & Recommendations ═══ */}
          <div className="col-span-12 lg:col-span-8 space-y-6">

            {/* ML BMI Prediction Result */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{t('forecaster.mlPredictionTitle')}</h2>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-xl">{t('forecaster.mlPredictionBody')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePredictBmi}
                  disabled={isPredicting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-sm transition-all hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPredicting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isPredicting ? t('forecaster.predicting') : t('forecaster.predictButton')}
                </button>
              </div>

              <div className="mt-5">
                {!predictionResult && !predictionError && !isPredicting && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5 text-center">
                    <p className="text-sm font-bold text-gray-800">{t('forecaster.predictionEmptyTitle')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('forecaster.predictionEmptyBody')}</p>
                  </div>
                )}

                {isPredicting && !predictionResult && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[0, 1, 2].map((item) => (
                      <div key={item} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                )}

                {predictionResult && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-4 rounded-2xl bg-slate-50/60 border border-slate-100 p-4">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('forecaster.predictedCategory')}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${getBmiCategoryClass(predictionResult.bmi_category)}`}>
                          {predictionResult.bmi_category}
                        </span>
                        {isPredictionStale && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{t('forecaster.inputsChanged')}</span>
                        )}
                      </div>
                      <div className="mt-4">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('forecaster.confidence')}</div>
                        <div className="text-3xl font-black text-gray-900 mt-1">{predictionConfidencePct}%</div>
                      </div>
                    </div>

                    <div className="lg:col-span-8 rounded-2xl bg-slate-50/60 border border-slate-100 p-4">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">{t('forecaster.probabilities')}</div>
                      <div className="space-y-2.5">
                        {predictionProbabilities.map((item) => (
                          <div key={item.category} className="grid grid-cols-[88px_1fr_42px] items-center gap-2">
                            <span className="text-[11px] font-semibold text-gray-600 truncate">{item.category}</span>
                            <div className="h-2.5 rounded-full bg-white border border-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-brand-orange transition-all duration-500"
                                style={{ width: `${Math.round(item.value * 100)}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-gray-700 text-right">{Math.round(item.value * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-12 rounded-2xl border border-orange-100 bg-orange-50/40 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-brand-orange" />
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wide">{t('forecaster.aiRecommendation')}</h3>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {predictionResult.ai_recommendation || t('forecaster.aiRecommendationFallback')}
                      </p>
                    </div>
                  </div>
                )}

                {predictionError && (
                  <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="text-sm font-bold text-red-700">{t('forecaster.predictionErrorTitle')}</p>
                    <p className="text-xs text-red-600 mt-1 leading-relaxed">{predictionError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ROW 1: Synergy Score & Risk Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Lifestyle Synergy Score Card */}
              <div className="col-span-12 md:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{t('forecaster.synergyScore')}</h3>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke={getScoreColor(lifestyleScore)}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${lifestyleScore * 2.64} 264`}
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black" style={{ color: getScoreColor(lifestyleScore) }}>{lifestyleScore}</span>
                        <span className="text-[9px] text-gray-400 font-medium">/100</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold mb-1.5 transition-colors duration-300" style={{ color: getScoreColor(lifestyleScore) }}>
                        {getScoreLabel(lifestyleScore)}
                      </div>
                      <p className="text-[11.5px] text-gray-600 leading-relaxed font-medium transition-all duration-300">
                        {getScoreDescription(lifestyleScore)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Indicators Card */}
              <div className="col-span-12 md:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{t('forecaster.riskIndicators')}</h3>
                  </div>
                  <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                    {riskFactors.map((rf, i) => {
                      const Icon = rf.icon;
                      return (
                        <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl" style={{ backgroundColor: `${rf.color}08` }}>
                          <div className="w-5.5 h-5.5 rounded-lg flex items-center justify-center flex-shrink-0 animate-in zoom-in-50 duration-300" style={{ backgroundColor: `${rf.color}18` }}>
                            <Icon className="w-3 h-3" style={{ color: rf.color }} />
                          </div>
                          <p className="text-[11px] text-gray-700 leading-relaxed font-semibold">{rf.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* ROW 2: Feature Impact & Engineered Features */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* Feature Impact Chart */}
              <div className="col-span-12 md:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{t('forecaster.featureImpact')}</h3>
                </div>
                <p className="text-[10px] text-gray-400 mb-3.5">{t('forecaster.featureImpactBody')}</p>
                <div className="space-y-2 max-h-[175px] overflow-y-auto pr-1">
                  {FEATURE_IMPORTANCE.map((feat) => {
                    const Icon = feat.icon;
                    const maxImportance = FEATURE_IMPORTANCE[0].importance;
                    const widthPct = (feat.importance / maxImportance) * 100;
                    return (
                      <div key={feat.key} className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: feat.color }} />
                        <span className="text-[10px] font-medium text-gray-600 w-24 truncate">{feat.label}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${widthPct}%`, backgroundColor: feat.color }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 w-10 text-right">
                          {(feat.importance * 100).toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Engineered Features Grid */}
              <div className="col-span-12 md:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-violet-500" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{t('forecaster.engineeredFeatures')}</h3>
                </div>
                <p className="text-[10px] text-gray-400 mb-3.5">{t('forecaster.engineeredBody')}</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Fat Ratio', value: `${(derivedFeatures.fatRatio * 100).toFixed(1)}%`, sub: '#1 predictor', warn: derivedFeatures.fatRatio > 0.35 },
                    { label: 'Exercise×Diet', value: derivedFeatures.exerciseXDiet, sub: 'synergy score', warn: false },
                    { label: 'Stress×Sleep', value: derivedFeatures.stressXSleep.toFixed(0), sub: 'interaction', warn: stressLevel >= 7 && sleepHours < 7 },
                    { label: 'Cal Surplus', value: `${derivedFeatures.calorieSurplus > 0 ? '+' : ''}${derivedFeatures.calorieSurplus}`, sub: `vs ${idealCalories} kcal`, warn: derivedFeatures.calorieSurplus > 500 },
                  ].map((item, i) => (
                    <div key={i} className={`rounded-2xl p-3 border transition-all duration-300 ${item.warn ? 'bg-red-50/50 border-red-100' : 'bg-slate-50/30 border-gray-100 hover:border-gray-200'}`}>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</div>
                      <div className={`text-lg font-black mt-0.5 ${item.warn ? 'text-red-500' : 'text-gray-900'}`}>{item.value}</div>
                      <div className="text-[9px] text-gray-400 font-medium">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ROW 3: Strategic Recommendations */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-orange-500 animate-pulse" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{t('forecaster.recommendations')}</h3>
              </div>
              <p className="text-[10px] text-gray-400 mb-4">{t('forecaster.recommendationsBody')}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, i) => (
                  <div key={i} className="rounded-2xl border p-4 transition-all hover:shadow-sm hover:border-gray-200" style={{ borderColor: `${rec.color}25`, backgroundColor: `${rec.color}04` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5.5 h-5.5 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${rec.color}15` }}>
                        <ChevronRight className="w-3.5 h-3.5" style={{ color: rec.color }} />
                      </div>
                      <span className="text-xs font-bold text-gray-900">{rec.title}</span>
                      <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${rec.color}12`, color: rec.color }}>
                        {rec.impact}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed pl-7">{rec.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ═══ BOTTOM: Interactive Knowledge Base (Collapsible Sections) ═══ */}
        <div className="mt-12 space-y-4">
          <div className="border-b border-gray-150 pb-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-500" />
              {t('forecaster.knowledgeTitle')}
            </h2>
            <p className="text-xs text-gray-500 mt-1">{t('forecaster.knowledgeBody')}</p>
          </div>

          {[
            {
              id: 'features',
              title: '1. Fitur Pendukung & Hubungannya dengan BMI (Feature Insights)',
              icon: Brain,
              iconColor: 'text-violet-500',
              content: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm leading-relaxed text-gray-600">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-800 font-semibold">Fat Ratio (Fat-to-Calorie Ratio):</strong>
                        <p className="text-xs text-gray-500 mt-0.5">Dihitung sebagai <code>(Fat Total (g) × 9) ÷ Calorie Daily</code>. Menunjukkan persentase energi harian yang berasal dari lemak. Fitur ini merupakan prediktor terkuat dalam model kami (kepentingan fitur 26%).</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-orange mt-2 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-800 font-semibold">Calorie Surplus:</strong>
                        <p className="text-xs text-gray-500 mt-0.5">Dihitung dari <code>Calorie Daily - Ideal Calories Target</code>. Menunjukkan surplus kalori harian relatif terhadap target ideal personal Anda (dihitung secara ilmiah dari BMR, TDEE, dan BMI).</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-800 font-semibold">Exercise × Diet (Sinergi Aktivitas & Nutrisi):</strong>
                        <p className="text-xs text-gray-500 mt-0.5">Dihitung dengan mengalikan frekuensi olahraga mingguan dengan tingkat kualitas makanan (1-5). Kombinasi gaya hidup sehat ini melipatgandakan efek pelindungan metabolisme tubuh terhadap obesitas.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-800 font-semibold">Stress × Sleep (Interaksi Stres & Tidur):</strong>
                        <p className="text-xs text-gray-500 mt-0.5">Dihitung dengan mengalikan tingkat stres dengan jam tidur harian. Jam tidur yang pendek dikombinasikan dengan stres yang tinggi melipatgandakan pelepasan hormon kortisol, yang memicu akumulasi lemak visceral.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              id: 'methodology',
              title: '2. Kalkulasi Skor Sinergi & Metodologi Data (BQ2 & BQ3)',
              icon: BarChart3,
              iconColor: 'text-indigo-500',
              content: (
                <div className="space-y-5 text-sm text-gray-600">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">Formulasi Skor Synergy (0-100)</h4>
                    <p className="text-xs leading-relaxed text-gray-500 mb-3">
                      Skor sinergi dihitung secara real-time berdasarkan efek perlindungan dan risiko yang teridentifikasi dalam analisis statistik multivariat:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="font-semibold text-gray-700 mb-1">Kualitas Diet</div>
                        <div className="text-emerald-600 font-bold">Hingga +16 poin</div>
                        <div className="text-red-500 font-semibold">Kualitas buruk: -16 poin</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="font-semibold text-gray-700 mb-1">Olahraga Mingguan</div>
                        <div className="text-emerald-600 font-bold">≥3x/minggu: +10 poin</div>
                        <div className="text-red-500 font-semibold">Tidak olahraga: -8 poin</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="font-semibold text-gray-700 mb-1">Durasi Tidur</div>
                        <div className="text-emerald-600 font-bold">≥7 jam: +8 poin</div>
                        <div className="text-red-500 font-semibold">&lt;6 jam: -10 poin</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="font-semibold text-gray-700 mb-1">Fat Ratio (%)</div>
                        <div className="text-emerald-600 font-bold">&lt;25%: +10 poin</div>
                        <div className="text-red-500 font-semibold">≥45%: -15 poin</div>
                      </div>
                    </div>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1.5 flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-500" /> Korelasi Statistik (BQ2)</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Berdasarkan analisis korelasi Pearson pada dataset (n=7,490):
                        <br />• Korelasi Positif dengan BMI: Fat intake (<span className="text-red-500 font-semibold">+0.39</span>) & Calorie Daily (<span className="text-red-500 font-semibold">+0.31</span>).
                        <br />• Korelasi Negatif dengan BMI: Kualitas Diet (<span className="text-emerald-600 font-semibold">-0.36</span>), Frekuensi Olahraga (<span className="text-emerald-600 font-semibold">-0.25</span>), & Durasi Tidur (<span className="text-emerald-600 font-semibold">-0.18</span>).
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1.5 flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-500" /> Ukuran Efek A/B Testing (BQ3)</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Menggunakan uji hipotesis Mann-Whitney U & Cohen's d:
                        <br />• <strong className="text-gray-700">Kualitas Makanan (d = 0.67):</strong> Memiliki pengaruh terbesar (medium effect) dalam membedakan BMI antar kelompok.
                        <br />• <strong className="text-gray-700">Olahraga Harian (d = 0.35) & Tidur ≥7 jam (d = 0.28):</strong> Memiliki pengaruh signifikan (small effect) untuk menjaga BMI dalam rentang normal.
                      </p>
                    </div>
                  </div>
                </div>
              )
            },
            {
              id: 'health',
              title: '3. Rekomendasi Umum & Target Gaya Hidup Sehat (Guidelines)',
              icon: Heart,
              iconColor: 'text-rose-500',
              content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
                  <div className="bg-orange-50/20 border border-orange-100/50 rounded-2xl p-4.5">
                    <div className="flex items-center gap-2 mb-2">
                      <Utensils className="w-4 h-4 text-orange-500" />
                      <strong className="text-gray-800 font-semibold">Nutrisi & Energi</strong>
                    </div>
                    <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4 leading-relaxed">
                      <li>Batasi asupan lemak harian hingga kurang dari 30% dari total kalori harian Anda.</li>
                      <li>Fokus pada makanan utuh (whole foods) dengan serat tinggi seperti buah-buahan, sayur-sayuran, dan karbohidrat kompleks.</li>
                      <li>Pertahankan asupan kalori mendekati baseline kebutuhan ideal harian Anda (dihitung secara dinamis berdasarkan BMI, BMR, dan TDEE Anda).</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50/20 border border-blue-100/50 rounded-2xl p-4.5">
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell className="w-4 h-4 text-blue-500" />
                      <strong className="text-gray-800 font-semibold">Olahraga & Istirahat</strong>
                    </div>
                    <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4 leading-relaxed">
                      <li>Lakukan olahraga minimal 3 kali seminggu selama 30-45 menit per sesi (kombinasi latihan kekuatan & aerobik).</li>
                      <li>Tidur 7-9 jam setiap malam untuk mengoptimalkan metabolisme dan mempercepat regenerasi sel otot.</li>
                      <li>Jaga konsistensi jadwal tidur untuk menyeimbangkan produksi hormon insulin dan leptin harian.</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50/20 border border-purple-100/50 rounded-2xl p-4.5">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <strong className="text-gray-800 font-semibold">Stres & Zat Adiktif</strong>
                    </div>
                    <ul className="text-xs text-gray-550 space-y-2 list-disc pl-4 leading-relaxed">
                      <li>Kelola stres Anda di bawah tingkat 5/10 menggunakan meditasi, jurnal harian, atau hobi santai.</li>
                      <li>Hindari atau hentikan konsumsi rokok karena berisiko merusak kapiler pembuluh darah dan kesehatan jantung jangka panjang.</li>
                      <li>Batasi alkohol di tingkat terendah (skor 0 atau 1) guna mengurangi kalori kosong dan menjaga kinerja organ hati.</li>
                    </ul>
                  </div>
                </div>
              )
            }
          ].map((section) => {
            const SectionIcon = section.icon;
            const isOpen = openAccordion === section.id;
            return (
              <div key={section.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300">
                <button
                  type="button"
                  onClick={() => toggleAccordion(section.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-bold text-gray-800 hover:bg-gray-50/50 cursor-pointer transition-colors focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-gray-50 flex items-center justify-center`}>
                      <SectionIcon className={`w-4 h-4 ${section.iconColor}`} />
                    </div>
                    <span className="text-sm md:text-base font-bold tracking-tight text-gray-900">{section.title}</span>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90 text-brand-orange' : ''}`} />
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] border-t border-gray-55 opacity-100 py-6 px-6 bg-white' : 'max-h-0 opacity-0 pointer-events-none'}`}
                  style={{ overflow: 'hidden' }}
                >
                  {section.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
