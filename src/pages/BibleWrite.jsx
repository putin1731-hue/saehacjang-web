import React, { useState, useEffect, useCallback } from "react";
import { BIBLE_LIST } from "../data/bibleMeta";

export default function BibleWrite({ onFinish }) {
  // 1. 상태 관리: 권(Book), 장(Chapter), 절(Verse) - 로컬스토리지 연동
  const [bookIndex, setBookIndex] = useState(() => Number(localStorage.getItem("lastBookIndex")) || 0);
  const [chapterIndex, setChapterIndex] = useState(() => Number(localStorage.getItem("lastChapterIndex")) || 1);
  const [verseIndex, setVerseIndex] = useState(() => Number(localStorage.getItem("lastVerseIndex")) || 0);
  
  const [bibleData, setBibleData] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(true);
  const [isVerseComplete, setIsVerseComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const [nextName, setNextName] = useState("");
  const [nextPhone, setNextPhone] = useState("");
  
  // 팝업 관리
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeType, setCompleteType] = useState("CHAPTER"); // "CHAPTER" 또는 "BOOK"

  // 📖 성경 데이터 동적 로드 (현재 권과 장에 맞는 파일 호출)
  useEffect(() => {
    const loadBible = async () => {
      try {
        setLoading(true);
        const target = BIBLE_LIST[bookIndex];
        const chapterStr = String(chapterIndex).padStart(2, '0');
        const fileName = `${target.id}_${target.abbr}_${chapterStr}.json`;
        
        const response = await fetch(`/api/bible/${fileName}`);
        if (!response.ok) throw new Error("파일 없음"); // 다음 장이 없으면 에러 발생 -> 권 이동 로직으로
        
        const data = await response.json();
        if (data?.verses) setBibleData(data.verses);
      } catch (error) {
        // 현재 장이 없다는 건 해당 권이 끝났다는 뜻 (예: 창세기 51장 요청 시)
        setCompleteType("BOOK");
        setShowCompleteModal(true);
      } finally {
        setLoading(false);
      }
    };
    loadBible();
  }, [bookIndex, chapterIndex]);

  const currentBible = bibleData?.[verseIndex];

  // 상태 업데이트 및 저장
  const updateState = useCallback((nextBook, nextChapter, nextVerse) => {
    setBookIndex(nextBook);
    setChapterIndex(nextChapter);
    setVerseIndex(nextVerse);
    localStorage.setItem("lastBookIndex", nextBook);
    localStorage.setItem("lastChapterIndex", nextChapter);
    localStorage.setItem("lastVerseIndex", nextVerse);
    setUserInput("");
    setIsVerseComplete(false);
    setIsCorrect(true);
    setShowCompleteModal(false);
  }, []);

  // 서버 보고
  const reportProgressToServer = async (vIdx) => {
    try {
      const targetVerse = bibleData?.[vIdx];
      await fetch('/api/relay/update-verse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookName: BIBLE_LIST[bookIndex].name,
          chapterNum: chapterIndex, 
          verseNum: targetVerse?.v || (vIdx + 1)
        })
      });
    } catch (error) { console.error("서버 보고 실패:", error); }
  };

  // ⏭️ 다음 단계 이동 판단
  const moveToNextVerse = useCallback(() => {
    if (!bibleData || !isVerseComplete) return;

    let nextVerse = verseIndex + 1;
    if (nextVerse >= bibleData.length) {
      // 한 장이 끝났을 때 팝업 띄우기
      setCompleteType("CHAPTER");
      setShowCompleteModal(true);
    } else {
      reportProgressToServer(nextVerse);
      updateState(bookIndex, chapterIndex, nextVerse);
    }
  }, [bibleData, verseIndex, bookIndex, chapterIndex, isVerseComplete, updateState]);

  // 팝업에서 '다음' 버튼 클릭 시
  const handleModalNext = () => {
    if (completeType === "CHAPTER") {
      // 다음 장 1절로 이동
      updateState(bookIndex, chapterIndex + 1, 0);
    } else {
      // 다음 권 1장 1절로 이동
      if (bookIndex < 65) {
        updateState(bookIndex + 1, 1, 0);
      } else {
        alert("성경 전권을 완주하셨습니다! 할렐루야!");
        onFinish();
      }
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setUserInput(val);
    if (currentBible) {
      setIsCorrect(currentBible.t.startsWith(val));
      setIsVerseComplete(val === currentBible.t);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isVerseComplete) {
      e.preventDefault();
      moveToNextVerse();
    }
  };

  const handleStopAndSave = async () => {
    await reportProgressToServer(verseIndex);
    alert("현재까지의 여정이 기록되었습니다.");
    onFinish();
  };

  const handleNominate = async () => {
    if (!nextName || !nextPhone) return alert("주자 정보를 입력해 주세요.");
    try {
      const res = await fetch('/api/nominate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextName, nextPhone })
      });
      if (res.ok) { alert("바통을 전달했습니다."); onFinish(); }
    } catch (e) { alert("연결 실패"); }
  };

  if (loading || (!currentBible && !showCompleteModal)) return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059] animate-pulse">
      말씀을 불러오고 있습니다...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F7F2] py-8 px-6 font-sans select-none relative">
      
      {/* 🎊 [디자인 유지] 장/권 완료 축하 팝업 */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3a2e24]/40 backdrop-blur-sm p-4">
          <div className="bg-[#F9F7F2] p-12 rounded-[2.5rem] border-2 border-[#C5A059] text-center shadow-2xl max-w-md w-full animate-in zoom-in duration-300">
            <span className="text-5xl mb-4 block">{completeType === "BOOK" ? "👑" : "✨"}</span>
            <h2 className="text-2xl font-bold text-[#3a2e24] mb-2">
              {BIBLE_LIST[bookIndex].name} {completeType === "BOOK" ? "완주!" : `${chapterIndex}장 완료!`}
            </h2>
            <p className="text-[#8b5e3c] mb-8 font-serif italic text-lg leading-relaxed">
              {completeType === "BOOK" 
                ? "나의 달려갈 길을 마치고 믿음을 지켰으니" 
                : "주의 말씀은 내 입에 어찌 그리 단지요"}
            </p>
            <button 
              onClick={handleModalNext}
              className="w-full py-4 bg-[#C5A059] text-white rounded-full font-bold hover:bg-[#A68648] transition-all shadow-lg active:scale-95"
            >
              {completeType === "BOOK" ? "다음 권으로 나아가기" : "다음 장으로 계속하기"}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* 헤더 및 진행률 바 */}
        {/* 헤더 및 진행률 바 (정확한 계산 버전) */}
