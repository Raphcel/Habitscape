import React, { useState } from 'react';
import { LineChart, Activity, Zap, Info } from 'lucide-react';

export default function HealthForecaster() {
  const [prediction, setPrediction] = useState(null);

  const handlePredict = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setPrediction({
        bmi: 23.8,
        status: 'Normal',
        message: 'Great job maintaining a healthy lifestyle! Keep up with your hydration and step count.'
      });
    }, 800);
  };

  return (
    <main className="flex-1 p-8 min-h-screen">
      <div className="max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Precision BMI Forecaster</h1>
          <p className="text-gray-500">Predict your future health metrics using advanced machine learning models based on your current lifestyle data.</p>
        </header>

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-3">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-50">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Lifestyle Parameters</h2>
              
              <form onSubmit={handlePredict} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                    <input type="number" defaultValue={24} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow bg-white">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Daily Steps</label>
                      <span className="text-sm font-bold text-brand-orange">8,500 steps</span>
                    </div>
                    <input type="range" min="0" max="20000" defaultValue="8500" className="w-full accent-brand-orange" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Sleep Hours</label>
                      <span className="text-sm font-bold text-blue-500">7.5 hours</span>
                    </div>
                    <input type="range" min="0" max="12" step="0.5" defaultValue="7.5" className="w-full accent-blue-500" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Water Intake (Liters)</label>
                      <span className="text-sm font-bold text-cyan-500">2.5 L</span>
                    </div>
                    <input type="range" min="0" max="6" step="0.1" defaultValue="2.5" className="w-full accent-cyan-500" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Daily Calories Consumed</label>
                      <span className="text-sm font-bold text-purple-500">2,100 kcal</span>
                    </div>
                    <input type="range" min="1000" max="4000" step="50" defaultValue="2100" className="w-full accent-purple-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                    <input type="checkbox" id="smoker" className="w-5 h-5 accent-brand-orange rounded" />
                    <label htmlFor="smoker" className="text-sm font-medium text-gray-700 cursor-pointer">Smoker</label>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                    <input type="checkbox" id="alcohol" className="w-5 h-5 accent-brand-orange rounded" />
                    <label htmlFor="alcohol" className="text-sm font-medium text-gray-700 cursor-pointer">Consume Alcohol</label>
                  </div>
                </div>

                <button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-200 mt-4 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" /> Generate Forecast
                </button>
              </form>
            </div>
          </div>

          <div className="col-span-2">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 shadow-xl text-white sticky top-8">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-8 uppercase tracking-widest text-xs">
                <LineChart className="w-4 h-4" /> Forecast Results
              </div>
              
              {!prediction ? (
                <div className="h-64 flex flex-col items-center justify-center text-center opacity-60">
                  <Activity className="w-12 h-12 mb-4 animate-pulse" />
                  <p className="text-sm">Enter your lifestyle data and run the model to see your personalized health forecast.</p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center mb-8">
                    <div className="text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
                      {prediction.bmi}
                    </div>
                    <div className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-sm font-medium tracking-wide">
                      Predicted BMI: {prediction.status}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md mb-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-indigo-300 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-indigo-100 leading-relaxed">
                        {prediction.message}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Model Confidence</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-indigo-950 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full w-[94%] relative">
                           <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent to-white/30"></div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-indigo-200">94%</span>
                    </div>
                    <p className="text-[10px] text-indigo-400">Based on XGBoost regression model analysis</p>
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
