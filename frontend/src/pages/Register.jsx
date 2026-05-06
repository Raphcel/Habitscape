import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { register, loading, error, setError } = useAuth();

  const clearErrors = () => {
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(name, email, password);
    if (result.success) {
      navigate('/app');
    } else if (result.errors) {
      setFieldErrors(result.errors);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex items-center justify-center p-4 font-sans">
      <div className="max-w-[1000px] w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row-reverse border border-gray-100">
        
        {/* Right Side - Illustration (Reversed for register) */}
        <div className="w-full md:w-1/2 relative bg-[#E1E4D4] min-h-[300px] md:min-h-full flex items-center justify-center p-8 overflow-hidden">
          <img 
            src="/login_illustration_1777962433031.png" 
            alt="Abstract geometric shapes" 
            className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-overlay"
            style={{ transform: 'scaleX(-1)' }}
          />
          <div className="relative z-10 glass-panel p-8 rounded-3xl text-center max-w-[320px] backdrop-blur-md bg-white/30 border border-white/40 shadow-2xl">
            <h2 className="text-3xl font-extrabold text-[#2D3134] mb-3 font-sans tracking-tight">Join the Movement</h2>
            <p className="text-[#2D3134]/80 text-sm font-medium leading-relaxed">Start your journey to a healthier lifestyle today.</p>
          </div>
        </div>

        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-[360px] mx-auto w-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Create an account</h1>
            <p className="text-gray-500 text-sm mb-8">Join Habitscape to start building better habits.</p>

            {/* API-level error banner */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name<span className="text-red-500 ml-1">*</span>
                </label>
                <input 
                  id="name"
                  type="text" 
                  placeholder="John Doe" 
                  className={`w-full px-4 py-3.5 rounded-xl border ${fieldErrors.name ? 'border-red-400' : 'border-gray-200'} focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-sm`}
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearErrors(); }}
                  autoComplete="name"
                  required
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.name[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address<span className="text-red-500 ml-1">*</span>
                </label>
                <input 
                  id="email"
                  type="email" 
                  placeholder="Write your email" 
                  className={`w-full px-4 py-3.5 rounded-xl border ${fieldErrors.email ? 'border-red-400' : 'border-gray-200'} focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-sm`}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
                  autoComplete="email"
                  required
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.email[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Min. 8 characters" 
                    className={`w-full px-4 py-3.5 rounded-xl border ${fieldErrors.password ? 'border-red-400' : 'border-gray-200'} focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-sm pr-12`}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
                    autoComplete="new-password"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.password[0]}</p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-orange/20 mt-4 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account…' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-8 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <span className="relative bg-white px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Or sign up with
              </span>
            </div>

            <div className="mt-6">
              <button type="button" className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3.5 rounded-xl transition-colors shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-orange hover:text-brand-orange-dark font-bold transition-colors">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
