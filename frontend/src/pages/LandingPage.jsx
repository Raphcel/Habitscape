import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, TrendingUp, MessageSquare, Camera, Activity, BrainCircuit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LandingPage = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'features'];
      // Trigger a bit before the section reaches the exact top
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Call once to set initial state
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] font-sans overflow-x-hidden selection:bg-brand-orange/20 selection:text-brand-orange-dark">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <img src="/Habitscape logo.png" alt="Habitscape Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
              <span className="font-extrabold text-xl tracking-tight text-[#2D3134]">Habitscape</span>
            </div>
            <div className="hidden md:flex space-x-10 relative">
              <a 
                href="#home" 
                onClick={(e) => scrollToSection(e, 'home')}
                className={`text-sm font-bold pb-1 transition-all duration-300 relative ${activeSection === 'home' ? 'text-brand-orange' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {t('landing.home')}
                {activeSection === 'home' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-orange rounded-t-sm transition-all duration-300"></span>}
              </a>
              <a 
                href="#about" 
                onClick={(e) => scrollToSection(e, 'about')}
                className={`text-sm font-bold pb-1 transition-all duration-300 relative ${activeSection === 'about' ? 'text-brand-orange' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {t('landing.about')}
                {activeSection === 'about' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-orange rounded-t-sm transition-all duration-300"></span>}
              </a>
              <a 
                href="#features" 
                onClick={(e) => scrollToSection(e, 'features')}
                className={`text-sm font-bold pb-1 transition-all duration-300 relative ${activeSection === 'features' ? 'text-brand-orange' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {t('landing.features')}
                {activeSection === 'features' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-orange rounded-t-sm transition-all duration-300"></span>}
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="hidden md:block text-sm font-bold text-[#2D3134] hover:text-brand-orange transition-colors">{t('landing.login')}</Link>
              <Link to="/register" className="bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-md shadow-brand-orange/20 active:scale-95">
                {t('landing.register')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#2D3134] leading-[1.15] tracking-tight mb-6">
              {t('landing.heroTitle')} <br className="hidden sm:block" />
              <span className="text-brand-orange">{t('landing.heroHighlight')}</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {t('landing.heroBody')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/register" className="w-full sm:w-auto bg-[#326955] hover:bg-[#255241] text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-[#326955]/30 text-center active:scale-95">
                {t('landing.start')}
              </Link>
              <a href="#features" className="w-full sm:w-auto bg-[#DDE9CA] hover:bg-[#c9d8b3] text-[#326955] font-bold px-8 py-4 rounded-full transition-all text-center active:scale-95">
                {t('landing.learn')}
              </a>
            </div>
          </div>
          <div className="flex-1 relative w-full max-w-md lg:max-w-none">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#326955]/10 border-8 border-white/50 aspect-[4/3] lg:aspect-auto lg:h-[500px]">
              <img 
                src="/landing_hero_1777962449180.png" 
                alt="Taking photo of food" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-slow border border-gray-100">
              <div className="bg-[#DDE9CA] p-3 rounded-xl text-[#326955]">
                <Camera size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Nasi Pecel Komplit</p>
                <p className="text-lg font-extrabold text-brand-orange">~ 480 kcal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Point Section */}
      <section id="about" className="bg-[#326955] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-orange mb-6 tracking-tight">{t('landing.painTitle')}</h2>
          <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-16 leading-relaxed font-medium">
            {t('landing.painBody')}
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-[#E7F0D6] rounded-3xl p-8 transform hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-black/10">
              <div className="text-brand-orange mb-6 flex justify-center">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              <h3 className="text-[#2D3134] text-xl font-bold tracking-tight">{t('landing.autoEntry')}</h3>
            </div>
            <div className="bg-[#E7F0D6] rounded-3xl p-8 transform hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-black/10">
              <div className="text-[#326955] mb-6 flex justify-center">
                <Activity size={48} strokeWidth={2.5} />
              </div>
              <h3 className="text-[#2D3134] text-xl font-bold tracking-tight">{t('landing.antiSedentary')}</h3>
            </div>
            <div className="bg-[#E7F0D6] rounded-3xl p-8 transform hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-black/10">
              <div className="text-brand-orange mb-6 flex justify-center">
                <BrainCircuit size={48} strokeWidth={2.5} />
              </div>
              <h3 className="text-[#2D3134] text-xl font-bold tracking-tight">{t('landing.aiDriven')}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-orange mb-6 tracking-tight">{t('landing.techTitle')}</h2>
          <p className="text-gray-600 text-lg font-medium">{t('landing.techBody')}</p>
        </div>

        <div className="space-y-24">
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 order-2 md:order-1">
              <div className="w-16 h-16 bg-[#BBE2D6] rounded-2xl flex items-center justify-center mb-6 text-[#326955] shadow-sm">
                <Camera size={32} />
              </div>
              <h3 className="text-3xl font-bold text-[#2D3134] mb-4 tracking-tight">{t('landing.snapTitle')}</h3>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed font-medium">
                {t('landing.snapBody')}
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-[#2D3134] font-semibold"><CheckCircle2 className="text-brand-orange" size={24} /> {t('landing.snapPoint1')}</li>
                <li className="flex items-center gap-3 text-[#2D3134] font-semibold"><CheckCircle2 className="text-brand-orange" size={24} /> {t('landing.snapPoint2')}</li>
              </ul>
            </div>
            <div className="flex-1 order-1 md:order-2 w-full">
              <div className="bg-[#E7F0D6] p-8 rounded-[2.5rem] shadow-xl relative aspect-square md:aspect-auto md:h-[480px] flex items-center justify-center">
                <img src="/landing_hero_1777962449180.png" alt="Snap food UI" className="w-64 rounded-[2rem] shadow-2xl border-4 border-white/50 object-cover aspect-[9/16]" />
                {/* Floating UI Element */}
                <div className="absolute top-1/2 -left-8 md:-left-12 bg-white p-5 rounded-2xl shadow-xl w-48 border border-gray-100">
                  <p className="font-bold text-[#2D3134] text-sm mb-1">Nasi Goreng Spesial</p>
                  <p className="text-xs text-brand-orange font-semibold mb-3">{t('landing.accuracy')}</p>
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                    <span className="text-xs text-gray-500 font-bold">Kalori</span>
                    <span className="font-bold text-[#2D3134]">450 kcal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 w-full">
              <div className="bg-[#FFF1E8] p-8 rounded-[2.5rem] shadow-xl relative aspect-square md:aspect-auto md:h-[480px] flex items-center justify-center">
                <div className="bg-white w-full max-w-sm rounded-3xl shadow-lg p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-[#2D3134]">30-Day BMI Projection</h4>
                    <span className="bg-brand-orange text-white text-xs font-bold px-3 py-1.5 rounded-full">{t('landing.learn')}</span>
                  </div>
                  {/* Mock Chart */}
                  <div className="h-40 flex items-end gap-2 mb-6">
                    {[40, 50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-[#DDE9CA] rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
                    <div className="absolute top-1/3 right-8 bg-[#326955] text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg">
                      Next Week: 22.8
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#326955] rotate-45"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F8FAF5] p-3 rounded-xl border border-gray-50">
                      <p className="text-xs text-gray-500 font-bold mb-1">Average Steps</p>
                      <p className="font-bold text-[#326955] text-lg">8,432</p>
                    </div>
                    <div className="bg-[#F8FAF5] p-3 rounded-xl border border-gray-50">
                      <p className="text-xs text-gray-500 font-bold mb-1">Sleep Quality</p>
                      <p className="font-bold text-[#326955] text-lg">7j 20m</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="w-16 h-16 bg-[#DDE9CA] rounded-2xl flex items-center justify-center mb-6 text-[#326955] shadow-sm">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-3xl font-bold text-[#2D3134] mb-4 tracking-tight">{t('landing.bmiTitle')}</h3>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                {t('landing.bmiBody')}
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 order-2 md:order-1">
              <div className="w-16 h-16 bg-[#FFEDD5] rounded-2xl flex items-center justify-center mb-6 text-brand-orange shadow-sm">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-3xl font-bold text-[#2D3134] mb-4 tracking-tight">{t('landing.summaryTitle')}</h3>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                {t('landing.summaryBody')}
              </p>
            </div>
            <div className="flex-1 order-1 md:order-2 w-full">
              <div className="bg-[#E7F0D6] p-8 rounded-[2.5rem] shadow-xl relative aspect-square md:aspect-auto md:h-[480px] flex items-center justify-center">
                <div className="w-full max-w-sm space-y-4">
                  {/* Chat Bubbles */}
                  <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 max-w-[85%]">
                    <p className="text-sm text-[#2D3134] font-medium leading-relaxed">
                      Hai! 👋 Wah, hari ini kamu keren banget! Langkah kakimu tembus 10.200 langkah. Gara-gara jalan jauh pas ke stasiun ya?
                    </p>
                    <div className="flex gap-2 mt-3">
                      <span className="bg-[#DDE9CA] text-[#326955] text-xs font-bold px-2 py-1 rounded-md">🎯 Target Tercapai</span>
                    </div>
                  </div>
                  <div className="bg-[#326955] p-4 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%] ml-auto">
                    <p className="text-sm text-white font-medium leading-relaxed">
                      Iya nih! Tapi tadi agak khilaf makan martabak manis sepotong 😅
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 max-w-[85%]">
                    <p className="text-sm text-[#2D3134] font-medium leading-relaxed">
                      Hahaha santai aja! Sepotong martabak masih aman kok masuk budget kalorimu hari ini. Besok kurangi gula dikit aja pas ngopi pagi ya biar balance! ☕
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-orange py-24 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">{t('landing.ctaTitle')}</h2>
          <p className="text-white/90 text-lg md:text-xl mb-10 font-medium">
            {t('landing.ctaBody')}
          </p>
          <Link to="/register" className="inline-block bg-[#326955] hover:bg-[#255241] text-white font-bold text-lg px-10 py-5 rounded-full transition-transform hover:scale-105 shadow-xl shadow-[#326955]/30">
            {t('landing.cta')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F8FAF5] py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/Habitscape logo.png" alt="Habitscape Logo" className="w-7 h-7 object-contain opacity-90" />
            <span className="font-extrabold text-lg text-[#326955] tracking-tight">Habitscape</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-gray-500">
            <a href="#" className="hover:text-brand-orange transition-colors">{t('landing.privacy')}</a>
            <a href="#" className="hover:text-brand-orange transition-colors">{t('landing.terms')}</a>
            <a href="#" className="hover:text-brand-orange transition-colors">{t('landing.support')}</a>
          </div>
          <p className="text-sm text-gray-400 font-medium">
            {t('landing.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
