import React from "react";

export default function Bulletin({ onNavigate }) {
  return (
    <div className="min-h-screen bg-[#F9F7F2] py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* 상단 헤더 */}
        <div className="mb-8 border-b-2 border-[#E9DCC9] pb-6 text-center">
          <h1 className="text-3xl font-black text-[#3a2e24] tracking-tighter font-serif">온라인 주보</h1>
          <p className="text-[#C5A059] mt-2 font-bold tracking-widest text-xs uppercase">Sae Hakjang Church Bulletin</p>
        </div>

        {/* 주보 컨텐츠 박스 */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-[#E9DCC9] overflow-hidden relative">
          {/* 주보 상단 장식 */}
          <div className="h-3 bg-[#C5A059] w-full"></div>
          
          <div className="p-8 md:p-16 text-center">
            <div className="mb-10">
              <span className="text-[#8b5e3c] font-serif italic border-b border-[#E9DCC9] pb-2 px-4">2026년 4월 12일</span>
              <h2 className="text-4xl font-black text-[#3a2e24] mt-6 font-serif tracking-widest">주 보</h2>
            </div>

            {/* 실제 주보 내용 (이미지 혹은 텍스트) */}
            <div className="min-h-[600px] border-4 border-double border-[#E9DCC9] rounded-[2rem] p-8 flex flex-col items-center justify-center bg-[#FDFBF7]">
              <p className="text-gray-400 font-serif italic">
                여기에 주보 이미지 파일 혹은 PDF 뷰어를 연결할 수 있습니다.<br/>
                현재는 디자인 가이드라인이 적용된 상태입니다.
              </p>
              {/* <img src="/path-to-bulletin.jpg" alt="주보 내용" className="w-full h-auto" /> */}
            </div>

            {/* 하단 버튼 */}
            <div className="mt-12 flex justify-center gap-4">
              <button className="px-8 py-3 bg-[#3a2e24] text-white rounded-full font-bold text-sm shadow-lg hover:opacity-90 transition-all">
                주보 다운로드 (PDF)
              </button>
              <button 
                onClick={() => onNavigate("Home")}
                className="px-8 py-3 border-2 border-[#E9DCC9] text-[#8b5e3c] rounded-full font-bold text-sm hover:bg-[#F9F7F2] transition-all"
              >
                메인으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}