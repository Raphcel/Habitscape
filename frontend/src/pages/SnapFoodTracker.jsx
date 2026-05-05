import React, { useState } from 'react';
import { Camera, Upload, AlertCircle, Sparkles, Utensils, Droplets, Target, ChevronRight, Edit2 } from 'lucide-react';

export default function SnapFoodTracker() {
  const [hasImage, setHasImage] = useState(false);

  // Mock toggle for demo purposes
  const handleUpload = () => setHasImage(true);

  return (
    <main className="flex-1 ml-64 p-8 min-h-screen">
      <div className="max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Food Intelligence</h1>
          <p className="text-gray-500">Snap your meal to instantly track macros using Habitscape AI.</p>
        </header>

        {!hasImage ? (
          <div className="flex gap-8">
            {/* Upload Area */}
            <div className="flex-5 flex flex-col gap-6">
              <div 
                onClick={handleUpload}
                className="border-2 border-dashed border-orange-300 bg-white rounded-3xl h-[400px] flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/50 transition-colors group"
              >
                <div className="w-16 h-16 bg-orange-50 text-brand-orange rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Drag and drop your meal photo here</h3>
                <p className="text-gray-500 text-center max-w-sm mb-8">
                  Our AI identifies ingredients, portion sizes, and hidden nutrients automatically.
                </p>
                <button className="bg-brand-orange hover:bg-brand-orange-dark text-white font-medium py-3 px-8 rounded-full transition-colors shadow-lg shadow-orange-200">
                  Upload File
                </button>
                <span className="text-xs text-gray-400 mt-6 font-medium tracking-widest uppercase">
                  Supports JPEG, PNG, and HEIC formats
                </span>
              </div>

              <div className="bg-orange-50/50 border border-brand-orange-light rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 mb-2">How it works</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Habitscape AI utilizes advanced computer vision to identify <span className="text-brand-orange font-medium">ingredients</span>, estimate <span className="text-brand-orange font-medium">portion sizes</span>, and calculate <span className="text-brand-orange font-medium">nutrients</span> instantly from a single snap.
                </p>
              </div>
            </div>

            {/* Sidebar Guide */}
            <div className="w-[200px] flex flex-col gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-900 font-semibold mb-6">
                  <AlertCircle className="w-5 h-5 text-brand-orange" />
                  Photo Guide
                </div>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 text-brand-orange">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm mb-1">Good lighting</h5>
                      <p className="text-xs text-gray-500 leading-relaxed">Natural light works best for color and texture accuracy.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 text-brand-orange">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm mb-1">Avoid blur</h5>
                      <p className="text-xs text-gray-500 leading-relaxed">Keep your camera steady for sharp ingredient detection.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 text-brand-orange">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm mb-1">Single plate focus</h5>
                      <p className="text-xs text-gray-500 leading-relaxed">Center your meal and capture the entire dish clearly.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden relative h-48 group">
                <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Example" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                  <span className="text-white/80 text-[10px] font-bold tracking-widest uppercase mb-1">Example Log</span>
                  <h5 className="text-white font-medium">Mediterranean Bowl with Quinoa & Feta</h5>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Image Preview */}
            <div className="flex-1">
              <div className="rounded-3xl overflow-hidden shadow-sm h-[600px] border border-gray-100 relative group">
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Detected Meal" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setHasImage(false)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-white transition-colors"
                >
                  Retake Photo
                </button>
              </div>
            </div>

            {/* Results Panel */}
            <div className="w-[450px] bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Grilled Chicken Salad
                  <button className="text-gray-400 hover:text-brand-orange transition-colors"><Edit2 className="w-4 h-4" /></button>
                </h2>
              </div>

              {/* Macros Grid */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-orange-50/50 border border-brand-orange-light rounded-2xl p-4 flex flex-col justify-center relative group cursor-pointer hover:bg-orange-50 transition-colors">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-brand-orange uppercase mb-1 tracking-wider">
                    <Zap className="w-3 h-3" /> Calories
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">340</span>
                    <span className="text-xs text-gray-500 font-medium">kcal</span>
                  </div>
                  <Edit2 className="w-3 h-3 text-gray-300 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="bg-orange-50/50 border border-brand-orange-light rounded-2xl p-4 flex flex-col justify-center relative group cursor-pointer hover:bg-orange-50 transition-colors">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-brand-orange-dark uppercase mb-1 tracking-wider">
                    <Utensils className="w-3 h-3" /> Protein
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">33</span>
                    <span className="text-xs text-gray-500 font-medium">g</span>
                  </div>
                  <Edit2 className="w-3 h-3 text-gray-300 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="bg-orange-50/50 border border-brand-orange-light rounded-2xl p-4 flex flex-col justify-center relative group cursor-pointer hover:bg-orange-50 transition-colors">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-brand-orange uppercase mb-1 tracking-wider">
                    <Camera className="w-3 h-3" /> Carbs
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">12</span>
                    <span className="text-xs text-gray-500 font-medium">g</span>
                  </div>
                  <Edit2 className="w-3 h-3 text-gray-300 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="bg-orange-50/50 border border-brand-orange-light rounded-2xl p-4 flex flex-col justify-center relative group cursor-pointer hover:bg-orange-50 transition-colors">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-brand-orange uppercase mb-1 tracking-wider">
                    <Droplets className="w-3 h-3" /> Fat
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">16.1</span>
                    <span className="text-xs text-gray-500 font-medium">g</span>
                  </div>
                  <Edit2 className="w-3 h-3 text-gray-300 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">
                    <Utensils className="w-3.5 h-3.5" /> Portions Estimation
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-1">1.5 servings</div>
                  <div className="text-xs text-gray-500 leading-relaxed">Plate size detected: 10.5-inch standard dinner plate.</div>
                </div>
                <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 text-cyan-700 text-xs font-semibold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> Key Insights
                  </div>
                  <div className="text-xs text-cyan-900 leading-relaxed">
                    High in protein, good for muscle recovery. Low glycemic index veggies detected.
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-orange-50/30 border border-brand-orange-light rounded-2xl p-4 mb-auto">
                <div className="flex items-center gap-1.5 text-brand-orange text-xs font-semibold uppercase tracking-wider mb-2">
                  <AlertCircle className="w-3.5 h-3.5" /> Summary
                </div>
                <p className="text-sm text-gray-700 italic">
                  "A balanced Mediterranean-style bowl with lean protein and fiber-rich greens."
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setHasImage(false)}
                  className="flex-1 bg-brand-orange hover:bg-brand-orange-dark text-white font-medium py-3.5 px-4 rounded-2xl transition-colors shadow-lg shadow-orange-200"
                >
                  Save
                </button>
                <button 
                  onClick={() => setHasImage(false)}
                  className="px-8 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-medium py-3.5 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
