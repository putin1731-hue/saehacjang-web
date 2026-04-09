import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [relayData, setRelayData] = useState(null);
  const [loading, setLoading] = useState(true);

  // [기술부 핵심: 실시간 동기화 엔진]
  // 서버로부터 현재 주자, 남은 시간, 릴레이 상태를 30초마다 자동 갱신합니다.
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/relay/status');
        const data = await res.json();
        setRelayData(data);
      } catch (e) {
        console.error("지휘부 서버 연결 실패: 실시간 데이터를 가져올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // 실시간 감시 유지
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059] animate-pulse">
      성소의 최신 기록을 동기화 중입니다...
    </div>
  );

  // [기술부: 정밀 시간 계산 로직]
  const calculateTime = () => {
    const diff = relayData.timeLeft;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  const { hours, minutes } = calculateTime();

  return (
    <div className="min-h-screen bg-[#F9F7F2] py-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* [디자인부] 상단 헤더 섹션 */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black text-[#3a2e24] font-serif tracking-tighter">릴레이 사역 현황</h1>
          <p className="text-[#8b5e3c] mt-3 italic font-serif opacity-80">"한 사람의 진심이 온 공동체의 고백이 됩니다"</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. [기능 통합] 실시간 주자 관제 카드 */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-[#E9DCC9] p-10 relative overflow-hidden">
            {/* 상태 표시 등 (ACTIVE / PENDING / VOID) */}
            <div className="absolute top-8 right-8">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border 
                ${relayData.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-[#FAF3F2] text-[#D29181] border-[#D29181] animate-pulse'}`}>
                {relayData.status === 'ACTIVE' ? '필사 진행 중' : '수락 대기 중'}
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-28 h-28 bg-[#F9F7F2] rounded-full flex items-center justify-center border-2 border-[#C5A059] shadow-inner text-4xl">
                🖋️
              </div>
              <div className="text-center md:text-left">
                <p className="text-[#C5A059] text-[11px] font-black uppercase tracking-[0.2em] mb-2">Current Relay Runner</p>
                <h2 className="text-4xl font-black text-[#3a2e24] font-serif tracking-tight">
                  {relayData.currentRunner?.name} 성도님
                </h2>
                <p className="text-[#8b5e3c] mt-2 font-medium opacity-70 italic">{relayData.currentRunner?.phone}</p>
              </div>
            </div>

            {/* [기능 통합] 카운트다운 및 진도율 지표 */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-[#F9F7F2]">
              <div className="bg-[#F9F7F2]/50 p-6 rounded-3xl border border-[#E9DCC9]/30">
                <p className="text-[10px] font-bold text-[#8b5e3c] uppercase mb-1">남은 은혜의 시간</p>
                <p className="text-3xl font-serif text-[#3a2e24] font-bold">
                  {hours}시간 {minutes}분
                </p>
              </div>
              <div className="bg-[#F9F7F2]/50 p-6 rounded-3xl border border-[#E9DCC9]/30">
                <p className="text-[10px] font-bold text-[#8b5e3c] uppercase mb-1">현재 절수(Verse)</p>
                <p className="text-3xl font-serif text-[#3a2e24] font-bold">
                  {relayData.verseCount} 구절 작성 중
                </p>
              </div>
            </div>
          </div>

          {/* 2. [행정 규칙] 실시간 정책 공지 영역 */}
          <div className="bg-[#3a2e24] rounded-[2.5rem] shadow-2xl p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/10 rounded-full -mr-16 -mt-16"></div>
            <div>
              <h3 className="text-xl font-serif font-bold text-[#C5A059] mb-8 flex items-center gap-2">
                🏛️ 행정부 공지
              </h3>
              <div className="space-y-6 text-sm font-serif opacity-90 leading-relaxed">
                <p className="pb-4 border-b border-white/10">
                  <span className="text-[#C5A059] font-bold block mb-1">01. 중복 참여 제한</span>
                  조열심 성도님은 현재 2개 팀 참여로 인해 추가 지목이 제한됩니다.
                </p>
                <p className="pb-4 border-b border-white/10">
                  <span className="text-[#C5A059] font-bold block mb-1">02. 24시간 수락 원칙</span>
                  지목 후 24시간 내 미수락 시 바통은 자동 회수(VOID) 처리됩니다.
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => onNavigate('home')}
              className="mt-10 w-full py-4 rounded-full border border-[#C5A059] text-[#C5A059] text-[11px] font-black uppercase tracking-widest hover:bg-[#C5A059] hover:text-white transition-all duration-300"
            >
              Back to Sanctuary
            </button>
          </div>
        </div>

        {/* 3. [UX 확장] 말씀의 여정 (Relay History) */}
        <div className="mt-10 bg-white rounded-[2.5rem] shadow-xl border border-[#E9DCC9] p-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#3a2e24] font-serif">🕊️ 사역 히스토리</h3>
            <span className="text-[10px] text-[#8b5e3c] font-black uppercase tracking-widest bg-[#F9F7F2] px-3 py-1 rounded-full">Record of Grace</span>
          </div>
          
          <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border border-[#E9DCC9] bg-[#F9F7F2] flex items-center justify-center text-xs opacity-50">⛪</div>
              <span className="text-[10px] mt-2 font-bold text-[#8b5e3c]">START</span>
            </div>
            <div className="w-12 h-[1px] bg-[#E9DCC9]"></div>
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-[#C5A059] flex items-center justify-center text-white text-xs font-bold shadow-lg">준혁</div>
              <span className="text-[10px] mt-2 font-black text-[#3a2e24]">완료</span>
            </div>
            <div className="w-12 h-[1px] border-t-2 border-dashed border-[#C5A059]"></div>
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#C5A059] flex items-center justify-center text-[#C5A059] text-xs font-bold animate-pulse">NEXT</div>
              <span className="text-[10px] mt-2 font-bold text-[#C5A059]">대기 중</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}