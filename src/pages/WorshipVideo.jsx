import React from "react";

export default function WorshipVideo({ onNavigate }) {
  // 실제 목사님 유튜브 채널 ID나 영상 ID를 여기에 넣으시면 됩니다.
  const videoId = "your-video-id"; 

  return (
    <div className="min-h-screen bg-[#F9F7F2] py-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* 상단 헤더 */}
        <div className="mb-8 border-b-2 border-[#E9DCC9] pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-[#3a2e24] tracking-tighter font-serif">예배 영상</h1>
            <p className="text-[#8b5e3c] mt-2 italic font-serif">"신령과 진정으로 드리는 거룩한 예배"</p>
          </div>
          <button 
            onClick={() => onNavigate("Home")}
            className="text-sm text-[#C5A059] font-bold hover:underline"
          >
            홈으로 돌아가기
          </button>
        </div>

        {/* 메인 영상 플레이어 */}
        <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-[#E9DCC9] overflow-hidden mb-10">
          <div className="aspect-video w-full rounded-[1.5rem] overflow-hidden bg-black shadow-inner">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="주일예배 영상"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="mt-6 px-4 pb-4">
            <span className="text-[10px] bg-[#C5A059] text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest">Live Archive</span>
            <h2 className="text-2xl font-bold text-[#3a2e24] mt-3">2026년 4월 12일 주일 대예배</h2>
            <p className="text-[#8b5e3c] mt-1 font-serif text-sm">본문: 시편 119:105 | 설교: "내 길에 빛이 되는 말씀"</p>
          </div>
        </div>

        {/* 이전 영상 리스트 (심플 버전) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/60 p-4 rounded-3xl border border-[#E9DCC9] hover:shadow-lg transition-all cursor-pointer group">
              <div className="aspect-video bg-[#E9DCC9] rounded-xl mb-3 overflow-hidden flex items-center justify-center text-[#C5A059]">
                <span className="text-2xl opacity-50">▶</span>
              </div>
              <p className="text-[11px] text-[#C5A059] font-bold">2026.04.{12-i*7}</p>
              <h4 className="font-bold text-[#3a2e24] text-sm group-hover:text-[#C5A059] transition-colors">지난 주일예배 다시보기</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}