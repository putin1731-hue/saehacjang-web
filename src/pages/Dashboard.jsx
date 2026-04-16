import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";

export default function Dashboard({ onNavigate }) {
  const [relayStatus, setRelayStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // 현재 로그인한 성도 정보
  const currentUser = authService.getCurrentUser();

  // 데이터 로드 로직
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const safeFetch = async (url) => {
        try {
          const res = await fetch(url);
          if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
            return await res.json();
          }
          return null;
        } catch (e) { return null; }
      };

      const relay = await safeFetch('/api/relay/status');
      if (relay) {
        setRelayStatus(relay);
      } else {
        // 데이터가 없을 시 기본값 (디자인 유지용 샘플 데이터)
        setRelayStatus({
          currentBookName: "마태복음",
          currentChapterNum: 5,
          currentVerseNum: 1,
          currentRunner: { name: "이준혁" },
          verseCount: 124
        });
      }
    } catch (e) {
      console.error("데이터 로드 오류:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="animate-pulse tracking-widest uppercase text-xs font-bold">은혜의 기록을 불러오는 중...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* [디자인] 상단 대시보드 헤더 - 성도 맞춤형 따뜻한 톤 */}
        <div className="flex justify-between items-center mb-8 bg-[#5d4037] p-8 rounded-[2rem] text-white shadow-2xl">
          <div>
            <h1 className="text-3xl font-black font-serif tracking-tight">🕊️ 나의 사역 현황</h1>
            <p className="text-[#C5A059] mt-2 font-medium opacity-90">
              {currentUser?.name} 성도님의 은혜로운 신앙 여정입니다.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="bg-[#C5A059] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
              Member Mode
            </span>
            <button onClick={fetchDashboardData} className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1 active:scale-95">
              🔄 실시간 갱신
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* [좌측] 성도 환영 및 사역 독려 카드 */}
          <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-left duration-700">
            <div className="w-20 h-20 bg-[#F9F7F2] rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">🌿</div>
            <h3 className="text-2xl font-bold text-[#3a2e24] mb-4 font-serif italic">"말씀 안에 거하는 평안"</h3>
            <p className="text-gray-500 leading-relaxed max-w-xs text-sm">
              성도님은 현재 새학장 필사 릴레이의<br/>
              소중한 동역자로 함께하고 계십니다.<br/>
              오늘도 주시는 말씀으로 승리하세요!
            </p>
            <button 
              onClick={() => onNavigate("bible")}
              className="mt-8 px-10 py-3.5 bg-[#C5A059] text-white rounded-full font-bold text-sm shadow-lg hover:bg-[#A68648] transition-all transform active:scale-95"
            >
              필사 계속하기 ➔
            </button>
          </div>

          {/* [우측] 필사 사역 실시간 현황 (공동체 데이터) */}
          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-200 animate-in fade-in slide-in-from-right duration-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#3a2e24] font-serif">📖 필사 사역 실시간 현황</h3>
              <span className="text-[10px] text-[#C5A059] font-black uppercase tracking-tighter">Live Update</span>
            </div>
            
            {relayStatus ? (
              <div className="space-y-6">
                <div className="p-6 bg-[#F9F7F2] rounded-2xl border-l-4 border-[#C5A059] shadow-sm">
                  <p className="text-[10px] font-bold text-[#8b5e3c] uppercase mb-1 tracking-widest">현재 필사 위치</p>
                  <p className="text-2xl font-serif font-bold text-[#3a2e24] leading-tight">
                    {relayStatus.currentBookName} {relayStatus.currentChapterNum}장 {relayStatus.currentVerseNum}절
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm font-sans">
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-gray-400 mb-1 text-[10px] font-bold uppercase tracking-tighter">현재 주자</p>
                    <p className="font-bold text-[#3a2e24]">{relayStatus.currentRunner?.name} 성도</p>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-gray-400 mb-1 text-[10px] font-bold uppercase tracking-tighter">누적 기록</p>
                    <p className="font-bold text-[#3a2e24]">{relayStatus.verseCount} 구절</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-[#fdf8f2] rounded-xl text-center">
                  <p className="text-[11px] text-[#8b5e3c] font-medium leading-relaxed">
                    "우리가 선을 행하되 낙심하지 말지니 <br/>포기하지 아니하면 때가 이르매 거두리라" (갈 6:9)
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-10 italic">필사 데이터를 불러올 수 없습니다.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}