import { useState, useEffect, useRef, useCallback } from "react";
import { SLIDES } from "../components/slides/SlideScenes";
import { worshipSchedule } from "../data/mockData";

export default function Home({ onNavigate, currentUser = null }) {
  const [cur, setCur] = useState(0);
  const timerRef = useRef(null);

  const goSlide = useCallback((n) => {
    setCur(n);
  }, []);

  // 슬라이드 자동 재생 (20초 간격)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCur((c) => (c + 1) % SLIDES.length);
    }, 20000);
    return () => clearInterval(timerRef.current);
  }, []);

  // 예배 안내 카드 컴포넌트 (디자인 복구)
  const WorshipCard = ({ item }) => (
    <div className="rounded-[14px] p-[1.6rem_1.4rem] border border-[#e9dcc9] bg-white transition-all hover:-translate-y-1 hover:shadow-md group">
      <p className="text-sm text-gray-500">{item.label}</p>
      <p className="text-lg font-bold text-[#764d03] group-hover:text-[#8b5e3c] transition-colors">{item.time}</p>
      <p className="text-xs text-gray-500">{item.sub}</p>
    </div>
  );

  return (
    <div className="bg-[#fdf8f2] font-sans">

      {/* HERO SECTION */}
      <section className="relative h-screen overflow-hidden">
        {SLIDES.map(({ Scene, caption }, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[1800ms]"
            style={{ opacity: cur === i ? 1 : 0 }}
          >
            <div className="w-full h-full">
              <Scene />
            </div>
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-10">
              <h2 className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-medium text-[#3a2e24] shadow-sm border border-white/50">
                {caption}
              </h2>
            </div>
          </div>
        ))}

        {/* [복구] 왼쪽 날개: 말씀 카드 */}
        <div className="fixed left-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col z-50">
          <div className="group bg-white/20 backdrop-blur-md border-r border-y border-white/40 p-4 rounded-r-3xl shadow-2xl w-14 hover:w-80 transition-all duration-700 ease-in-out overflow-hidden cursor-default">
            <div className="flex items-center gap-5 whitespace-nowrap">
              <div className="min-w-[24px] text-2xl drop-shadow-sm ml-1">📜</div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <p className="text-[10px] uppercase tracking-widest text-[#c8923a] font-black mb-1">Weekly Word</p>
                <p className="text-sm text-[#3a2e24] font-serif leading-tight italic">
                  "나의 평안을 너희에게 주노라<br/>내가 주는 것은 세상과 같지 아니하니라"
                </p>
                <p className="text-[10px] text-[#8b5e3c] mt-2 font-bold">— 요한복음 14:27</p>
              </div>
            </div>
          </div>
        </div>

        {/* [복구 및 수정] 오른쪽 날개: 교회 소식 및 신청 */}
        <div className="fixed right-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 z-50">
          
          {/* 1. 시즌 배너 (애니메이션 효과 복구) */}
          <div className="bg-gradient-to-br from-white/95 to-[#fff5f5]/95 backdrop-blur-sm p-4 rounded-l-[20px] shadow-xl border-l border-y border-white/60 w-40 transition-all hover:-translate-x-3 hover:shadow-2xl group cursor-pointer">
            <span className="text-[8px] bg-[#d29181] text-white px-2 py-0.5 rounded-full font-black tracking-tighter uppercase">Family Month</span>
            <h3 className="mt-2 font-bold text-[#5d4037] text-xs leading-tight group-hover:text-[#d29181] transition-colors">가정의 달 감사 예배</h3>
            <p className="text-[10px] text-[#8b5e3c] mt-1 opacity-80 font-medium">5.10 | 시온 동산</p>
          </div>

          {/* 2. 핵심 사역 배너 (currentUser 안전 처리 적용) */}
          <div className="bg-[#3a2e24] p-4 rounded-l-[20px] shadow-xl border-l border-y border-white/10 w-40 transition-all hover:-translate-x-4 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)]">
            <h3 className="font-bold text-white text-xs">말씀의 숲, 필사 참여</h3>
            <p className="text-[10px] text-white/60 mt-0.5">
              {currentUser ? `${currentUser.name} 성도님 동행 중` : "현재 15팀 동행 중"}
            </p>
            <button 
              onClick={() => onNavigate('Dashboard')} 
              className={`mt-3 w-full py-2 text-[10px] rounded-lg font-bold transition-all shadow-md active:scale-95 
                ${currentUser 
                  ? "bg-white text-[#3a2e24] hover:bg-[#c8923a] hover:text-white" 
                  : "bg-[#c8923a] text-white hover:bg-white hover:text-[#3a2e24]"}`}
            >
              {currentUser ? "이어가기 ➔" : "참여하기 ➔"}
            </button>
          </div>

          {/* 3. 새가족 등록 배너 (디자인 복구) */}
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-l-[20px] shadow-lg border-l border-y border-[#e9dcc9] w-40 transition-all hover:-translate-x-3 hover:shadow-xl group cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs">🌿</span>
              <span className="text-[9px] text-[#c8923a] font-bold tracking-widest uppercase">Welcome</span>
            </div>
            <h3 className="font-bold text-[#3a2e24] text-xs leading-tight">처음 오셨나요?</h3>
            <p className="text-[9px] text-gray-500 mt-1 leading-tight">새학장 공동체의 가족이 되는 길을 안내합니다.</p>
            <button 
              onClick={() => onNavigate('signup')} 
              className="mt-2 text-[9px] text-[#c8923a] font-bold border-b border-[#c8923a] pb-0.5"
            >
              새가족 등록 안내 ➔
            </button>
          </div>
        </div>

        {/* [복구] 중앙 메인 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pb-60 pointer-events-none">
          <h1 className="text-6xl font-black text-[#764d03] tracking-tighter font-sans drop-shadow-sm leading-none">
            새학장 교회
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <div className="w-6 h-[0.5px] bg-[#c8923a] opacity-60"></div>
            <p className="text-lg text-[#c8923a] font-light tracking-[0.25em] uppercase font-sans leading-none">
              Sae HaCjang Church
            </p>
            <div className="w-6 h-[0.5px] bg-[#c8923a] opacity-60"></div>
          </div>
        </div>

        {/* [복구] 하단 인디케이터 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goSlide(i)}
              className={`transition-all duration-500 ${
                cur === i ? "w-8 h-2 bg-[#c8923a] rounded-full" : "w-2 h-2 bg-white/50 hover:bg-white rounded-full"
              }`}
            />
          ))}
        </div>

        {/* [복구] 우측 수직 슬라이드 바 */}
        <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden sm:flex flex-col gap-3 z-20">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goSlide(i)}
              className={`w-0.5 transition-all duration-700 ${
                cur === i ? "h-10 bg-[#c8923a]" : "h-4 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </section>

      {/* 예배 안내 섹션 (복구) */}
      <section className="bg-[#f9f2e8] py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#e9dcc9] to-transparent"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-bold text-[#3a2e24] font-serif">예배 안내</h2>
            <div className="flex-1 h-px bg-[#e9dcc9]"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {worshipSchedule.map((item) => (
              <WorshipCard key={item.label} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a1612] text-white/40 py-16 text-center border-t border-white/5">
        <p className="text-xs tracking-widest font-light">© 2026 SAE HAKJANG CHURCH. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
    
  );
}