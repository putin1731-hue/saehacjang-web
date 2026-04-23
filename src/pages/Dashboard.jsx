import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";

export default function Dashboard({ onNavigate }) {
  const [relayStatus, setRelayStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 현재 로그인한 성도 정보 가져오기
  const currentUser = authService.getCurrentUser();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 🚀 서버로부터 중앙 필사 상태 로드 (/api/relay/status)
      const res = await fetch('/api/relay/status');
      if (res.ok) {
        const relay = await res.json();
        
        // ⭐ 서버의 실시간 데이터(책 이름, 장, 절, 누적 수)를 상태에 저장
        setRelayStatus({
          ...relay,
          displayVerseCount: relay.totalVerseCount || 0 
        });
      } else {
        // 서버 연결 실패 시 기본값 (안전장치)
        setRelayStatus({
          currentBookName: "창세기",
          currentChapterNum: 1,
          currentVerseNum: 1,
          currentRunner: { name: "확인 중" },
          displayVerseCount: 0
        });
      }
    } catch (e) {
      console.error("데이터 로드 오류:", e);
    } finally {
      // 부드러운 화면 전환을 위한 지연
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ⭐ [권한 체크] 로그인한 성도와 현재 주자의 이름이 같은지 확인 (버튼 활성화용)
  const isMyTurn = relayStatus?.currentRunner?.name === currentUser?.name;

  if (loading) return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="animate-pulse tracking-widest uppercase text-xs font-bold font-sans">사역 현황 동기화 중...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* 헤더 섹션 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-[#5d4037] p-8 rounded-[2rem] text-white shadow-2xl gap-4">
          <div>
            <h1 className="text-3xl font-black font-serif tracking-tight">🕊️ 나의 사역 현황</h1>
            <p className="text-[#C5A059] mt-2 font-medium opacity-90">
              {currentUser?.name} 성도님, 오늘 함께할 말씀의 여정입니다.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <span className="bg-[#C5A059] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
              Saehakjang Member
            </span>
            <button onClick={fetchDashboardData} className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1 active:scale-95">
              🔄 실시간 데이터 갱신
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* [좌측] 독려 카드 */}
          <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-left duration-700">
            <div className="w-20 h-20 bg-[#F9F7F2] rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
              {isMyTurn ? "✍️" : "🌿"}
            </div>
            <h3 className="text-2xl font-bold text-[#3a2e24] mb-4 font-serif italic">
              {isMyTurn ? "성도님의 필사 순서입니다!" : "말씀 안에 거하는 평안"}
            </h3>
            <p className="text-gray-500 leading-relaxed max-w-xs text-sm whitespace-pre-line">
              {isMyTurn 
                ? "준비된 말씀을 정성껏 기록하여\n공동체에 은혜의 향기를 나누어 주세요."
                : "우리 새학장 공동체가 지금\n말씀을 써 내려가고 있습니다.\n함께 기도로 응원해 주세요!"}
            </p>

            <div className="mt-8">
              {isMyTurn ? (
                <button 
                  onClick={() => onNavigate("bible")}
                  className="px-10 py-3.5 bg-[#C5A059] text-white rounded-full font-bold text-sm shadow-lg hover:bg-[#A68648] transition-all transform active:scale-95"
                >
                  필사 시작하기 ➔
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <button 
                    disabled
                    className="px-10 py-3.5 bg-gray-100 text-gray-400 rounded-full font-bold text-sm cursor-not-allowed border border-gray-200"
                  >
                    다음 차례를 기다리는 중
                  </button>
                  <p className="text-[10px] text-[#c8923a] font-medium bg-[#fdf8f2] px-3 py-1 rounded-full border border-[#c8923a]/20">
                    현재 주자: [{relayStatus?.currentRunner?.name || "확인 중"}] 성도님
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* [우측] 실시간 현황 카드 (전체 성도 공통 데이터) */}
          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-100 animate-in fade-in slide-in-from-right duration-700">
            <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
              <h3 className="text-xl font-bold text-[#3a2e24] font-serif">📖 필사 사역 전체 현황</h3>
              <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded ${isMyTurn ? "bg-green-100 text-green-600 animate-pulse" : "bg-[#F9F7F2] text-[#C5A059]"}`}>
                {isMyTurn ? "Your Turn" : "Live Status"}
              </span>
            </div>
            
            {relayStatus ? (
              <div className="space-y-6">
                <div className="p-6 bg-[#F9F7F2] rounded-3xl border-l-4 border-[#C5A059] shadow-sm">
                  <p className="text-[10px] font-bold text-[#8b5e3c] uppercase mb-1 tracking-widest">교회가 함께 쓰는 구절</p>
                  <p className="text-2xl font-serif font-bold text-[#3a2e24] leading-tight">
                    {relayStatus.currentBookName} {relayStatus.currentChapterNum}장 {relayStatus.currentVerseNum}절
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm font-sans">
                  <div className={`p-5 rounded-2xl border transition-all ${isMyTurn ? "bg-green-50 border-green-100 shadow-sm" : "bg-white border-gray-100"}`}>
                    <p className="text-gray-400 mb-1 text-[10px] font-bold uppercase tracking-tighter font-sans">진행 주자</p>
                    <p className={`font-bold ${isMyTurn ? "text-green-700" : "text-[#3a2e24]"}`}>
                      {relayStatus.currentRunner?.name} {isMyTurn && "(나)"}
                    </p>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-gray-100">
                    <p className="text-gray-400 mb-1 text-[10px] font-bold uppercase tracking-tighter font-sans">누적 필사 구절</p>
                    <p className="font-bold text-[#3a2e24]">{relayStatus.displayVerseCount} 절</p>
                  </div>
                </div>

                <div className="mt-6 p-5 bg-[#fdf8f2] rounded-2xl text-center border border-[#f5e6d3]">
                  <p className="text-[11px] text-[#8b5e3c] font-medium leading-relaxed italic">
                    "주의 말씀은 내 입에 어찌 그리 단지요 <br/>내 입에 꿀보다 더 다니이다" (시 119:103)
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-gray-300 text-sm italic">사역 데이터를 불러올 수 없습니다.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}