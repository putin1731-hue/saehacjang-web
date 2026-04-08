import React, { useState, useEffect, useCallback } from "react";
import { BIBLE_LIST } from "../data/bibleMeta"; 

export default function BibleWrite({ onFinish }) {
  // [강철 세션 유지] 새로고침해도 튕기지 않는 초기값 설정
  const [bookIndex, setBookIndex] = useState(() => Number(localStorage.getItem("lastBookIndex")) || 0);
  const [verseIndex, setVerseIndex] = useState(() => Number(localStorage.getItem("lastVerseIndex")) || 0);
  const [bibleData, setBibleData] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(true);
  const [isVerseComplete, setIsVerseComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  // [디자인부 최신 기능] 지목 및 모달 상태
  const [nextName, setNextName] = useState("");
  const [nextPhone, setNextPhone] = useState("");
  const [showChapterComplete, setShowChapterComplete] = useState(false);

  // 1. 말씀 데이터 로드 로직
  useEffect(() => {
    const loadBible = async () => {
      try {
        setLoading(true);
        const target = BIBLE_LIST[bookIndex];
        const fileName = `${target.id}_${target.abbr}_01.json`;
        const response = await fetch(`/data/bible/${fileName}`);
        const data = await response.json();
        if (data?.verses) setBibleData(data.verses);
      } catch (error) {
        console.error("Critical: 말씀 로드 실패", error);
      } finally {
        setLoading(false);
      }
    };
    loadBible();
  }, [bookIndex]);

  const currentBible = bibleData?.[verseIndex];

  // 2. [기술부 수리] 이동 로직 (디자인부 모달 연동)
  const updateState = useCallback((nextBook, nextVerse) => {
    setBookIndex(nextBook);
    setVerseIndex(nextVerse);
    localStorage.setItem("lastBookIndex", nextBook);
    localStorage.setItem("lastVerseIndex", nextVerse);
    setUserInput("");
    setIsVerseComplete(false);
    setIsCorrect(true);
    setShowChapterComplete(false);
  }, []);

  const moveToNextVerse = useCallback(() => {
    if (!bibleData || !isVerseComplete) return;

    let nextVerse = verseIndex + 1;
    
    // 장 완료 시 디자인부 '은혜로운 모달' 활성화
    if (nextVerse >= bibleData.length) {
      setShowChapterComplete(true);
      return;
    }

    updateState(bookIndex, nextVerse);
  }, [bibleData, verseIndex, bookIndex, isVerseComplete, updateState]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.length > userInput.length + 2) return; // 복사 방지 유지
    setUserInput(val);

    if (currentBible) {
      setIsCorrect(currentBible.t.startsWith(val));
      setIsVerseComplete(val === currentBible.t);
    }
  };

  const handleKeyDown = (e) => {
    // 엔터키 입력 시 즉시 이동 (기술부 수리 완료)
    if (e.key === "Enter" && isVerseComplete) {
      e.preventDefault();
      moveToNextVerse();
    }
  };

  // 3. 바통 터치 로직 (API 연동)
  const handleNominate = async () => {
    if (!nextName || !nextPhone) return alert("다음 주자의 성함과 연락처를 정확히 입력해 주세요.");
    try {
      const res = await fetch('http://localhost:5000/api/nominate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextName, nextPhone })
      });
      const data = await res.json();
      if (data.success) {
        alert("✨ 말씀의 바통이 성공적으로 전달되었습니다.");
        onFinish();
      } else { alert("지목 불가: " + data.message); }
    } catch (e) { alert("서버 연결 실패"); }
  };

  if (loading || !currentBible) return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059] animate-pulse text-lg">
      거룩한 여정을 준비 중입니다...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F7F2] py-8 px-6 font-sans select-none relative" onContextMenu={e => e.preventDefault()}>
      
      {/* [디자인부] 완료 축하 모달 - UI 가이드 준수 */}
      {showChapterComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3a2e24]/40 backdrop-blur-sm">
          <div className="bg-[#F9F7F2] p-12 rounded-[2.5rem] border-2 border-[#C5A059] text-center shadow-2xl max-w-md mx-4 animate-in zoom-in duration-300">
            <span className="text-5xl mb-4 block">✨</span>
            <h2 className="text-2xl font-bold text-[#3a2e24] mb-2">{BIBLE_LIST[bookIndex].name} 완료!</h2>
            <p className="text-[#8b5e3c] mb-8 font-serif italic text-lg leading-relaxed">"내가 선한 싸움을 싸우고 나의 달려갈 길을 마치고 믿음을 지켰으니"</p>
            <button 
              onClick={() => updateState(bookIndex + 1, 0)}
              className="w-full py-4 bg-[#C5A059] text-white rounded-full font-bold hover:bg-[#A68648] transition-all shadow-lg active:scale-95"
            >
              다음 권으로 나아가기
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        
        {/* [디자인부] 상단 헤더 UI 유지 */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between border-b-2 border-[#E9DCC9] pb-4 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black text-[#3a2e24] tracking-tighter font-serif leading-none">성경 필사</h1>
              <span className="text-[12px] text-white font-bold px-4 py-1 bg-[#C5A059] rounded-full shadow-sm uppercase tracking-widest h-fit">
                {BIBLE_LIST[bookIndex].name} 진행 중
              </span>
            </div>
            <p className="text-[#8b5e3c] mt-2 italic font-serif text-base opacity-90 leading-tight">
              "주의 말씀은 내 발에 등이요 내 길에 빛이니이다"
            </p>
          </div>

          {/* 진도율 바: 디자인부 신약 포인트 정밀 정렬 */}
          <div className="w-full md:w-64 flex flex-col gap-2 relative">
            <div className="flex justify-between text-[11px] font-extrabold text-[#C5A059] uppercase tracking-tighter mb-1">
              <span>통독 여정</span>
              <span className="text-sm">{((bookIndex + 1) / 66 * 100).toFixed(1)}%</span>
            </div>
            <div className="relative w-full h-2.5 bg-[#E9DCC9] rounded-full shadow-inner flex items-center">
              <div className="absolute left-[60%] flex flex-col items-center z-20">
                <span className="absolute -top-5 text-[10px] font-black text-[#C5A059] whitespace-nowrap">신약</span>
                <div className="w-3.5 h-3.5 bg-white border-2 border-[#C5A059] rounded-full shadow-sm"></div>
              </div>
              <div 
                className="absolute left-0 top-0 h-full bg-[#C5A059] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(197,160,89,0.4)] z-10" 
                style={{ width: `${((bookIndex + 1) / 66 * 100).toFixed(2)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 메인 필사 카드 UI 유지 */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-[#E9DCC9] overflow-hidden">
          <div className="bg-[#C5A059] py-4 px-10 text-white flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xl font-serif font-bold tracking-tight">📖 {BIBLE_LIST[bookIndex].name} {currentBible.v}절</span>
            </div>
            {/* [디자인부] 중복 기능 제거: 임시 저장 버튼 삭제 완료 */}
          </div>

          <div className="p-8 md:p-12">
            {/* 원문 영역 디자인 유지 */}
            <div className="mb-10 text-center py-14 bg-[#F9F7F2]/60 rounded-[2.5rem] border border-[#E9DCC9]/40 shadow-inner">
              <p className="text-2xl md:text-3xl font-serif text-[#3A3A3A] leading-[1.8] px-8 select-none pointer-events-none font-medium opacity-95">
                {currentBible.t}
              </p>
            </div>
            
            {/* 입력 영역: 디자인부 오타 피드백 컬러셋 반영 */}
            <div className="relative">
              <textarea
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onPaste={e => e.preventDefault()}
                placeholder="말씀을 마음속에 새기며 정성껏 입력해 주세요..."
                className={`w-full h-44 p-8 rounded-[2rem] border-2 text-xl font-serif focus:outline-none transition-all duration-500 
                  ${!isCorrect && !isFocused && userInput.length > 0 
                    ? "border-[#D29181] text-[#D29181] bg-[#FAF3F2]" 
                    : isVerseComplete 
                      ? "border-[#C5A059] bg-[#F9F7F2]" 
                      : "border-[#E9DCC9] focus:border-[#C5A059] bg-white text-[#3a2e24]"}`}
                spellCheck="false"
              />
              <div className="mt-4 min-h-[24px] text-center">
                {isVerseComplete && <p className="text-[#C5A059] text-sm font-bold animate-bounce tracking-tight">✨ 은혜로운 기록입니다. 계속해서 다음 절로 나아가세요.</p>}
              </div>
            </div>

            {/* 하단 제어부 및 바통 터치 영역 UI 보존 */}
            <div className="mt-8 flex items-center justify-center gap-6 border-b border-[#E9DCC9] pb-10">
              <button onClick={() => onFinish()} className="px-10 py-3.5 text-[#8b5e3c] font-bold hover:underline underline-offset-8 transition-all text-sm">잠시 멈추기</button>
              <button 
                disabled={!isVerseComplete} 
                onClick={moveToNextVerse} 
                className={`px-16 py-4 rounded-full font-bold shadow-xl transition-all transform active:scale-95 flex items-center gap-2 ${
                  isVerseComplete ? "bg-[#C5A059] text-white hover:bg-[#A68648] shadow-[0_0_15px_rgba(197,160,89,0.3)]" : "bg-[#E9DCC9] text-white/60 cursor-not-allowed shadow-none"
                }`}
              >
                다음 구절로 ➔
              </button>
            </div>

            <div className="mt-10 p-8 bg-[#F9F7F2]/80 rounded-[2.5rem] border border-[#E9DCC9] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C5A059]"></div>
              <h3 className="text-lg font-bold text-[#3a2e24] mb-5 font-serif flex items-center gap-2">
                <span className="text-xl">🤝</span> 말씀의 바통 이어주기
              </h3>
              
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="w-full md:w-[130px]">
                  <input 
                    type="text" placeholder="성함" value={nextName}
                    onChange={e => setNextName(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-[#E9DCC9] focus:outline-none focus:border-[#C5A059] bg-white text-base font-serif" 
                  />
                </div>
                <div className="w-full md:w-[200px]">
                  <input 
                    type="text" placeholder="연락처 (숫자만)" value={nextPhone}
                    onChange={e => setNextPhone(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-[#E9DCC9] focus:outline-none focus:border-[#C5A059] bg-white text-base font-serif" 
                  />
                </div>
                <div className="w-full md:flex-1">
                  <button 
                    onClick={handleNominate}
                    className="w-full py-3.5 bg-[#C5A059] text-white rounded-xl font-bold hover:bg-[#A68648] transition-all shadow-md active:scale-95 whitespace-nowrap px-6"
                  >
                    지목 및 전송 ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}