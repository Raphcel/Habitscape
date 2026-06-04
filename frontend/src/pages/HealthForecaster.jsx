import React, { useState, useEffect } from 'react';
import { LineChart, Activity, Zap, Info, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CustomSelect from '../components/CustomSelect';
import CustomSlider from '../components/CustomSlider';
import api from '../lib/api';

export default function HealthForecaster() {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Lifestyle inputs
  const [calories, setCalories] = useState(2200);
  const [fatTotal, setFatTotal] = useState(70);
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(5);
  const [exerciseFreq, setExerciseFreq] = useState(3);
  const [dietQuality, setDietQuality] = useState(3);
  const [smoker, setSmoker] = useState(false);
  const [alcohol, setAlcohol] = useState(0);

  // Profile inputs — pre-filled from user profile
  const [age, setAge] = useState(24);
  const [heightCm, setHeightCm] = useState(170);

  useEffect(() => {
    if (user) {
      if (user.age) setAge(user.age);
      if (user.height_cm) setHeightCm(user.height_cm);
    }
  }, [user]);

  const handlePredict = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setPrediction(null);

    try {
      const response = await api.post('/forecaster/predict-bmi', {
        fat_total_g: fatTotal,
        height_cm: heightCm,
        age,
        sleep_hours: sleepHours,
        calorie_daily: calories,
        diet_quality_num: dietQuality,
        smoker_num: smoker ? 1 : 0,
        alcohol_num: alcohol,
        stress_level: stressLevel,
        exercise_freq_num: exerciseFreq,
      });

      setPrediction(response.data.data);
    } catch (err) {
      console.error('BMI prediction failed:', err);
      setError(
        err.response?.data?.message ||
        'Failed to get prediction. The ML service might be starting up — please try again in a moment.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (category) => {
    switch (category) {
      case 'Underweight': return 'text-blue-300';
      case 'Normal': return 'text-emerald-300';
      case 'Overweight': return 'text-amber-300';
      case 'Obese': return 'text-red-300';
      default: return 'text-white';
    }
  };

  const getStatusBg = (category) => {
    switch (category) {
      case 'Underweight': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Normal': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Overweight': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Obese': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getGradient = (category) => {
    switch (category) {
      case 'Underweight': return 'from-blue-300 to-cyan-300';
      case 'Normal': return 'from-emerald-300 to-cyan-300';
      case 'Overweight': return 'from-amber-300 to-orange-300';
      case 'Obese': return 'from-red-300 to-pink-300';
      default: return 'from-gray-300 to-gray-300';
    }
  };

  return (
    <main className="flex-1 p-8 min-h-screen">
      <div className="max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Precision BMI Forecaster</h1>
          <p className="text-gray-500">Predict your BMI category using a neural network model trained on lifestyle data, with personalized AI recommendations.</p>
        </header>

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-3">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-50">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Lifestyle Parameters</h2>
              
              <form onSubmit={handlePredict} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                    <input 
                      type="number" 
                      value={age} 
                      onChange={(e) => setAge(Number(e.target.value))}
                      min={1}
                      max={150}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                    <input 
                      type="number" 
                      value={heightCm} 
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      min={50}
                      max={300}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Daily Calories</label>
                      <span className="text-sm font-bold text-brand-orange">{calories.toLocaleString()} kcal</span>
                    </div>
                    <CustomSlider 
                      min={1000} 
                      max={4000} 
                      step={50}
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value))}
                      colorClass="bg-brand-orange"
                      thumbColorHex="#FF8235"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Daily Fat Intake (g)</label>
                      <span className="text-sm font-bold text-red-400">{fatTotal} g</span>
                    </div>
                    <CustomSlider 
                      min={0} 
                      max={200} 
                      step={1}
                      value={fatTotal}
                      onChange={(e) => setFatTotal(Number(e.target.value))}
                      colorClass="bg-red-400"
                      thumbColorHex="#F87171"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Sleep Hours</label>
                      <span className="text-sm font-bold text-blue-500">{sleepHours} hours</span>
                    </div>
                    <CustomSlider 
                      min={0} 
                      max={12} 
                      step={0.5} 
                      value={sleepHours}
                      onChange={(e) => setSleepHours(Number(e.target.value))}
                      colorClass="bg-blue-500"
                      thumbColorHex="#3B82F6"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Stress Level</label>
                      <span className="text-sm font-bold text-purple-500">{stressLevel}/10</span>
                    </div>
                    <CustomSlider 
                      min={1} 
                      max={10} 
                      step={1} 
                      value={stressLevel}
                      onChange={(e) => setStressLevel(Number(e.target.value))}
                      colorClass="bg-purple-500"
                      thumbColorHex="#A855F7"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Exercise (times/week)</label>
                      <span className="text-sm font-bold text-cyan-500">{exerciseFreq}x</span>
                    </div>
                    <CustomSlider 
                      min={0} 
                      max={14} 
                      step={1} 
                      value={exerciseFreq}
                      onChange={(e) => setExerciseFreq(Number(e.target.value))}
                      colorClass="bg-cyan-500"
                      thumbColorHex="#06B6D4"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Diet Quality</label>
                    <CustomSelect
                      name="diet_quality"
                      value={String(dietQuality)}
                      onChange={(e) => setDietQuality(Number(e.target.value))}
                      options={['1', '2', '3', '4', '5']}
                    />
                    <p className="text-xs text-gray-400 mt-1">1 = Poor, 5 = Excellent</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alcohol</label>
                    <CustomSelect
                      name="alcohol"
                      value={String(alcohol)}
                      onChange={(e) => setAlcohol(Number(e.target.value))}
                      options={['0', '1', '2']}
                    />
                    <p className="text-xs text-gray-400 mt-1">0 = None, 1 = Light, 2 = Heavy</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="smoker" 
                    checked={smoker}
                    onChange={(e) => setSmoker(e.target.checked)}
                    className="w-5 h-5 accent-brand-orange rounded" 
                  />
                  <label htmlFor="smoker" className="text-sm font-medium text-gray-700 cursor-pointer">Smoker</label>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-200 mt-4 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Generate Forecast
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="col-span-2">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 shadow-xl text-white sticky top-8">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-8 uppercase tracking-widest text-xs">
                <LineChart className="w-4 h-4" /> Forecast Results
              </div>
              
              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-12 h-12 mb-4 animate-spin text-indigo-300" />
                  <p className="text-sm text-indigo-200">Running ML model & generating AI recommendations...</p>
                </div>
              ) : error ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
                  <p className="text-sm text-red-300 mb-4">{error}</p>
                  <button 
                    onClick={handlePredict}
                    className="text-sm text-indigo-300 hover:text-white underline transition-colors"
                  >
                    Try again
                  </button>
                </div>
              ) : !prediction ? (
                <div className="h-64 flex flex-col items-center justify-center text-center opacity-60">
                  <Activity className="w-12 h-12 mb-4 animate-pulse" />
                  <p className="text-sm">Enter your lifestyle data and run the model to see your personalized health forecast.</p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center mb-8">
                    <div className={`text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r ${getGradient(prediction.bmi_category)}`}>
                      {prediction.bmi_category}
                    </div>
                    <div className={`inline-block ${getStatusBg(prediction.bmi_category)} border px-3 py-1 rounded-full text-sm font-medium tracking-wide`}>
                      Confidence: {Math.round(prediction.confidence * 100)}%
                    </div>
                  </div>

                  {/* Probabilities breakdown */}
                  {prediction.probabilities && (
                    <div className="space-y-3 mb-6">
                      <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Category Probabilities</h4>
                      {Object.entries(prediction.probabilities).map(([category, prob]) => (
                        <div key={category} className="flex items-center gap-3">
                          <span className={`text-xs font-medium w-24 ${getStatusColor(category)}`}>{category}</span>
                          <div className="flex-1 h-2 bg-indigo-950 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-400 rounded-full transition-all duration-500 relative"
                              style={{ width: `${Math.round(prob * 100)}%` }}
                            >
                              <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent to-white/30"></div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-indigo-200 w-12 text-right">{Math.round(prob * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Recommendation */}
                  {prediction.ai_recommendation && (
                    <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md mb-6">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-indigo-300 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">AI Recommendation</h4>
                          <p className="text-sm text-indigo-100 leading-relaxed whitespace-pre-line">
                            {prediction.ai_recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Model Info</h4>
                    <p className="text-[10px] text-indigo-400">Neural network classifier with DeepSeek AI-powered health recommendations</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