<div className="mb-6 flex flex-col gap-4 border-b-2 border-[#E9DCC9] pb-6">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="flex-1">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-black text-[#3a2e24] font-serif">성경 필사</h1>
        <span className="text-[12px] text-white font-bold px-4 py-1 bg-[#C5A059] rounded-full">
          {BIBLE_LIST[bookIndex].name} {chapterIndex}장 진행 중
        </span>
      </div>
      <p className="text-[#8b5e3c] mt-2 italic font-serif text-sm opacity-90">"주의 말씀은 내 발에 등이요 내 길에 빛이니이다"</p>
    </div>

    {/* 정확한 수치 표시 */}
    <div className="text-right">
      <div className="text-[10px] font-bold text-[#C5A059] mb-1 italic">TOTAL PROGRESS</div>
      <div className="text-3xl font-black text-[#3a2e24] font-serif">
        {((bookIndex / 66) * 100).toFixed(2)}%
      </div>
    </div>
  </div>

  {/* 통독 여정 그래프 (구약/신약 구분선 추가) */}
  <div className="relative w-full">
    <div className="flex justify-between text-[11px] font-extrabold text-[#8b5e3c] uppercase mb-2 tracking-tighter">
      <span>구약 (Genesis - Malachi)</span>
      <span className="text-[#C5A059]">신약 (Matthew - Revelation)</span>
    </div>
    
    <div className="relative w-full h-4 bg-[#E9DCC9] rounded-full p-0.5 shadow-inner">
      {/* 실제 진행바 */}
      <div 
        className="h-full bg-[#C5A059] rounded-full transition-all duration-1000 relative"
        style={{ width: `${(bookIndex / 65) * 100}%` }}
      >
        {/* 빛나는 효과 */}
        <div className="absolute top-0 right-0 w-4 h-full bg-white/30 blur-sm rounded-full"></div>
      </div>

      {/* 📍 신약 시작점 구분선 (약 60% 지점) */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white/60 z-10" 
        style={{ left: '59.2%' }} 
        title="신약 시작점"
      >
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-[#8b5e3c] font-bold">NT</span>
      </div>
    </div>
  </div>
</div>

        {/* 메인 필사 카드 */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-[#E9DCC9] overflow-hidden">
          <div className="bg-[#C5A059] py-4 px-10 text-white flex justify-between items-center">
            <span className="text-xl font-serif font-bold">📖 {BIBLE_LIST[bookIndex].name} {chapterIndex}장 {currentBible?.v}절</span>
          </div>

          <div className="p-8 md:p-12 text-center">
            <div className="mb-6 py-10 bg-[#F9F7F2]/60 rounded-[2rem] border border-[#E9DCC9]/40 px-8">
              <p className="text-xl md:text-2xl font-serif text-[#3A3A3A] leading-[1.7] font-medium select-none pointer-events-none">
                {currentBible?.t}
              </p>
            </div>
            
            <textarea
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onPaste={e => e.preventDefault()}
              placeholder="말씀을 정성껏 입력해 주세요..."
              className={`w-full h-32 p-6 rounded-[1.5rem] border-2 text-lg font-serif focus:outline-none transition-all
                ${!isCorrect ? "border-[#D29181] bg-[#FAF3F2]" : isVerseComplete ? "border-[#C5A059] bg-[#F9F7F2]" : "border-[#E9DCC9] bg-white"}`}
              spellCheck="false"
            />

            <div className="mt-8 flex justify-center gap-6 border-b border-[#E9DCC9] pb-10">
              <button onClick={handleStopAndSave} className="px-6 py-3 text-[#8b5e3c] font-bold hover:underline">잠시 멈추기</button>
              <button 
                disabled={!isVerseComplete} 
                onClick={moveToNextVerse} 
                className={`px-16 py-4 rounded-full font-bold shadow-xl transition-all active:scale-95 ${isVerseComplete ? "bg-[#C5A059] text-white hover:bg-[#A68648]" : "bg-[#E9DCC9] text-white/60 cursor-not-allowed"}`}
              >
                다음 구절로 ➔
              </button>
            </div>

            {/* 바통 이어주기 */}
            <div className="mt-10 p-8 bg-[#F9F7F2]/80 rounded-[2.5rem] border border-[#E9DCC9] text-left">
              <h3 className="text-lg font-bold text-[#3a2e24] mb-5 font-serif">🤝 말씀의 바통 이어주기</h3>
              <div className="flex flex-col md:flex-row gap-3">
                <input type="text" placeholder="성함" value={nextName} onChange={e => setNextName(e.target.value)} className="flex-1 p-3.5 rounded-xl border border-[#E9DCC9]" />
                <input type="text" placeholder="연락처" value={nextPhone} onChange={e => setNextPhone(e.target.value)} className="flex-1 p-3.5 rounded-xl border border-[#E9DCC9]" />
                <button onClick={handleNominate} className="w-full md:w-auto px-8 py-3.5 bg-[#C5A059] text-white rounded-xl font-bold hover:bg-[#A68648]">지목 및 전송 ➔</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}