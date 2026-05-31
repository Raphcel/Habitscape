import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomSelect from '../components/CustomSelect';

export default function Onboarding() {
  const { user, updateProfile, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: user?.age || 24,
    gender: user?.gender || 'Male',
    height_cm: user?.height_cm || 170,
    weight_kg: user?.weight_kg || 65,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'gender' ? value : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result.success) {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100 p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Complete Profile</h1>
          <p className="text-gray-500 text-sm">Let's set up your baseline for precise health tracking.</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
              <input 
                type="number" 
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
              <CustomSelect
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={['Male', 'Female']}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Height (cm)</label>
            <input 
              type="number" 
              name="height_cm"
              value={formData.height_cm}
              onChange={handleChange}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight (kg)</label>
            <input 
              type="number" 
              name="weight_kg"
              value={formData.weight_kg}
              onChange={handleChange}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-sm"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-orange/20 mt-4 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
