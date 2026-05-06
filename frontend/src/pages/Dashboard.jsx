import React from 'react';
import { Activity, Droplet, Zap, BatteryCharging, Utensils, PersonStanding, BellDot } from 'lucide-react';

export default function Dashboard() {
  return (
    <main className="flex-1 p-8">

        <div className="max-w-4xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Good morning, Alex!</h1>
            <p className="text-gray-500">Here's your health landscape for today.</p>
          </header>

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

          {/* AI Summarization */}
          <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 shadow-sm border border-purple-100 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold text-lg mb-3">
                <Zap className="w-5 h-5" />
                AI Summarization
              </div>
              <p className="text-indigo-800/80 mb-6 text-sm pr-12 leading-relaxed">
                "Your energy levels are peaking right now! It's the perfect time to crush that afternoon HIIT session you planned. Metabolic state is optimal for high intensity."
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Hydration</span>
                    <Droplet className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-xl font-bold text-blue-500 mb-2">65%</div>
                  <div className="h-1.5 w-full bg-blue-100 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Metabolic</span>
                    <Zap className="w-4 h-4 text-brand-orange" />
                  </div>
                  <div className="text-xl font-bold text-brand-orange mb-2">Steady</div>
                  <div className="h-1.5 w-full bg-orange-100 rounded-full">
                    <div className="h-full bg-brand-orange rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Readiness</span>
                    <BatteryCharging className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-xl font-bold text-green-500 mb-2">High</div>
                  <div className="h-1.5 w-full bg-green-100 rounded-full">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 text-gray-600 font-medium text-sm mb-3">
                  <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                  Personalized Recommendations
                </div>
                <div className="flex flex-col gap-2">
                  <div className="bg-orange-50 text-orange-800 text-sm py-3 px-4 rounded-xl flex items-center gap-3">
                    <Utensils className="w-4 h-4" />
                    Increase protein intake by 15g in next meal
                  </div>
                  <div className="bg-blue-50 text-blue-800 text-sm py-3 px-4 rounded-xl flex items-center gap-3">
                    <PersonStanding className="w-4 h-4" />
                    Opt for a 15-min walk to boost circulation
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-indigo-700 font-medium text-sm mb-3">
                  <BellDot className="w-4 h-4" />
                  Smart Alert
                </div>
                <div className="bg-white/60 rounded-xl p-4 space-y-3">
                  <div className="flex gap-3 relative before:absolute before:left-1.5 before:top-5 before:bottom-[-12px] before:w-px before:bg-gray-200 last:before:hidden">
                    <div className="w-3 h-3 rounded-full bg-red-400 mt-1 flex-shrink-0 relative z-10 border-2 border-white"></div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Hydration Alert</div>
                      <div className="text-xs text-gray-500">You're 20% below your target for this hour.</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-400 mt-1 flex-shrink-0 relative z-10 border-2 border-white"></div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Movement Check</div>
                      <div className="text-xs text-gray-500">Good job on the morning steps! Keep it up.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recently Logged */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-orange-50 relative pb-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recently Logged</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden border border-gray-100 relative group">
                <div className="h-32 bg-gray-200 w-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Grilled Chicken Salad" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 bg-gradient-to-t from-white via-white to-transparent absolute bottom-0 w-full pt-12">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-gray-900">Grilled Chicken Salad</h3>
                    <span className="text-brand-orange text-xs font-medium">12.30 pm</span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">340 kcal</span>
                    <span>P: 42g</span>
                    <span>C: 12g</span>
                    <span>F: 14g</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl overflow-hidden border border-gray-100 relative group">
                <div className="h-32 bg-gray-200 w-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1494597564530-871f2b93ac55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Acai Breakfast Bowl" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 bg-gradient-to-t from-white via-white to-transparent absolute bottom-0 w-full pt-12">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-gray-900">Acai Breakfast Bowl</h3>
                    <span className="text-brand-orange text-xs font-medium">12.23 pm</span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">410 kcal</span>
                    <span>P: 8g</span>
                    <span>C: 65g</span>
                    <span>F: 12g</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="absolute bottom-6 right-6 bg-brand-orange hover:bg-brand-orange-dark text-white font-medium py-2 px-6 rounded-full transition-colors shadow-lg shadow-orange-200">
              Scan meal
            </button>
          </section>

        </div>
      </main>
  );
}
