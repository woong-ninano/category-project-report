
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  logoUrl: string;
  projectTitle: string;
  viewMode: 'MO' | 'PC';
  onViewModeChange: (mode: 'MO' | 'PC') => void;
}

const Header: React.FC<HeaderProps> = ({ logoUrl, projectTitle, viewMode, onViewModeChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 no-print ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Left: Logo Area */}
        <div 
          className="flex items-center cursor-pointer"
          onClick={scrollToTop}
          title="최상단으로 이동"
        >
          {!logoError ? (
            <img 
              src={logoUrl} 
              alt="현대해상 다이렉트" 
              className="h-7 md:h-8 object-contain transition-transform duration-300 hover:scale-105"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex items-center group">
              <span className="text-[#004a99] font-extrabold text-xl md:text-2xl tracking-tighter flex items-center">
                현대해상 <span className="text-[#ff6a00] ml-1.5">다이렉트</span>
              </span>
            </div>
          )}
        </div>

        {/* Right: Project Title & View Mode Switcher */}
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden lg:flex flex-col items-end">
            <span className={`text-sm lg:text-base font-bold transition-colors duration-500 ${isScrolled ? 'text-gray-900' : 'text-gray-800'}`}>
              {projectTitle}
            </span>
          </div>

          {/* MO/PC Toggle Switch */}
          <div className="flex items-center bg-gray-100 p-1 rounded-full shadow-inner">
            <button
              onClick={() => onViewModeChange('MO')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-tighter transition-all duration-300 ${
                viewMode === 'MO' 
                  ? 'bg-white text-[#004a99] shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              MO
            </button>
            <button
              onClick={() => onViewModeChange('PC')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-tighter transition-all duration-300 ${
                viewMode === 'PC' 
                  ? 'bg-white text-[#004a99] shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              PC
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
