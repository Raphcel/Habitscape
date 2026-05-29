import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CustomSelect from '../components/CustomSelect';

export default function Profile() {
  const { user, updateProfile, loading, error, setError } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || 'Male',
    height_cm: user?.height_cm || '',
    weight_kg: user?.weight_kg || '',
    calorie_goal: user?.calorie_goal || '',
  });
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'name' || name === 'gender' ? value : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    const result = await updateProfile(formData);
    if (result.success) {
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <main className="flex-1 p-8 min-h-screen font-sans">
      <div className="max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Profile</h1>
          <p className="text-gray-500">Update your personal metrics to ensure accurate health tracking.</p>
        </header>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow" 
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                <input 
                  type="number" 
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <CustomSelect
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={['Male', 'Female']}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                <input 
                  type="number" 
                  name="height_cm"
                  value={formData.height_cm}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                <input 
                  type="number" 
                  name="weight_kg"
                  value={formData.weight_kg}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow" 
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Calorie Goal (kcal)</label>
              <input 
                type="number" 
                name="calorie_goal"
                value={formData.calorie_goal}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow" 
                required
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-orange-200 disabled:opacity-60"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
