
import React, { useEffect, useRef, useState } from 'react';
import { SectionData } from '../types';

const STATUS_BAR_URL = "https://i.ibb.co/HDBCBq6B/status-bar-iphone.png";

const InfoSection: React.FC<SectionData> = ({ items, viewMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [subImageIndices, setSubImageIndices] = useState<number[]>([]);

  // 드래그 상태 관리
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // items가 바뀔 때 subImageIndices 초기화
  useEffect(() => {
    setSubImageIndices(items.map(() => 0));
    setActiveItemIndex(0);
  }, [items]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || window.innerWidth < 768) return;
      
      const { top, height } = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (top <= 0 && Math.abs(top) < height - windowHeight) {
        const totalScrollableHeight = height - windowHeight;
        const progress = Math.abs(top) / totalScrollableHeight;
        
        const index = Math.min(
          Math.floor(progress * items.length),
          items.length - 1
        );
        
        if (index !== activeItemIndex) {
          setActiveItemIndex(index);
        }
      } else if (top > 0) {
        setActiveItemIndex(0);
      } else {
        setActiveItemIndex(items.length - 1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items.length, activeItemIndex]);

  const handlePrevSubImage = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setSubImageIndices(prev => {
      const next = [...prev];
      next[idx] = Math.max(0, next[idx] - 1);
      return next;
    });
    if (scrollContainerRefs.current[idx]) {
      scrollContainerRefs.current[idx]!.scrollTop = 0;
    }
  };

  const handleNextSubImage = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setSubImageIndices(prev => {
      const next = [...prev];
      const maxIdx = items[idx].images.length - 1;
      next[idx] = Math.min(maxIdx, next[idx] + 1);
      return next;
    });
    if (scrollContainerRefs.current[idx]) {
      scrollContainerRefs.current[idx]!.scrollTop = 0;
    }
  };

  const onMouseDown = (e: React.MouseEvent, idx: number) => {
    if (window.innerWidth < 768) return;
    const container = scrollContainerRefs.current[idx];
    if (!container) return;
    setIsDragging(true);
    setStartY(e.pageY - container.offsetTop);
    setScrollTop(container.scrollTop);
  };

  const onMouseMove = (e: React.MouseEvent, idx: number) => {
    if (!isDragging || window.innerWidth < 768) return;
    e.preventDefault();
    const container = scrollContainerRefs.current[idx];
    if (!container) return;
    const y = e.pageY - container.offsetTop;
    const walk = (y - startY) * 1.5;
    container.scrollTop = scrollTop - walk;
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full">
      {/* --- 인쇄 전용 레이아웃 --- */}
      <div className="hidden print:block w-full bg-white">
        {items.map((item, idx) => (
          <div key={idx} className="page-break flex flex-row items-center justify-between gap-16">
            <div className={`${viewMode === 'PC' ? 'w-[40%]' : 'w-1/2'} flex flex-col justify-center`}>
              <div className="text-[#004a99] font-black text-sm tracking-widest uppercase mb-4">
                {item.category || `Section ${(idx + 1).toString().padStart(2, '0')}`}
              </div>
              <h2 className={`${viewMode === 'PC' ? 'text-4xl' : 'text-5xl'} font-bold text-gray-900 leading-tight mb-8 whitespace-pre-line`}>           
                {item.title}
              </h2>
              <div className="w-16 h-[3px] bg-[#004a99] mb-8"></div>
              <p className={`${viewMode === 'PC' ? 'text-lg' : 'text-xl'} text-[#333333] leading-relaxed font-normal whitespace-pre-line`}>
                {item.description}
              </p>
            </div>

            <div className={`${viewMode === 'PC' ? 'w-[60%]' : 'w-1/2'} flex items-center justify-center`}>
              {viewMode === 'MO' ? (
                <div className="relative w-[300px] aspect-[1/2.1] bg-white rounded-[3rem] border-[8px] border-black overflow-hidden flex flex-col">
                  <div className="relative z-30 w-full shrink-0">
                    <img src={STATUS_BAR_URL} alt="status bar" className="w-full h-auto block bg-white" />
                  </div>
                  <div className="relative flex-1 w-full bg-gray-50 overflow-hidden">
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover object-top" />
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="bg-white rounded-xl border-[8px] border-[#333] aspect-[16/10] overflow-hidden">
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="w-20 h-5 bg-[#333] mx-auto"></div>
                  <div className="w-40 h-2 bg-[#333] rounded-full mx-auto"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- 웹 모바일 레이아웃 --- */}
      <div className="block md:hidden print:hidden bg-white w-full">
        {items.map((item, idx) => (
          <div key={idx} className="px-6 py-12 border-b border-gray-50 last:border-0 flex flex-col gap-8">
            <div className="w-full">
              <div className="text-[#004a99] font-black text-[10px] tracking-widest uppercase mb-2">
                {item.category || `Section ${(idx + 1).toString().padStart(2, '0')}`}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 leading-normal mb-4 whitespace-pre-line">           
                {item.title}
              </h2>
              <div className="w-8 h-[2px] bg-[#004a99] mb-4"></div>
              <p className="text-base text-[#666666] leading-relaxed font-normal whitespace-pre-line">
                {item.description}
              </p>
            </div>

            <div className="flex flex-col items-center w-full">
              {viewMode === 'MO' ? (
                <div className="relative w-full max-w-[260px] aspect-[1/2.1] bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border-[6px] border-black overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-b-2xl z-40"></div>
                  <div className="relative z-30 w-full shrink-0">
                    <img src={STATUS_BAR_URL} alt="status bar" className="w-full h-auto block bg-white" />
                  </div>
                  <div className="relative flex-1 w-full bg-gray-50 overflow-hidden">
                     {item.images.map((img, imgIdx) => (
                        <div key={imgIdx} className={`absolute inset-0 w-full transition-all duration-700 ${imgIdx === subImageIndices[idx] ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                          <img src={img} alt={`${item.title} ${imgIdx}`} className="w-full h-full object-cover object-top" />
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-[320px]">
                  <div className="bg-white rounded-lg border-[6px] border-[#333] shadow-lg aspect-[16/10] overflow-hidden relative">
                     {item.images.map((img, imgIdx) => (
                        <div key={imgIdx} className={`absolute inset-0 w-full transition-all duration-700 ${imgIdx === subImageIndices[idx] ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                          <img src={img} alt={`${item.title} ${imgIdx}`} className="w-full h-full object-cover object-top" />
                        </div>
                      ))}
                  </div>
                  <div className="w-10 h-3 bg-[#333] mx-auto"></div>
                  <div className="w-20 h-1.5 bg-[#333] rounded-full mx-auto"></div>
                </div>
              )}
              
              {item.images.length > 1 && (
                <div className="flex items-center gap-6 mt-6 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                  <button onClick={(e) => handlePrevSubImage(e, idx)} disabled={subImageIndices[idx] === 0} className="p-1 disabled:opacity-10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="text-[10px] font-bold text-gray-900">{subImageIndices[idx] + 1} / {item.images.length}</span>
                  <button onClick={(e) => handleNextSubImage(e, idx)} disabled={subImageIndices[idx] === item.images.length - 1} className="p-1 disabled:opacity-10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- 웹 데스크톱 레이아웃 --- */}
      <div 
        ref={containerRef}
        className="hidden md:block print:hidden relative w-full"
        style={{ height: `${items.length * 100}vh` }}
      >
        <div className="sticky top-0 h-screen w-full flex flex-row items-center justify-center gap-16 lg:gap-24 overflow-hidden max-w-7xl mx-auto px-12 md:px-16 lg:px-20">
          
          {/* Left: Text Area */}
          <div className="w-[360px] lg:w-[400px] shrink-0 flex items-center h-full">
            <div className="relative w-full">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={`transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) w-full ${
                    idx === activeItemIndex 
                      ? 'opacity-100 visible translate-y-0 relative z-10' 
                      : 'opacity-0 invisible absolute top-0 translate-y-12 z-0'
                  }`}
                >
                  <div className="text-[#004a99] font-black text-[10px] tracking-widest uppercase mb-4">
                    {item.category || `Section ${(idx + 1).toString().padStart(2, '0')}`}
                  </div>
                  <h2 className={`font-semibold !leading-tight text-gray-900 mb-6 whitespace-pre-line ${viewMode === 'PC' ? 'text-3xl lg:text-4xl' : 'text-4xl lg:text-5xl'}`}>
                    {item.title}
                  </h2>
                  <div className={`w-12 h-[3px] bg-[#004a99] mb-8 transition-all duration-700 ${idx === activeItemIndex ? 'w-12' : 'w-0'}`}></div>
                  <p className="text-lg lg:text-xl text-gray-800 leading-relaxed font-normal whitespace-pre-line">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Device Frame Area */}
          <div className="flex-1 flex flex-col items-center justify-center h-full transform translate-y-[70px] relative">
            {/* 우측 그라데이션 페이드 효과 */}
            <div className="absolute top-0 right-[-80px] w-[160px] h-full bg-gradient-to-l from-white via-white/50 to-transparent z-40 pointer-events-none"></div>

            <div className="flex flex-col items-center w-full max-w-[640px] lg:max-w-[760px]">
              {viewMode === 'MO' ? (
                /* Mobile Phone Frame */
                <div className="relative w-[280px] lg:w-[310px] aspect-[1/2.1] bg-white rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.08)] border-[8px] border-black overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-b-3xl z-50"></div>
                  <div className="relative z-40 w-full bg-white shrink-0">
                    <img src={STATUS_BAR_URL} alt="status bar" className="w-full h-auto block" draggable={false} />
                  </div>
                  <div className="relative flex-1 w-full bg-gray-50 overflow-hidden">
                    {items.map((item, itemIdx) => (
                      <div 
                        key={itemIdx}
                        ref={(el) => { if (itemIdx === activeItemIndex) scrollContainerRefs.current[itemIdx] = el; }}
                        onMouseDown={(e) => onMouseDown(e, itemIdx)}
                        onMouseLeave={() => setIsDragging(false)}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseMove={(e) => onMouseMove(e, itemIdx)}
                        className={`absolute inset-0 w-full h-full overflow-y-auto no-scrollbar transition-opacity duration-1000 ${itemIdx === activeItemIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                      >
                        <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                        <div className="relative w-full h-auto">
                          {item.images.map((img, imgIdx) => (
                            <img 
                              key={imgIdx} 
                              src={img} 
                              alt={`Screen ${itemIdx}-${imgIdx}`} 
                              className={`w-full h-auto block transition-opacity duration-700 ${imgIdx === subImageIndices[itemIdx] ? 'opacity-100 relative z-10' : 'opacity-0 absolute top-0 left-0 z-0'}`} 
                              draggable={false} 
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* PC Monitor Frame */
                <div className="w-full flex flex-col items-center group">
                  <div className="w-full bg-[#111] rounded-2xl p-1 shadow-[0_25px_80px_rgba(0,0,0,0.1)] border border-gray-800 transition-all duration-500">
                    <div className="w-full bg-white rounded-xl aspect-[16/10] overflow-hidden relative border border-black/5">
                       <div className="absolute top-0 left-0 w-full h-7 bg-gray-100/90 backdrop-blur-sm border-b border-gray-200 z-50 flex items-center px-4 gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-[#ff5f57]"></div>
                          <div className="w-2 h-2 rounded-full bg-[#febc2e]"></div>
                          <div className="w-2 h-2 rounded-full bg-[#28c840]"></div>
                       </div>
                       
                       <div className="pt-7 h-full w-full relative">
                          {items.map((item, itemIdx) => (
                            <div 
                              key={itemIdx}
                              ref={(el) => { if (itemIdx === activeItemIndex) scrollContainerRefs.current[itemIdx] = el; }}
                              onMouseDown={(e) => onMouseDown(e, itemIdx)}
                              onMouseLeave={() => setIsDragging(false)}
                              onMouseUp={() => setIsDragging(false)}
                              onMouseMove={(e) => onMouseMove(e, itemIdx)}
                              className={`absolute inset-0 w-full h-full overflow-y-auto no-scrollbar transition-opacity duration-1000 ${itemIdx === activeItemIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                            >
                               <div className="relative w-full h-auto">
                                 {item.images.map((img, imgIdx) => (
                                    <img 
                                      key={imgIdx} 
                                      src={img} 
                                      alt={`PC Screen ${itemIdx}-${imgIdx}`} 
                                      className={`w-full h-auto block transition-opacity duration-700 ${imgIdx === subImageIndices[itemIdx] ? 'opacity-100 relative z-10' : 'opacity-0 absolute top-0 left-0 z-0'}`} 
                                      draggable={false} 
                                    />
                                  ))}
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                  <div className="w-24 h-5 bg-[#222] -mt-1 relative z-0 shadow-inner"></div>
                  <div className="w-40 h-2 bg-[#333] rounded-full shadow-lg"></div>
                </div>
              )}

              <div className="flex items-center gap-6 mt-12 bg-white/60 px-5 py-2.5 rounded-full border border-gray-100 shadow-sm backdrop-blur-lg z-50">
                <button onClick={(e) => handlePrevSubImage(e, activeItemIndex)} disabled={subImageIndices[activeItemIndex] === 0} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-10 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="text-[11px] font-bold text-gray-900 tabular-nums tracking-widest">
                  <span className="text-[#004a99]">{subImageIndices[activeItemIndex] + 1}</span>
                  <span className="mx-2 text-gray-300">/</span>
                  <span className="text-gray-400">{items[activeItemIndex]?.images.length}</span>
                </div>
                <button onClick={(e) => handleNextSubImage(e, activeItemIndex)} disabled={subImageIndices[activeItemIndex] === (items[activeItemIndex]?.images.length - 1)} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-10 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
