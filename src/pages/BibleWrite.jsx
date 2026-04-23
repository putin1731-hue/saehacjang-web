import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Save, 
  UserPlus, 
  Trophy, 
  MessageSquare,
  AlertCircle,
  X
} from "lucide-react";

/**
 * [목 데이터] 성경 메타데이터
 */
const BIBLE_LIST = [
  { id: 'gen', abbr: 'gn', name: '창세기' },
  { id: 'exo', abbr: 'ex', name: '출애굽기' },
  { id: 'lev', abbr: 'lv', name: '레위기' },
  { id: 'num', abbr: 'nu', name: '민수기' },
  { id: 'deu', abbr: 'de', name: '신명기' },
  // ... 나머지 61권 (실제 구현 시 전체 리스트 필요)
  { id: 'rev', abbr: 're', name: '요한계시록' }
];

// 알림 메시지 컴포넌트
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-[#C5A059]';
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full text-white shadow-2xl animate-bounce-in ${bgColor}`}>
      {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      <span className="font-bold text-sm">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};

export default function App() {
  // --- 상태 관리 ---
  const [bookIndex, setBookIndex] = useState(() => Number(localStorage.getItem("lastBookIndex")) || 0);
  const [chapterIndex, setChapterIndex] = useState(() => Number(localStorage.getItem("lastChapterIndex")) || 1);
  const [verseIndex, setVerseIndex] = useState(() => Number(localStorage.getItem("lastVerseIndex")) || 0);
  
  const [bibleData, setBibleData] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(true);
  const [isVerseComplete, setIsVerseComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [nextName, setNextName] = useState("");
  const [nextPhone, setNextPhone] = useState("");
  
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeType, setCompleteType] = useState("CHAPTER"); 
  
  const [notification, setNotification] = useState({ message: "", type: "info" });
  const inputRef = useRef(null);

  const currentBook = BIBLE_LIST[bookIndex] || BIBLE_LIST[0];
  const currentBible = bibleData?.[verseIndex];

  // --- 헬퍼 함수 ---
  const showMsg = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "info" }), 3000);
  };

  // --- 데이터 로딩 ---
  useEffect(() => {
    const loadBible = async () => {
      try {
        setLoading(true);
        const target = currentBook;
        const chapterStr = String(chapterIndex).padStart(2, '0');
        
        try {
          const response = await fetch(`/api/bible/${target.id}_${target.abbr}_${chapterStr}.json`);
          if (!response.ok) throw new Error("파일을 찾을 수 없습니다.");
          const data = await response.json();
          if (data?.verses) setBibleData(data.verses);
        } catch {
          // 샘플 데이터
          setBibleData([
            { v: 1, t: "태초에 하나님이 천지를 창조하시니라" },
            { v: 2, t: "땅이 혼돈하고 공허하며 흑암이 깊음 위에 있고 하나님의 영은 수면 위에 운행하시니라" }
          ]);
        }
      } catch (error) {
        setCompleteType("BOOK");
        setShowCompleteModal(true);
      } finally {
        setLoading(false);
      }
    };
    loadBible();
  }, [bookIndex, chapterIndex]);

  // --- 핸들러 ---
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
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const reportProgress = async (vIdx) => {
    try {
      const targetVerse = bibleData?.[vIdx];
      await fetch('/api/relay/update-verse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookName: currentBook.name,
          chapterNum: chapterIndex, 
          verseNum: targetVerse?.v || (vIdx + 1)
        })
      });
    } catch (e) { console.warn(e); }
  };

  const moveToNextVerse = useCallback(() => {
    if (!bibleData || !isVerseComplete) return;
    let nextVerse = verseIndex + 1;
    if (nextVerse >= bibleData.length) {
      setCompleteType("CHAPTER");
      setShowCompleteModal(true);
    } else {
      reportProgress(nextVerse);
      updateState(bookIndex, chapterIndex, nextVerse);
    }
  }, [bibleData, verseIndex, bookIndex, chapterIndex, isVerseComplete, updateState]);

  const handleModalNext = () => {
    if (completeType === "CHAPTER") {
      updateState(bookIndex, chapterIndex + 1, 0);
    } else {
      if (bookIndex < BIBLE_LIST.length - 1) {
        updateState(bookIndex + 1, 1, 0);
      } else {
        showMsg("성경 전권을 완주하셨습니다! 할렐루야!", "success");
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
    await reportProgress(verseIndex);
    showMsg("현재까지의 진행 상황이 저장되었습니다.");
  };

  const handleNominate = async () => {
    if (!nextName || !nextPhone) return showMsg("주자 정보를 모두 입력해 주세요.", "error");
    showMsg(`${nextName}님께 말씀의 바통을 전달했습니다.`, "success");
    setNextName(""); setNextPhone("");
  };

  if (loading || (!currentBible && !showCompleteModal)) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex flex-col items-center justify-center font-serif">
        <div className="w-10 h-10 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#C5A059] font-bold text-sm">말씀을 불러오고 있습니다...</p>
      </div>
    );
  }

  const totalProgress = ((bookIndex / (BIBLE_LIST.length - 1)) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F9F7F2] py-6 px-4 md:px-6 font-sans select-none relative text-[#3a2e24]">
      
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: "", type: "info" })} 
      />

      {/* 완료 축하 팝업 */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#3a2e24]/60 backdrop-blur-sm p-4 text-center">
          <div className="bg-[#F9F7F2] p-10 rounded-[2.5rem] border-4 border-[#C5A059] shadow-2xl max-w-sm w-full animate-in zoom-in duration-300">
            <Trophy className="text-[#C5A059] mx-auto mb-6" size={48} />
            <h2 className="text-2xl font-black mb-2">
              {currentBook.name} {completeType === "BOOK" ? "완주!" : `${chapterIndex}장 완료!`}
            </h2>
            <p className="text-[#8b5e3c] mb-8 font-serif italic leading-relaxed text-sm">
              {completeType === "BOOK" 
                ? "“나의 달려갈 길을 마치고 믿음을 지켰으니”" 
                : "“주의 말씀은 내 입에 어찌 그리 단지요”"}
            </p>
            <button 
              onClick={handleModalNext}
              className="w-full py-4 bg-[#C5A059] text-white rounded-xl font-bold hover:bg-[#A68648] transition-all flex items-center justify-center gap-2"
            >
              {completeType === "BOOK" ? "다음 권 시작하기" : "다음 장 계속하기"}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* 상단 헤더: 정보 요약 */}
        <header className="mb-8 flex flex-col gap-4">
          <div className="flex items-end justify-between border-b border-[#E9DCC9] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={20} className="text-[#C5A059]" />
                <h1 className="text-xl font-black font-serif">성경 필사</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold px-3 py-1 bg-[#C5A059] text-white rounded-full">
                  {currentBook.name} {chapterIndex}장
                </span>
                <span className="text-[11px] text-[#8b5e3c] font-serif italic">
                  "내 발의 등이요 내 길의 빛이니이다"
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#C5A059] uppercase block mb-0.5">전체 필사 진행률</span>
              <span className="text-2xl font-black font-serif text-[#3a2e24]">{totalProgress}%</span>
            </div>
          </div>

          {/* 진행률 바: 신약 시작점 동그라미 표시 추가 */}
          <div className="px-1 pt-4">
            <div className="relative w-full h-2.5 bg-[#E9DCC9] rounded-full">
              {/* 진행 바 */}
              <div 
                className="absolute top-0 left-0 h-full bg-[#C5A059] rounded-full transition-all duration-1000 ease-out z-0"
                style={{ width: `${totalProgress}%` }}
              />
              
              {/* 신약 시작 지점 (동그라미 포인트) */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#C5A059] rounded-full z-10 flex items-center justify-center shadow-sm"
                style={{ left: '60%' }}
                title="신약 시작"
              >
                {/* 신약 라벨 */}
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#C5A059] whitespace-nowrap">신약</span>
                <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full"></div>
              </div>

              {/* 양 끝단 라벨 */}
              <div className="absolute -bottom-5 left-0 text-[10px] font-bold text-[#8b5e3c]">구약 시작</div>
              <div className="absolute -bottom-5 right-0 text-[10px] font-bold text-[#8b5e3c]">전체 완주</div>
            </div>
          </div>
        </header>

        {/* 필사 카드 */}
        <main className="bg-white rounded-[2rem] shadow-xl border border-[#E9DCC9] overflow-hidden">
          <div className="bg-[#C5A059] py-3 px-8 text-white flex justify-between items-center">
            <span className="text-md font-serif font-bold">
              {currentBook.name} {chapterIndex}장 {currentBible?.v}절
            </span>
            <span className="text-[11px] opacity-80 font-medium">말씀을 정성껏 옮겨 적습니다</span>
          </div>

          <div className="p-6 md:p-10 text-center">
            {/* 원문 영역 */}
            <div className="mb-8 py-10 px-6 bg-[#F9F7F2] rounded-[1.5rem] border border-[#E9DCC9] relative">
              <div className="absolute -top-3 left-6 bg-white px-3 py-0.5 rounded-full border border-[#E9DCC9] text-[9px] font-bold text-[#C5A059] tracking-widest">말씀 원문</div>
              <p className="text-lg md:text-xl font-serif text-[#3A3A3A] leading-[1.8] font-medium break-keep">
                {currentBible?.t}
              </p>
            </div>
            
            {/* 입력 영역 */}
            <div className="relative">
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onPaste={e => e.preventDefault()}
                placeholder="위의 말씀을 똑같이 입력해 주세요..."
                className={`w-full h-32 p-6 rounded-2xl border-2 text-lg font-serif focus:outline-none transition-all duration-200 resize-none
                  ${!isCorrect 
                    ? "border-red-100 bg-red-50" 
                    : isVerseComplete 
                      ? "border-[#C5A059] bg-[#F9F7F2]" 
                      : "border-[#E9DCC9] bg-white focus:border-[#C5A059]"}`}
                spellCheck="false"
                autoFocus
              />
              {!isCorrect && (
                <div className="absolute bottom-4 right-6 text-red-400 flex items-center gap-1.5 font-bold text-[12px]">
                  <AlertCircle size={14} /> 오타가 있습니다
                </div>
              )}
            </div>

            {/* 하단 버튼 */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 border-b border-[#E9DCC9] pb-8">
              <button 
                onClick={handleStopAndSave} 
                className="flex items-center gap-2 px-6 py-2 text-sm text-[#8b5e3c] font-bold hover:text-[#C5A059] transition-colors"
              >
                <Save size={16} />
                저장 후 멈추기
              </button>
              
              <button 
                disabled={!isVerseComplete} 
                onClick={moveToNextVerse} 
                className={`px-12 py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2
                  ${isVerseComplete 
                    ? "bg-[#C5A059] text-white hover:bg-[#A68648]" 
                    : "bg-[#E9DCC9] text-white/60 cursor-not-allowed"}`}
              >
                다음 구절로
                <ArrowRight size={18} />
              </button>
            </div>

            {/* 바통 전달 섹션 */}
            <section className="mt-8 p-6 bg-[#F9F7F2] rounded-2xl border border-[#E9DCC9] text-left">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus size={18} className="text-[#C5A059]" />
                <h3 className="text-sm font-bold font-serif">말씀의 바통 이어주기</h3>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="다음 주자 이름" 
                  value={nextName} 
                  onChange={e => setNextName(e.target.value)} 
                  className="flex-1 p-3 rounded-xl border border-[#E9DCC9] text-sm focus:outline-none focus:border-[#C5A059]" 
                />
                <input 
                  type="text" 
                  placeholder="연락처 (숫자만)" 
                  value={nextPhone} 
                  onChange={e => setNextPhone(e.target.value)} 
                  className="flex-1 p-3 rounded-xl border border-[#E9DCC9] text-sm focus:outline-none focus:border-[#C5A059]" 
                />
                <button 
                  onClick={handleNominate} 
                  className="px-6 py-3 bg-[#C5A059] text-white rounded-xl font-bold hover:bg-[#A68648] transition-all text-sm flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageSquare size={16} />
                  전달하기
                </button>
              </div>
            </section>
          </div>
        </main>
        
        <footer className="mt-12 text-center text-[#8b5e3c] opacity-40 text-[10px] font-serif uppercase tracking-widest">
          © 성경 필사 릴레이 프로젝트
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-in {
          0% { transform: translate(-50%, -20px); opacity: 0; }
          60% { transform: translate(-50%, 8px); opacity: 1; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }
      `}} />
    </div>
  );
}