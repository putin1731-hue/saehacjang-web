import { useState, useEffect, useRef } from "react";
import { prayerService } from "../services/prayerService"; 
import PrayerCard from "../components/PrayerCard";

export default function PrayerBoard({ currentUser }) {
  const [prayers, setPrayers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState("전체");
  const [visible, setVisible] = useState([]);
  const [form, setForm] = useState({ content: "", category: "기타", isAnonymous: false });
  const revealRef = useRef([]);

  const categories = ["전체", "건강", "직장/진로", "가정", "신앙", "감사", "기타"];
  const colorMap = { "직장/진로": "c1", 가정: "c2", 건강: "c3", 신앙: "c4", 감사: "c3", 기타: "c3" };

  // 1. 초기 데이터 로드 (기존 유지)
  const loadPrayers = async () => {
    const result = await prayerService.getAllPrayers();
    if (result.success) {
      setPrayers(result.data);
    }
  };

  useEffect(() => {
    loadPrayers();
  }, []);

  const filtered = filterCat === "전체" ? prayers : prayers.filter((p) => p.category === filterCat);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setVisible((v) => [...v, e.target.dataset.id]);
      }),
      { threshold: 0.08 }
    );
    revealRef.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [prayers]);

  // ⭐ [핵심 수술] handleSubmit만 서비스 규격에 맞게 수정
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    
    // [수정] 서비스의 createPrayerEntry를 사용하여 통일된 데이터 규격 생성
    // (기존의 authorName 결정 로직이 서비스 내부로 포함됩니다)
    const prayerEntry = prayerService.createPrayerEntry(
      currentUser, 
      form.content, 
      form.category
    );

    // [추가] 익명 여부 플래그를 명시적으로 저장 (관리자 모드 필터링용)
    prayerEntry.isAnonymous = form.isAnonymous;
    if (form.isAnonymous) {
      prayerEntry.authorName = "익명"; // 게시판 노출용 이름 강제 변경
    }
    
    // [수정] 실제 서비스 저장소(localStorage/API)에 저장 시도
    const result = await prayerService.addPrayer(prayerEntry);
    
    if (result.success) {
      // 저장 성공 시 목록 다시 불러오기
      await loadPrayers();
      setForm({ content: "", category: "기타", isAnonymous: false });
      setShowForm(false);
      alert("기도 요청이 소중하게 전달되었습니다.");
    } else {
      alert("데이터 저장 중 문제가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  // --- 아래는 기획관님의 멋진 디자인 코드 그대로입니다 (수정 없음) ---
  return (
    <div style={{ background: "var(--cream, #fdf8f2)", minHeight: "100vh" }}>
      <div className="max-w-[780px] mx-auto px-4 sm:px-6 py-[5rem]">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[0.88rem] tracking-[0.18em] uppercase block mb-[0.5rem]"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic", color: "#c8923a" }}>
              기도 요청
            </span>
            <h1 className="text-[clamp(1.7rem,4vw,2.4rem)] font-semibold"
              style={{ fontFamily: '"Noto Serif KR", serif', color: "#3a2e24" }}>
              고민을 남겨주세요
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-[0.65rem] text-[0.88rem] font-semibold rounded-[10px] text-white active:scale-95 transition-all shadow-sm"
            style={{ background: "linear-gradient(135deg, #8b5e3c, #c8923a)" }}
          >
            {showForm ? "닫기" : "+ 기도 요청"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-[16px] p-6 mb-6 border-[1.5px] bg-white border-[#c8923a]/20 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="font-semibold mb-4 text-[1rem]" style={{ fontFamily: '"Noto Serif KR", serif', color: "#8b5e3c" }}>
               🙏 고민 남기기
            </h3>
            <div className="mb-4">
              <label className="block text-[0.8rem] font-semibold mb-2" style={{ color: "#3a2e24" }}>카테고리</label>
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => c !== "전체").map(cat => (
                  <button key={cat} type="button" onClick={() => setForm(p => ({...p, category: cat}))}
                    className={`px-3 py-1 rounded-full text-[0.78rem] border-[1.5px] transition-all ${form.category === cat ? 'bg-[#c8923a] border-[#c8923a] text-white' : 'bg-[#fdf8f2] border-[#c8923a]/10 text-[#8c7b6a]'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              className="w-full p-3 border-[1.5px] rounded-lg text-[0.86rem] bg-[#fdf8f2] focus:outline-none mb-4 border-[#c8923a]/12"
              rows={4}
              placeholder="하고 싶은 말을 자유롭게 적어주세요..."
            />
            <div className="flex justify-between items-center">
               <label className="flex items-center gap-2 text-[0.82rem] text-[#8c7b6a] cursor-pointer">
                 <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm(p => ({...p, isAnonymous: e.target.checked}))} className="w-4 h-4 accent-[#c8923a]" />
                 익명으로 작성
               </label>
               <button type="submit" className="px-6 py-[0.65rem] bg-[#8b5e3c] text-white rounded-[10px] font-semibold text-[0.88rem] active:scale-95 transition-all shadow-md" style={{ background: "linear-gradient(135deg, #8b5e3c, #c8923a)" }}>
                 등록하기
               </button>
            </div>
          </form>
        )}

        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-[0.85rem] py-[0.32rem] rounded-[8px] border-[1.5px] text-[0.78rem] font-medium transition-all ${filterCat === cat ? 'bg-[#c8923a] border-[#c8923a] text-white' : 'bg-white border-[#c8923a]/20 text-[#8c7b6a]'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="pray-wall flex flex-col gap-[0.85rem] overflow-y-auto max-h-[600px] pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[#8c7b6a]">
              <p className="text-4xl mb-2">🙏</p>
              <p className="text-sm">아직 기도 제목이 없습니다.</p>
            </div>
          ) : (
            filtered.map((prayer, idx) => (
              <div key={prayer.id} className="reveal" ref={el => { revealRef.current[idx] = el; if(el) el.dataset.id = String(prayer.id); }}
                style={{ opacity: visible.includes(String(prayer.id)) ? 1 : 0, transform: visible.includes(String(prayer.id)) ? "none" : "translateY(28px)", transition: "opacity .75s ease, transform .75s ease" }}>
                <PrayerCard prayer={prayer} isAdmin={currentUser?.role === "admin"} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}