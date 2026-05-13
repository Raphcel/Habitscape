import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, Sparkles, Utensils, Droplets, Target, ChevronRight, Edit2, Zap, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function SnapFoodTracker() {
  const [hasImage, setHasImage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logData, setLogData] = useState(null);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    meal_name: '', calories: 0, protein: 0, carbs: 0, fat: 0
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsAnalyzing(true);
    setHasImage(true);
    
    // Create a local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/food-logs/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Backend now saves it and returns the updated log
      const newLog = response.data.data;
      setLogData(newLog);
      setEditForm({
        meal_name: newLog.meal_name || '',
        calories: newLog.calories || 0,
        protein: newLog.protein || 0,
        carbs: newLog.carbs || 0,
        fat: newLog.fat || 0,
      });
      // Use the server's image URL if available
      if (newLog.image_url) {
        setPreviewUrl(newLog.image_url);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to analyze image. It has been saved to your logs.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditForm({
        meal_name: logData.meal_name || '',
        calories: logData.calories || 0,
        protein: logData.protein || 0,
        carbs: logData.carbs || 0,
        fat: logData.fat || 0,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'meal_name' ? value : (value === '' ? '' : Number(value))
    }));
  };

  const saveEdits = async () => {
    if (!logData?.id) return;
    setIsSavingEdit(true);
    try {
      const res = await api.patch(`/food-logs/${logData.id}`, editForm);
      setLogData(res.data.data.foodLog || res.data.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update log', err);
      alert(err.response?.data?.message || 'Failed to update log');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSave = () => {
    // It's already saved in the database! We can just navigate to history or reset.
    navigate('/history'); // Assuming /history is the route for viewing logs
  };

  const handleCancel = async () => {
    // If we have an ID, delete it from the DB
    if (logData?.id) {
      try {
        await api.delete(`/food-logs/${logData.id}`);
      } catch (err) {
        console.error('Failed to delete cancelled log', err);
      }
    }
    resetForm();
  };

  const resetForm = () => {
    setHasImage(false);
    setIsAnalyzing(false);
    setLogData(null);
    setError('');
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <main className="flex-1 p-8 min-h-screen">
      <div className="max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Food Intelligence</h1>
          <p className="text-gray-500">Snap your meal to instantly track macros using Habitscape AI.</p>
        </header>

        {!hasImage ? (
          <div className="flex gap-8">
            {/* Upload Area */}
            <div className="flex-5 flex flex-col gap-6 w-full">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg, image/png, image/heic"
                onChange={handleFileChange}
              />
              <div 
                onClick={handleUploadClick}
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
            <div className="w-[250px] flex flex-col gap-6">
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
            </div>
          </div>
        ) : (
          <div className="flex gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Image Preview */}
            <div className="flex-1">
              <div className="rounded-3xl overflow-hidden shadow-sm h-[600px] border border-gray-100 relative group bg-black/5 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Detected Meal" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Camera className="w-12 h-12 mb-2 opacity-50" />
                    <span>No preview available</span>
                  </div>
                )}
                {!isAnalyzing && (
                  <button 
                    onClick={resetForm}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-white transition-colors"
                  >
                    Retake Photo
                  </button>
                )}
              </div>
            </div>

            {/* Results Panel */}
            <div className="w-[450px] bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
              {isAnalyzing ? (
                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 text-brand-orange animate-spin mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing your meal...</h3>
                  <p className="text-gray-500 text-sm text-center px-6">
                    Our AI is identifying ingredients, portion sizes, and hidden nutrients.
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h3>
                  <p className="text-gray-600 text-sm mb-6">{error}</p>
                  <button 
                    onClick={resetForm}
                    className="bg-brand-orange hover:bg-brand-orange-dark text-white font-medium py-3 px-8 rounded-full transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : logData && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    {isEditing ? (
                      <div className="flex-1 mr-4">
                        <input 
                          type="text" 
                          name="meal_name"
                          value={editForm.meal_name}
                          onChange={handleEditChange}
                          className="w-full text-2xl font-bold text-gray-900 border-b-2 border-brand-orange focus:outline-none bg-orange-50/30 px-2 py-1 rounded"
                          placeholder="Meal Name"
                        />
                      </div>
                    ) : (
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {logData.meal_name || 'Unknown Meal'}
                        <button onClick={handleEditToggle} className="text-gray-400 hover:text-brand-orange transition-colors"><Edit2 className="w-4 h-4" /></button>
                      </h2>
                    )}
                    
                    {isEditing && (
                      <button 
                        onClick={saveEdits} 
                        disabled={isSavingEdit}
                        className="bg-brand-orange text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-brand-orange-dark disabled:opacity-50"
                      >
                        {isSavingEdit ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </div>

                  {/* Macros Grid */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="bg-orange-50/50 border border-brand-orange-light rounded-2xl p-4 flex flex-col justify-center relative group">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-brand-orange uppercase mb-1 tracking-wider">
                        <Zap className="w-3 h-3" /> Calories
                      </div>
                      <div className="flex items-baseline gap-1">
                        {isEditing ? (
                          <input type="number" name="calories" value={editForm.calories} onChange={handleEditChange} className="w-16 text-2xl font-bold text-gray-900 bg-white border border-orange-200 rounded px-1" />
                        ) : (
                          <span className="text-2xl font-bold text-gray-900">{logData.calories || 0}</span>
                        )}
                        <span className="text-xs text-gray-500 font-medium">kcal</span>
                      </div>
                      {!isEditing && <button onClick={handleEditToggle} className="absolute top-3 right-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-brand-orange"><Edit2 className="w-3 h-3" /></button>}
                    </div>
                    <div className="bg-orange-50/50 border border-brand-orange-light rounded-2xl p-4 flex flex-col justify-center relative group">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-brand-orange-dark uppercase mb-1 tracking-wider">
                        <Utensils className="w-3 h-3" /> Protein
                      </div>
                      <div className="flex items-baseline gap-1">
                        {isEditing ? (
                          <input type="number" name="protein" value={editForm.protein} onChange={handleEditChange} className="w-12 text-2xl font-bold text-gray-900 bg-white border border-orange-200 rounded px-1" />
                        ) : (
                          <span className="text-2xl font-bold text-gray-900">{logData.protein || 0}</span>
                        )}
                        <span className="text-xs text-gray-500 font-medium">g</span>
                      </div>
                      {!isEditing && <button onClick={handleEditToggle} className="absolute top-3 right-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-brand-orange"><Edit2 className="w-3 h-3" /></button>}
                    </div>
                    <div className="bg-orange-50/50 border border-brand-orange-light rounded-2xl p-4 flex flex-col justify-center relative group">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-brand-orange uppercase mb-1 tracking-wider">
                        <Camera className="w-3 h-3" /> Carbs
                      </div>
                      <div className="flex items-baseline gap-1">
                        {isEditing ? (
                          <input type="number" name="carbs" value={editForm.carbs} onChange={handleEditChange} className="w-12 text-2xl font-bold text-gray-900 bg-white border border-orange-200 rounded px-1" />
                        ) : (
                          <span className="text-2xl font-bold text-gray-900">{logData.carbs || 0}</span>
                        )}
                        <span className="text-xs text-gray-500 font-medium">g</span>
                      </div>
                      {!isEditing && <button onClick={handleEditToggle} className="absolute top-3 right-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-brand-orange"><Edit2 className="w-3 h-3" /></button>}
                    </div>
                    <div className="bg-orange-50/50 border border-brand-orange-light rounded-2xl p-4 flex flex-col justify-center relative group">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-brand-orange uppercase mb-1 tracking-wider">
                        <Droplets className="w-3 h-3" /> Fat
                      </div>
                      <div className="flex items-baseline gap-1">
                        {isEditing ? (
                          <input type="number" name="fat" value={editForm.fat} onChange={handleEditChange} step="0.1" className="w-12 text-2xl font-bold text-gray-900 bg-white border border-orange-200 rounded px-1" />
                        ) : (
                          <span className="text-2xl font-bold text-gray-900">{logData.fat || 0}</span>
                        )}
                        <span className="text-xs text-gray-500 font-medium">g</span>
                      </div>
                      {!isEditing && <button onClick={handleEditToggle} className="absolute top-3 right-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-brand-orange"><Edit2 className="w-3 h-3" /></button>}
                    </div>
                  </div>

                  {/* Insights - Mocked for now since backend doesn't return this yet */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                      <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">
                        <Target className="w-3.5 h-3.5" /> AI Confidence
                      </div>
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        {logData.confidence ? Math.round(logData.confidence * 100) + '%' : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed">
                        Confidence level of the ingredient detection.
                      </div>
                    </div>
                    <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4">
                      <div className="flex items-center gap-1.5 text-cyan-700 text-xs font-semibold uppercase tracking-wider mb-2">
                        <Sparkles className="w-3.5 h-3.5" /> Log Details
                      </div>
                      <div className="text-xs text-cyan-900 leading-relaxed mt-2">
                        <strong>Logged At:</strong><br/>
                        {new Date(logData.logged_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-orange-50/30 border border-brand-orange-light rounded-2xl p-4 mb-auto">
                    <div className="flex items-center gap-1.5 text-brand-orange text-xs font-semibold uppercase tracking-wider mb-2">
                      <AlertCircle className="w-3.5 h-3.5" /> Info
                    </div>
                    <p className="text-sm text-gray-700">
                      Your meal has been securely logged to the database. You can adjust the values here or save it.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={handleSave}
                      className="flex-1 bg-brand-orange hover:bg-brand-orange-dark text-white font-medium py-3.5 px-4 rounded-2xl transition-colors shadow-lg shadow-orange-200"
                    >
                      Confirm & View History
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="px-8 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-medium py-3.5 rounded-2xl transition-colors"
                    >
                      Discard
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
