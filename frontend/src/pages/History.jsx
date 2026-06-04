import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Trash2, Camera, Loader2, Search } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function History() {
  const { user, updateProfile } = useAuth();
  const [viewMode, setViewMode] = useState('Weekly');
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [bmiData, setBmiData] = useState([]);
  const [foodLogs, setFoodLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Widget state
  const [weightInput, setWeightInput] = useState(user?.weight_kg || '');
  const [heightInput, setHeightInput] = useState(user?.height_cm || '');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  // Food log editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ meal_name: '', calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Pagination & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const fetchFoodLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/food-logs?limit=100'); // Fetch enough logs for historical data chart
      setFoodLogs(res.data.data.data);
    } catch (err) {
      console.error('Failed to fetch food logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWeightHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/weight');
      const history = data.data;
      const heightM = (user?.height_cm || 170) / 100;
      
      const formatted = history.map(log => {
        const w = parseFloat(log.weight_kg);
        const bmi = parseFloat((w / (heightM * heightM)).toFixed(1));
        const date = new Date(log.logged_at);
        return {
          dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          bmi
        };
      });
      setBmiData(formatted);
    } catch (err) {
      console.error('Failed to fetch weight history', err);
    }
  }, [user?.height_cm]);

  useEffect(() => {
    fetchFoodLogs();
  }, [fetchFoodLogs]);

  useEffect(() => {
    if (user) fetchWeightHistory();
  }, [fetchWeightHistory, user]);

  useEffect(() => {
    setWeightInput(user?.weight_kg || '');
    setHeightInput(user?.height_cm || '');
  }, [user?.height_cm, user?.weight_kg]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    try {
      await api.delete(`/food-logs/${id}`);
      fetchFoodLogs();
    } catch (err) {
      console.error('Failed to delete log:', err);
    }
  };

  const handleEditClick = (log) => {
    setEditingId(log.id);
    setEditForm({
      meal_name: log.meal_name || '',
      calories: log.calories || 0,
      protein: log.protein || 0,
      carbs: log.carbs || 0,
      fat: log.fat || 0,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'meal_name' ? value : (value === '' ? '' : Number(value))
    }));
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.patch(`/food-logs/${id}`, editForm);
      setEditingId(null);
      fetchFoodLogs();
    } catch (err) {
      console.error('Failed to update log:', err);
      alert('Failed to update log');
    }
  };

  const handleManualLog = async (e) => {
    e.preventDefault();
    if (!weightInput || isNaN(weightInput) || !heightInput || isNaN(heightInput)) return;
    setIsSubmittingLog(true);
    try {
      const w = Number(weightInput);
      const h = Number(heightInput);
      await updateProfile({ weight_kg: w, height_cm: h });
      await api.post('/weight', { weight_kg: w });
      await fetchWeightHistory();
    } catch (err) {
      console.error('Failed to log measurements', err);
    } finally {
      setIsSubmittingLog(false);
    }
  };


  const isWeekly = viewMode === 'Weekly';
  
  // Date calculations based on REAL current time
  const now = new Date();
  let startDate = new Date(now);
  let daysInView = 7;
  let chartLabels = [];
  let dateRange = [];

  if (isWeekly) {
    startDate.setDate(now.getDate() + weekOffset * 7);
    const dayOfWeek = startDate.getDay(); // 0 is Sunday
    startDate.setDate(startDate.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dateRange.push(d);
    }
    chartLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  } else {
    startDate.setMonth(now.getMonth() + monthOffset);
    startDate.setDate(1); // 1st of the month
    startDate.setHours(0, 0, 0, 0);
    daysInView = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();

    for (let i = 0; i < daysInView; i++) {
      const d = new Date(startDate);
      d.setDate(1 + i);
      dateRange.push(d);
      chartLabels.push((i + 1) % 7 === 1 ? (i + 1).toString() : '');
    }
  }

  const getHeaderString = () => {
    const options = { month: 'short', day: 'numeric' };
    if (isWeekly) {
      const endDate = new Date(dateRange[6]);
      return `${dateRange[0].toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
    } else {
      return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  // --- Real Data Aggregation ---
  const GOALS = { cal: 2200, pro: 160, car: 250, fat: 70 };
  
  const dailySums = dateRange.map(date => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateString = `${yyyy}-${mm}-${dd}`;
    
    const dayLogs = foodLogs.filter(log => {
      const logDate = new Date(log.logged_at);
      const logYyyy = logDate.getFullYear();
      const logMm = String(logDate.getMonth() + 1).padStart(2, '0');
      const logDd = String(logDate.getDate()).padStart(2, '0');
      return `${logYyyy}-${logMm}-${logDd}` === dateString;
    });

    return dayLogs.reduce((acc, log) => ({
      cal: acc.cal + Number(log.calories || 0),
      pro: acc.pro + Number(log.protein || 0),
      car: acc.car + Number(log.carbs || 0),
      fat: acc.fat + Number(log.fat || 0)
    }), { cal: 0, pro: 0, car: 0, fat: 0 });
  });

  const calData = dailySums.map(sum => Math.min(100, (sum.cal / GOALS.cal) * 100));
  const proData = dailySums.map(sum => Math.min(100, (sum.pro / GOALS.pro) * 100));
  const carData = dailySums.map(sum => Math.min(100, (sum.car / GOALS.car) * 100));
  const fatData = dailySums.map(sum => Math.min(100, (sum.fat / GOALS.fat) * 100));

  const avgCal = Math.round(dailySums.reduce((acc, sum) => acc + sum.cal, 0) / daysInView);
  const avgPro = Math.round(dailySums.reduce((acc, sum) => acc + sum.pro, 0) / daysInView);
  const avgCar = Math.round(dailySums.reduce((acc, sum) => acc + sum.car, 0) / daysInView);
  const avgFat = Math.round(dailySums.reduce((acc, sum) => acc + sum.fat, 0) / daysInView);

  const labels = chartLabels;
  const barWidthClass = isWeekly ? 'w-8' : 'w-1.5';
  const barGapClass = isWeekly ? 'gap-3' : 'gap-1';
  
  const handlePrev = () => isWeekly ? setWeekOffset(prev => prev - 1) : setMonthOffset(prev => prev - 1);
  const handleNext = () => isWeekly ? setWeekOffset(prev => prev + 1) : setMonthOffset(prev => prev + 1);

  // --- Dynamic SVG Chart Logic ---
  let svgPath = '';
  let svgFill = '';
  let circles = [];
  let xLabels = [];

  if (bmiData.length > 0) {
    const bmis = bmiData.map(d => d.bmi);
    const minBmi = Math.max(0, Math.min(...bmis) - 2);
    const maxBmi = Math.max(...bmis) + 2;
    const range = maxBmi - minBmi || 1;
    const width = 1000;
    const height = 100;
    
    bmiData.forEach((d, i) => {
      const x = bmiData.length === 1 ? width / 2 : (i / (bmiData.length - 1)) * width;
      const y = height - 10 - ((d.bmi - minBmi) / range) * (height - 20);
      
      if (i === 0) svgPath += `M${x},${y} `;
      else svgPath += `L${x},${y} `;
      
      circles.push({ x, y, val: d.bmi });
      xLabels.push({ x, label: d.dateStr });
    });

    if (bmiData.length === 1) {
       svgPath = `M0,${circles[0].y} L${width},${circles[0].y}`;
       svgFill = `M0,${height} L0,${circles[0].y} L${width},${circles[0].y} L${width},${height} Z`;
    } else {
       svgFill = `${svgPath} L${width},${height} L0,${height} Z`;
    }
  }

  // --- Search and Pagination Logic ---
  const filteredLogs = foodLogs.filter(log => 
    (log.meal_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
              <div className="flex items-center gap-3 text-brand-orange font-medium w-64 justify-center">
                <button onClick={handlePrev} className="p-1 hover:bg-orange-50 rounded transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                <span className="w-40 text-center select-none">{getHeaderString()}</span>
                <button onClick={handleNext} className="p-1 hover:bg-orange-50 rounded transition-colors"><ChevronRight className="w-5 h-5" /></button>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-full">
                <button 
                  onClick={() => setViewMode('Weekly')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${isWeekly ? 'bg-white shadow-sm text-brand-orange' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => setViewMode('Monthly')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!isWeekly ? 'bg-white shadow-sm text-brand-orange' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Monthly
                </button>
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
                  Goal: <span className="text-green-500">2,200 Kcal</span> &nbsp;&nbsp; Avg: <span className="text-gray-900 font-bold">{avgCal} Kcal</span>
                </div>
              </div>
              <div className="relative h-40 flex items-end justify-between pl-2 pr-12">
                {/* Goal Line */}
                <div className="absolute w-full border-t border-dashed border-green-400 top-10 left-0 z-0"></div>
                <div className="absolute top-4 right-0 text-[10px] text-gray-400 font-bold uppercase tracking-wider">KCAL</div>
                
                {labels.map((label, i) => (
                  <div key={'cal' + i} className={`flex flex-col items-center ${barGapClass} z-10 ${barWidthClass}`}>
                    <div className="w-full h-32 bg-gray-100 rounded-full relative overflow-hidden group">
                      <div className={`absolute bottom-0 w-full rounded-full transition-all duration-700 ease-out ${calData[i] > 0 ? 'bg-brand-orange' : 'bg-gray-200'}`} style={{ height: `${calData[i]}%` }}></div>
                      <div className="absolute opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-[10px] rounded px-1.5 py-0.5 bottom-full mb-1 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-50">
                        {dailySums[i].cal} kcal
                      </div>
                    </div>
                    <span className={`text-gray-400 ${isWeekly ? 'text-xs' : 'text-[10px]'}`}>{label}</span>
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
                  Goal: <span className="text-green-500">160g</span> &nbsp;&nbsp; Avg: <span className="text-gray-900 font-bold">{avgPro}g</span>
                </div>
              </div>
              <div className="relative h-40 flex items-end justify-between pl-2 pr-12">
                <div className="absolute w-full border-t border-dashed border-green-400 top-12 left-0 z-0"></div>
                <div className="absolute top-4 right-0 text-[10px] text-gray-400 font-bold uppercase tracking-wider">GRAMS</div>
                
                {labels.map((label, i) => (
                  <div key={'pro' + i} className={`flex flex-col items-center ${barGapClass} z-10 ${barWidthClass}`}>
                    <div className="w-full h-32 bg-gray-100 rounded-full relative overflow-hidden group">
                      <div className={`absolute bottom-0 w-full rounded-full transition-all duration-700 ease-out ${proData[i] > 0 ? 'bg-blue-500' : 'bg-gray-200'}`} style={{ height: `${proData[i]}%` }}></div>
                      <div className="absolute opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-[10px] rounded px-1.5 py-0.5 bottom-full mb-1 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-50">
                        {dailySums[i].pro}g
                      </div>
                    </div>
                    <span className={`text-gray-400 ${isWeekly ? 'text-xs' : 'text-[10px]'}`}>{label}</span>
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
                  Goal: <span className="text-green-500">250g</span> &nbsp;&nbsp; Avg: <span className="text-gray-900 font-bold">{avgCar}g</span>
                </div>
              </div>
              <div className="relative h-40 flex items-end justify-between pl-2 pr-12">
                <div className="absolute w-full border-t border-dashed border-green-400 top-16 left-0 z-0"></div>
                <div className="absolute top-4 right-0 text-[10px] text-gray-400 font-bold uppercase tracking-wider">GRAMS</div>
                
                {labels.map((label, i) => (
                  <div key={'car' + i} className={`flex flex-col items-center ${barGapClass} z-10 ${barWidthClass}`}>
                    <div className="w-full h-32 bg-gray-100 rounded-full relative overflow-hidden group">
                      <div className={`absolute bottom-0 w-full rounded-full transition-all duration-700 ease-out ${carData[i] > 0 ? 'bg-yellow-500' : 'bg-gray-200'}`} style={{ height: `${carData[i]}%` }}></div>
                      <div className="absolute opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-[10px] rounded px-1.5 py-0.5 bottom-full mb-1 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-50">
                        {dailySums[i].car}g
                      </div>
                    </div>
                    <span className={`text-gray-400 ${isWeekly ? 'text-xs' : 'text-[10px]'}`}>{label}</span>
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
                  Goal: <span className="text-green-500">70g</span> &nbsp;&nbsp; Avg: <span className="text-gray-900 font-bold">{avgFat}g</span>
                </div>
              </div>
              <div className="relative h-40 flex items-end justify-between pl-2 pr-12">
                <div className="absolute w-full border-t border-dashed border-green-400 top-10 left-0 z-0"></div>
                <div className="absolute top-4 right-0 text-[10px] text-gray-400 font-bold uppercase tracking-wider">GRAMS</div>
                
                {labels.map((label, i) => (
                  <div key={'fat' + i} className={`flex flex-col items-center ${barGapClass} z-10 ${barWidthClass}`}>
                    <div className="w-full h-32 bg-gray-100 rounded-full relative overflow-hidden group">
                      <div className={`absolute bottom-0 w-full rounded-full transition-all duration-700 ease-out ${fatData[i] > 0 ? 'bg-purple-500' : 'bg-gray-200'}`} style={{ height: `${fatData[i]}%` }}></div>
                      <div className="absolute opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-[10px] rounded px-1.5 py-0.5 bottom-full mb-1 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-50">
                        {dailySums[i].fat}g
                      </div>
                    </div>
                    <span className={`text-gray-400 ${isWeekly ? 'text-xs' : 'text-[10px]'}`}>{label}</span>
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
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Current: <span className="text-gray-900 font-bold">{bmiData.length > 0 ? bmiData[bmiData.length - 1].bmi : (user?.weight_kg ? parseFloat((user.weight_kg / Math.pow((user.height_cm || 170) / 100, 2)).toFixed(1)) : '--')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-200"></span> Normal Range: <span className="text-gray-900 font-bold">18.5 - 24.9</span>
                </div>
              </div>
            </div>
            <div className="h-48 w-full -ml-4 mt-4">
              {bmiData.length > 0 ? (
                <div className="h-full w-full relative flex flex-col justify-end">
                  <div className="relative flex-1 w-full h-full block">
                    <svg viewBox="0 0 1000 100" className="w-full h-full absolute inset-0 preserve-3d" preserveAspectRatio="none">
                      <path d={svgFill} fill="rgba(16, 185, 129, 0.1)" />
                      {bmiData.length > 0 && <path d={svgPath} fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray={bmiData.length === 1 ? "15,15" : "none"} />}
                    </svg>
                    <div className="absolute inset-0 w-full h-full pointer-events-none">
                      {circles.map((c, i) => (
                        <div 
                          key={'point'+i} 
                          className="absolute group cursor-pointer pointer-events-auto"
                          style={{ 
                            left: `${(c.x / 1000) * 100}%`, 
                            top: `${(c.y / 100) * 100}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div className="w-2 h-2 group-hover:w-3 group-hover:h-3 bg-white border-[2px] border-emerald-500 rounded-full transition-all shadow-sm" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 font-bold text-xs bg-white px-2 py-0.5 rounded shadow-sm border border-emerald-100 pointer-events-none whitespace-nowrap">
                            {c.val}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-full flex justify-between px-2 text-[10px] text-gray-400 font-bold uppercase mt-2">
                    {xLabels.map((lbl, i) => (
                      <span key={'lbl'+i}>{lbl.label}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-2xl ml-4">
                  No weight history available. Log your weight to see your BMI trend.
                </div>
              )}
            </div>

            {/* Log Data Widget */}
            <div className="mt-8 bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">Update Measurements</h4>
                <p className="text-xs text-emerald-700/70 mt-1">Keep your BMI accurate by logging your latest data.</p>
              </div>
              <form onSubmit={handleManualLog} className="flex items-center gap-3">
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1" 
                    value={weightInput} 
                    onChange={e => setWeightInput(e.target.value)} 
                    placeholder="Weight" 
                    className="w-24 px-4 py-2 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-900 text-sm" 
                    required 
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-bold uppercase mt-0.5">kg</span>
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1" 
                    value={heightInput} 
                    onChange={e => setHeightInput(e.target.value)} 
                    placeholder="Height" 
                    className="w-24 px-4 py-2 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-900 text-sm" 
                    required 
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-bold uppercase mt-0.5">cm</span>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmittingLog}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {isSubmittingLog ? 'Saving...' : 'Save Log'}
                </button>
              </form>
            </div>

          </div>

          <hr className="border-gray-100 my-8" />

          {/* Recent Food Logs */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Food Logs</h3>
                <p className="text-xs text-gray-500">Your most recently tracked meals</p>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search meals..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange w-64"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
            
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] text-gray-400 font-bold tracking-wider uppercase border-b border-gray-100">
                  <th className="pb-3 font-medium">Meal</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Calories</th>
                  <th className="pb-3 font-medium">Macros (P/C/F)</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-orange" />
                      Loading logs...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 italic">No food logs found matching your search.</td>
                  </tr>
                ) : (
                  currentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-semibold text-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                          {log.image_url ? (
                            <img src={log.image_url} alt={log.meal_name} className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        {editingId === log.id ? (
                          <input 
                            type="text" 
                            name="meal_name"
                            value={editForm.meal_name} 
                            onChange={handleEditChange}
                            className="w-full border border-orange-200 rounded px-2 py-1 font-semibold text-gray-800 focus:outline-none focus:border-brand-orange" 
                          />
                        ) : (
                          <span className="truncate max-w-[150px]">{log.meal_name || 'Unknown Meal'}</span>
                        )}
                      </td>
                      <td className="py-4 text-gray-500">
                        {new Date(log.logged_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-4">
                        {editingId === log.id ? (
                          <div className="flex items-center gap-1">
                            <input type="number" name="calories" value={editForm.calories} onChange={handleEditChange} className="w-16 border border-orange-200 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:border-brand-orange" />
                          </div>
                        ) : (
                          <span className="text-brand-orange bg-orange-50 px-2 py-1 rounded font-medium text-xs">
                            {log.calories || 0} kcal
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-gray-500 font-medium">
                        {editingId === log.id ? (
                          <div className="flex items-center gap-1">
                            <input type="number" name="protein" value={editForm.protein} onChange={handleEditChange} className="w-12 border border-orange-200 rounded px-1 py-1 text-xs focus:outline-none focus:border-brand-orange" placeholder="P" />g / 
                            <input type="number" name="carbs" value={editForm.carbs} onChange={handleEditChange} className="w-12 border border-orange-200 rounded px-1 py-1 text-xs focus:outline-none focus:border-brand-orange" placeholder="C" />g / 
                            <input type="number" name="fat" value={editForm.fat} onChange={handleEditChange} className="w-12 border border-orange-200 rounded px-1 py-1 text-xs focus:outline-none focus:border-brand-orange" placeholder="F" />g
                          </div>
                        ) : (
                          <>{log.protein || 0}g / {log.carbs || 0}g / {log.fat || 0}g</>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        {editingId === log.id ? (
                          <>
                            <button onClick={() => handleSaveEdit(log.id)} className="px-3 py-1 bg-brand-orange text-white text-xs font-medium rounded hover:bg-brand-orange-dark transition-colors mr-2">Save</button>
                            <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded hover:bg-gray-200 transition-colors">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditClick(log)} className="p-1.5 text-gray-400 hover:text-brand-orange transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(log.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors ml-1"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 py-1 border rounded-md text-sm transition-colors ${currentPage === i + 1 ? 'bg-brand-orange border-brand-orange text-white font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
