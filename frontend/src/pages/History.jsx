import React from 'react';
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';

export default function History() {
  return (
    <main className="flex-1 p-8 min-h-screen">
      <div className="max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">History & Progress</h1>
          <p className="text-gray-500">Review your past activities and health trends.</p>
        </header>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-50">
          
          {/* Header Controls */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">Health Development</h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 text-brand-orange font-medium">
                <button className="p-1 hover:bg-orange-50 rounded"><ChevronLeft className="w-5 h-5" /></button>
                <span>Nov 12 - Nov 18, 2023</span>
                <button className="p-1 hover:bg-orange-50 rounded"><ChevronRight className="w-5 h-5" /></button>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-full">
                <button className="px-4 py-1.5 bg-white shadow-sm rounded-full text-sm font-medium text-brand-orange">Weekly</button>
                <button className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700">Monthly</button>
              </div>
            </div>
          </div>

          {/* Bar Charts Grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-10 mb-12">
            
            {/* Calories Chart */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-brand-orange font-semibold">
                  <div className="w-4 h-4 rounded-full bg-brand-orange flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  Calories
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  Goal: <span className="text-green-500">2,200 Kcal</span> &nbsp;&nbsp; Avg: <span className="text-gray-900 font-bold">1,840 Kcal</span>
                </div>
              </div>
              <div className="relative h-40 flex items-end justify-between px-2">
                {/* Goal Line */}
                <div className="absolute w-full border-t border-dashed border-green-400 top-10 left-0 z-0"></div>
                <div className="absolute top-4 right-0 text-[10px] text-gray-400 font-bold uppercase tracking-wider">KCAL</div>
                
                {/* Bars */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-3 z-10 w-8">
                    <div className="w-full h-32 bg-gray-100 rounded-full relative overflow-hidden">
                      <div className={`absolute bottom-0 w-full rounded-full transition-all duration-1000 ${i === 6 ? 'bg-brand-orange' : 'bg-gray-200'}`} style={{ height: `${[40, 60, 55, 30, 45, 20, 80][i]}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-400">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Protein Chart */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-blue-500 font-semibold">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  Protein
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  Goal: <span className="text-green-500">160g</span> &nbsp;&nbsp; Avg: <span className="text-gray-900 font-bold">142g</span>
                </div>
              </div>
              <div className="relative h-40 flex items-end justify-between px-2">
                <div className="absolute w-full border-t border-dashed border-green-400 top-12 left-0 z-0"></div>
                <div className="absolute top-4 right-0 text-[10px] text-gray-400 font-bold uppercase tracking-wider">GRAMS</div>
                
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-3 z-10 w-8">
                    <div className="w-full h-32 bg-gray-100 rounded-full relative overflow-hidden">
                      <div className={`absolute bottom-0 w-full rounded-full transition-all duration-1000 ${i === 6 ? 'bg-blue-500' : 'bg-gray-200'}`} style={{ height: `${[50, 40, 65, 35, 50, 30, 85][i]}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-400">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Carbohydrates Chart */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-yellow-500 font-semibold">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  Carbohydrates
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  Goal: <span className="text-green-500">250g</span> &nbsp;&nbsp; Avg: <span className="text-gray-900 font-bold">210g</span>
                </div>
              </div>
              <div className="relative h-40 flex items-end justify-between px-2">
                <div className="absolute w-full border-t border-dashed border-green-400 top-16 left-0 z-0"></div>
                <div className="absolute top-4 right-0 text-[10px] text-gray-400 font-bold uppercase tracking-wider">GRAMS</div>
                
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-3 z-10 w-8">
                    <div className="w-full h-32 bg-gray-100 rounded-full relative overflow-hidden">
                      <div className={`absolute bottom-0 w-full rounded-full transition-all duration-1000 ${i === 6 ? 'bg-yellow-500' : 'bg-gray-200'}`} style={{ height: `${[60, 50, 45, 30, 40, 35, 60][i]}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-400">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fats Chart */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-purple-500 font-semibold">
                  <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  Fats
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  Goal: <span className="text-green-500">70g</span> &nbsp;&nbsp; Avg: <span className="text-gray-900 font-bold">78g</span>
                </div>
              </div>
              <div className="relative h-40 flex items-end justify-between px-2">
                <div className="absolute w-full border-t border-dashed border-green-400 top-10 left-0 z-0"></div>
                <div className="absolute top-4 right-0 text-[10px] text-gray-400 font-bold uppercase tracking-wider">GRAMS</div>
                
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-3 z-10 w-8">
                    <div className="w-full h-32 bg-gray-100 rounded-full relative overflow-hidden">
                      <div className={`absolute bottom-0 w-full rounded-full transition-all duration-1000 ${i === 6 ? 'bg-purple-500' : 'bg-gray-200'}`} style={{ height: `${[45, 55, 60, 40, 55, 50, 90][i]}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-400">{day}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* BMI Analysis Line Chart */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                <div className="w-4 h-4 rounded-md border-2 border-emerald-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-sm"></div>
                </div>
                BMI Analysis
              </div>
              <div className="flex gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Current: <span className="text-gray-900 font-bold">23.4</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-200"></span> Normal Range: <span className="text-gray-900 font-bold">18.5 - 24.9</span>
                </div>
              </div>
            </div>
            <div className="h-24 w-full relative">
              {/* Fake SVG Line chart for BMI */}
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/50 to-transparent flex items-end pb-0">
                <svg viewBox="0 0 1000 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                  <path d="M0,80 Q200,85 350,75 T600,65 T1000,50 L1000,100 L0,100 Z" fill="rgba(16, 185, 129, 0.1)" />
                  <path d="M0,80 Q200,85 350,75 T600,65 T1000,50" fill="none" stroke="#10B981" strokeWidth="3" />
                  <circle cx="350" cy="75" r="4" fill="#fff" stroke="#10B981" strokeWidth="2" />
                  <circle cx="600" cy="65" r="4" fill="#fff" stroke="#10B981" strokeWidth="2" />
                  <circle cx="1000" cy="50" r="4" fill="#fff" stroke="#10B981" strokeWidth="2" />
                </svg>
              </div>
              <div className="absolute bottom-[-24px] w-full flex justify-between px-2 text-[10px] text-gray-400 font-bold uppercase">
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
                <span>Jan</span>
                <span>Feb</span>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 my-8" />

          {/* Recent Food Logs */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Food Logs</h3>
              <p className="text-xs text-gray-500">Your most recently tracked meals</p>
            </div>
            
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] text-gray-400 font-bold tracking-wider uppercase border-b border-gray-100">
                  <th className="pb-3 font-medium">Meal Name</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Calories</th>
                  <th className="pb-3 font-medium">Macros (P/C/F)</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { name: 'Avocado Toast & Eggs', time: '04/24/2026 18:46', cal: 450, macros: '22g / 28g / 32g' },
                  { name: 'Salmon Poke Bowl', time: '04/24/2026 18:46', cal: 520, macros: '38g / 45g / 18g' },
                  { name: 'Greek Yogurt with Berries', time: '04/24/2026 18:46', cal: 210, macros: '18g / 24g / 6g' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-semibold text-gray-800">{row.name}</td>
                    <td className="py-4 text-gray-500">{row.time}</td>
                    <td className="py-4">
                      <span className="text-brand-orange bg-orange-50 px-2 py-1 rounded font-medium text-xs">
                        {row.cal} kcal
                      </span>
                    </td>
                    <td className="py-4 text-gray-500 font-medium">{row.macros}</td>
                    <td className="py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-brand-orange transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors ml-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </main>
  );
}
