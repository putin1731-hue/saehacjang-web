import { useState, useEffect, useRef } from "react";
// [수정] 가짜 데이터 대신 실제 서비스를 불러옵니다.
import { prayerService } from "../services/prayerService"; 
import PrayerCard from "../components/PrayerCard";

export default function PrayerBoard({ currentUser }) {
  // [수정] 초기값을 빈 배열로 시작합니다.
  const [prayers, setPrayers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState("전체");
  const [visible, setVisible] = useState([]);
  const [form, setForm] = useState({ content: "", category: "기타", isAnonymous: false });
  const revealRef = useRef([]);

  const categories = ["전체", "건강", "직장/진로", "가정", "신앙", "감사", "기타"];
  const colorMap = { "직장/진로": "c1", 가정: "c2", 건강: "c3", 신앙: "c4", 감사: "c3", 기타: "c3" };

  // [추가] 1. 페이지가 열릴 때 DB에서 실제 기도를 불러옵니다.
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

  // [핵심 수정] 2. 기도 등록 시 DB에 저장하는 로직
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    
    const authorName = form.isAnonymous ? "익명" : (currentUser?.name || "성도");
    
    // [추가] 3. 서버/DB로 보낼 데이터 규격
    const prayerData = {
      authorName: authorName,
      authorPhone: currentUser?.phone || "010-0000-0000", // 관리자 확인용 연락처 추가
      category: form.category,
      content: form.content,
      isAnonymous: form.isAnonymous,
      prayerCount: 0,
      colorClass: colorMap[form.category] ?? "c3",
    };

    // [수정] 4. 서비스를 통해 DB에 저장 시도
    const result = await prayerService.addPrayer(prayerData);
    
    if (result.success) {
      // 저장 성공 시 화면을 다시 불러옵니다.
      await loadPrayers();
      setForm({ content: "", category: "기타", isAnonymous: false });
      setShowForm(false);
      alert("기도 요청이 소중하게 전달되었습니다.");
    } else {
      alert("데이터 저장 중 문제가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <div style={{ background: "var(--cream, #fdf8f2)", minHeight: "100vh" }}>
      {/* ... 아래 디자인 부분은 기획관님이 보내주신 그대로 유지됩니다 ... */}
      <div className="max-w-[780px] mx-auto px-4 sm:px-6 py-[5rem]">
        {/* 헤더 및 폼 디자인 생략 (기존 코드와 동일) */}
        
        {/* [동일 유지] 헤더 */}
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

        {/* [동일 유지] 작성 폼 */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-[16px] p-6 mb-6 border-[1.5px] bg-white border-[#c8923a]/20">
            {/* ... 카테고리, 텍스트에어리어 등 기존 폼 디자인 그대로 ... */}
            <div className="mb-4">
              <label className="block text-[0.8rem] font-semibold mb-2">카테고리</label>
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => c !== "전체").map(cat => (
                  <button key={cat} type="button" onClick={() => setForm(p => ({...p, category: cat}))}
                    className={`px-3 py-1 rounded-full text-xs border ${form.category === cat ? 'bg-[#c8923a] text-white' : 'bg-transparent text-[#8c7b6a]'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              className="w-full p-3 border rounded-lg text-sm bg-[#fdf8f2] focus:outline-none mb-4"
              rows={4}
              placeholder="기도 제목을 나누어 주세요..."
            />
            <div className="flex justify-between items-center">
               <label className="flex items-center gap-2 text-xs text-[#8c7b6a]">
                 <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm(p => ({...p, isAnonymous: e.target.checked}))} />
                 익명 작성
               </label>
               <button type="submit" className="px-6 py-2 bg-[#8b5e3c] text-white rounded-lg font-bold text-sm">등록하기</button>
            </div>
          </form>
        )}

        {/* [동일 유지] 필터 및 리스트 */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-3 py-1 rounded-lg text-xs border ${filterCat === cat ? 'bg-[#c8923a] text-white' : 'bg-white text-[#8c7b6a]'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="pray-wall flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[#8c7b6a]">
              <p className="text-4xl mb-2">🙏</p>
              <p className="text-sm">성도님의 기도를 기다립니다.</p>
            </div>
          ) : (
            filtered.map((prayer, idx) => (
              <div key={prayer.id} className="reveal" ref={el => { revealRef.current[idx] = el; if(el) el.dataset.id = String(prayer.id); }}
                style={{ opacity: visible.includes(String(prayer.id)) ? 1 : 0, transform: visible.includes(String(prayer.id)) ? "none" : "translateY(20px)", transition: "all 0.6s ease" }}>
                <PrayerCard prayer={prayer} isAdmin={currentUser?.role === "admin"} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}