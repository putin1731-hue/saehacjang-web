import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// --- Helper Functions ---
const formatTimeLeft = (ms) => {
  const diff = ms || 0;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
};

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [relayData, setRelayData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/relay/status');
        if (!response.ok) throw new Error('네트워크 응답 에러');
        const data = await response.json();
        setRelayData(data);
      } catch (e) {
        console.error("지휘부 서버 연결 실패:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !relayData) return <LoadingState />;

  const { hours, minutes } = formatTimeLeft(relayData.timeLeft);

  return (
    <div className="min-h-screen bg-[#F9F7F2] py-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* 1. Header Section */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black text-[#3a2e24] font-serif tracking-tighter">
            릴레이 사역 현황
          </h1>
          <p className="text-[#8b5e3c] mt-3 italic font-serif opacity-80">
            "한 사람의 진심이 온 공동체의 고백이 됩니다"
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. Main Status Card (Left/Center) */}
          <section className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-[#E9DCC9] p-10 relative overflow-hidden">
            <StatusBadge status={relayData.status} />

            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-28 h-28 bg-[#F9F7F2] rounded-full flex items-center justify-center border-2 border-[#C5A059] shadow-inner text-4xl">
                🖋️
              </div>
              <div className="text-center md:text-left">
                <p className="text-[#C5A059] text-[11px] font-black uppercase tracking-[0.2em] mb-2">Current Relay Runner</p>
                <h2 className="text-4xl font-black text-[#3a2e24] font-serif tracking-tight">
                  {relayData.currentRunner?.name || "주자 정보 없음"} 성도님
                </h2>
                <p className="text-[#8b5e3c] mt-2 font-medium opacity-70 italic">{relayData.currentRunner?.phone}</p>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-[#F9F7F2]">
              <InfoBox label="남은 은혜의 시간" value={`${hours}시간 ${minutes}분`} />
              <InfoBox 
                label="현재 필사 진행 상황" 
                value={`${relayData.currentBookName} ${relayData.currentChapterNum}장 ${relayData.currentVerseNum}절`}
                subText={`* 우리 공동체가 ${relayData.verseCount}구절을 함께 이어왔습니다.`}
                isSmallValue
              />
            </div>
          </section>

          {/* 3. Admin Notice Card (Right) */}
          <aside className="bg-[#3a2e24] rounded-[2.5rem] shadow-2xl p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/10 rounded-full -mr-16 -mt-16" />
            <div>
              <h3 className="text-xl font-serif font-bold text-[#C5A059] mb-8 flex items-center gap-2">
                🏛️ 행정부 공지
              </h3>
              <div className="space-y-6 text-sm font-serif opacity-90 leading-relaxed">
                <NoticeItem title="01. 중복 참여 제한" content="조열심 성도님은 현재 2개 팀 참여로 인해 추가 지목이 제한됩니다." />
                <NoticeItem title="02. 24시간 수락 원칙" content="지목 후 24시간 내 미수락 시 바통은 자동 회수(VOID) 처리됩니다." />
              </div>
            </div>
            
            <button 
              onClick={() => onNavigate('home')}
              className="mt-10 w-full py-4 rounded-full border border-[#C5A059] text-[#C5A059] text-[11px] font-black uppercase tracking-widest hover:bg-[#C5A059] hover:text-white transition-all duration-300"
            >
              Back to Sanctuary
            </button>
          </aside>
        </div>

        {/* 4. History Section */}
        <HistorySection />

      </div>
    </div>
  );
}

// --- Sub-Components for Clean Code ---

const LoadingState = () => (
  <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059] animate-pulse">
    성소의 기록을 불러오는 중입니다...
  </div>
);

const StatusBadge = ({ status }) => (
  <div className="absolute top-8 right-8">
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border 
      ${status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-[#FAF3F2] text-[#D29181] border-[#D29181] animate-pulse'}`}>
      {status === 'ACTIVE' ? '필사 진행 중' : '수락 대기 중'}
    </span>
  </div>
);

const InfoBox = ({ label, value, subText, isSmallValue }) => (
  <div className="bg-[#F9F7F2]/50 p-6 rounded-3xl border border-[#E9DCC9]/30">
    <p className="text-[10px] font-bold text-[#8b5e3c] uppercase mb-1">{label}</p>
    <p className={`${isSmallValue ? 'text-xl' : 'text-3xl'} font-serif text-[#3a2e24] font-bold`}>
      {value}
    </p>
    {subText && (
      <p className="text-[10px] text-[#C5A059] mt-2 font-medium italic opacity-80">{subText}</p>
    )}
  </div>
);

const NoticeItem = ({ title, content }) => (
  <p className="pb-4 border-b border-white/10">
    <span className="text-[#C5A059] font-bold block mb-1">{title}</span>
    {content}
  </p>
);

const HistorySection = () => (
  <section className="mt-10 bg-white rounded-[2.5rem] shadow-xl border border-[#E9DCC9] p-10">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-lg font-bold text-[#3a2e24] font-serif">🕊️ 사역 히스토리</h3>
      <span className="text-[10px] text-[#8b5e3c] font-black uppercase tracking-widest bg-[#F9F7F2] px-3 py-1 rounded-full">Record of Grace</span>
    </div>
    <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide">
      <HistoryStep icon="⛪" label="START" isDimmed />
      <Divider />
      <HistoryStep name="준혁" label="완료" isActive />
      <Divider isDashed />
      <HistoryStep name="NEXT" label="대기 중" isPending />
    </div>
  </section>
);

const HistoryStep = ({ icon, name, label, isDimmed, isActive, isPending }) => (
  <div className="flex-shrink-0 flex flex-col items-center">
    <div className={`flex items-center justify-center font-bold shadow-lg
      ${icon ? 'w-12 h-12 rounded-full border border-[#E9DCC9] bg-[#F9F7F2] text-xs' : 'w-14 h-14 rounded-full text-xs'}
      ${isDimmed ? 'opacity-50' : ''}
      ${isActive ? 'bg-[#C5A059] text-white' : ''}
      ${isPending ? 'border-2 border-dashed border-[#C5A059] text-[#C5A059] animate-pulse' : ''}
    `}>
      {icon || name}
    </div>
    <span className={`text-[10px] mt-2 font-bold ${isActive ? 'text-[#3a2e24] font-black' : 'text-[#8b5e3c]'}`}>
      {label}
    </span>
  </div>
);

const Divider = ({ isDashed }) => (
  <div className={`w-12 h-[1px] ${isDashed ? 'border-t-2 border-dashed border-[#C5A059]' : 'bg-[#E9DCC9]'}`} />
);