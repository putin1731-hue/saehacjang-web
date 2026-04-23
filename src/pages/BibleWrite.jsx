import React, { useState, useEffect, useCallback } from "react";
import { BIBLE_LIST } from "../data/bibleMeta";

export default function BibleWrite({ onFinish, currentUser, relayStatus }) {
  
  // 🚀 1. 입구 보안 검사 (내 순서가 아니면 안내 화면 노출 후 차단)
  const isMyTurn = currentUser?.phone === relayStatus?.currentRunner?.phone;

  // 🚀 2. 상태 관리 (초기값은 서버 데이터[relayStatus]를 최우선으로 설정!)
  const [bookIndex, setBookIndex] = useState(() => {
    const bookName = relayStatus?.currentBookName || "창세기";
    const idx = BIBLE_LIST.findIndex(b => b.name === bookName);
    return idx !== -1 ? idx : 0;
  });

  const [chapterIndex, setChapterIndex] = useState(relayStatus?.currentChapterNum || 1);
  const [verseIndex, setVerseIndex] = useState(() => {
    const v = relayStatus?.currentVerseNum || 1;
    return v > 0 ? v - 1 : 0; // 서버 1절 = 인덱스 0
  });
  
  const [bibleData, setBibleData] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(true);
  const [isVerseComplete, setIsVerseComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const [nextName, setNextName] = useState("");
  const [nextPhone, setNextPhone] = useState("");
  
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeType, setCompleteType] = useState("CHAPTER");

  // 🚀 3. [자동 동기화] 서버에서 주자가 바뀌거나 위치가 바뀌면 즉시 반영
  useEffect(() => {
    if (relayStatus) {
      const bIdx = BIBLE_LIST.findIndex(b => b.name === relayStatus.currentBookName);
      if (bIdx !== -1) setBookIndex(bIdx);
      setChapterIndex(relayStatus.currentChapterNum || 1);
      setVerseIndex((relayStatus.currentVerseNum || 1) - 1);
      // 위치가 바뀌면 입력창도 초기화
      setUserInput("");
      setIsVerseComplete(false);
      setIsCorrect(true);
    }
  }, [relayStatus?.currentBookName, relayStatus?.currentChapterNum, relayStatus?.currentVerseNum]);

  // 🚀 4. 성경 데이터 파일 로드
  useEffect(() => {
    const loadBible = async () => {
      try {
        setLoading(true);
        const target = BIBLE_LIST[bookIndex];
        const chapterStr = String(chapterIndex).padStart(2, '0');
        const fileName = `${target.id}_${target.abbr}_${chapterStr}.json`;
        
        const response = await fetch(`/api/bible/${fileName}`);
        if (!response.ok) {
          if (chapterIndex > 1) {
            setCompleteType("BOOK");
            setShowCompleteModal(true);
          }
          return;
        }
        
        const data = await response.json();
        if (data?.verses) setBibleData(data.verses);
      } catch (error) {
        console.error("파일 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBible();
  }, [bookIndex, chapterIndex]);

  const currentBible = bibleData?.[verseIndex];

  // 상태 업데이트 및 로컬 저장 (백업용 유지)
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

  // 서버에 진행 상황 실시간 보고
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

  const moveToNextVerse = useCallback(() => {
    if (!bibleData || bibleData.length === 0 || !isVerseComplete) return;

    let nextVerse = verseIndex + 1;
    if (nextVerse >= bibleData.length) {
      setCompleteType("CHAPTER");
      setShowCompleteModal(true);
    } else {
      reportProgressToServer(nextVerse);
      updateState(bookIndex, chapterIndex, nextVerse);
    }
  }, [bibleData, verseIndex, bookIndex, chapterIndex, isVerseComplete, updateState]);

  const handleModalNext = () => {
    if (completeType === "CHAPTER") {
      updateState(bookIndex, chapterIndex + 1, 0);
    } else {
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

  // 🚀 [보안] 내 순서가 아닐 때 보여줄 화면
  if (!isMyTurn) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border-2 border-[#D29181] text-center max-w-md">
          <span className="text-6xl mb-6 block">✋</span>
          <h2 className="text-2xl font-bold text-[#3a2e24] mb-4 font-serif">지금은 필사 순서가 아닙니다</h2>
          <p className="text-[#8b5e3c] mb-8 leading-relaxed">
            현재 주자는 <span className="font-bold text-[#C5A059]">{relayStatus?.currentRunner?.name || "확인 중"}</span> 님입니다.<br/>
            순서가 되면 다시 방문해 주세요!
          </p>
          <button onClick={onFinish} className="w-full py-4 bg-[#D29181] text-white rounded-full font-bold hover:bg-[#b87a6a] transition-all shadow-lg">
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (loading || (!currentBible && !showCompleteModal)) return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059] animate-pulse">
      말씀을 불러오고 있습니다...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F7F2] py-8 px-6 font-sans select-none relative">
      
      {/* 🎊 완료 축하 팝업 */}
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
        {/* 상단 진행 표시줄 */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between border-b-2 border-[#E9DCC9] pb-4 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black text-[#3a2e24] font-serif">성경 필사</h1>
              <span className="text-[12px] text-white font-bold px-4 py-1 bg-[#C5A059] rounded-full">
                {BIBLE_LIST[bookIndex].name} {chapterIndex}장 진행 중
              </span>
            </div>
            <p className="text-[#8b5e3c] mt-2 italic font-serif text-sm opacity-90">"주의 말씀은 내 발에 등이요 내 길에 빛이니이다"</p>
          </div>

          <div className="w-full md:w-64 flex flex-col gap-1">
            <div className="flex justify-between text-[11px] font-extrabold text-[#C5A059] uppercase tracking-tighter">
              <span>통독 여정</span>
              <span>{((bookIndex + 1) / 66 * 100).toFixed(1)}%</span>
            </div>
            <div className="relative w-full h-2.5 bg-[#E9DCC9] rounded-full overflow-hidden">
              <div className="h-full bg-[#C5A059] transition-all duration-1000" style={{ width: `${((bookIndex + 1) / 66 * 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* 필사 카드 메인 */}
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
              autoFocus
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

            {/* 바통 전달 UI */}
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