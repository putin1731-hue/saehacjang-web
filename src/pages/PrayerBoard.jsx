import { useState, useEffect, useRef } from "react";
import { prayerService } from "../services/prayerService"; 
import PrayerCard from "../components/PrayerCard";

export default function PrayerBoard({ currentUser }) {
  // [보안/방어] 로그인 정보가 없어도 화면이 깨지지 않게 보호
  const user = currentUser || { name: "성도", role: "user" };

  const [prayers, setPrayers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState("전체");
  const [visible, setVisible] = useState([]);
  const [form, setForm] = useState({ content: "", category: "기타", isAnonymous: false });
  const revealRef = useRef([]);

  const categories = ["전체", "건강", "직장/진로", "가정", "신앙", "감사", "기타"];
  // 기획관님의 오리지널 컬러 맵 유지
  const colorMap = { "직장/진로": "c1", 가정: "c2", 건강: "c3", 신앙: "c4", 감사: "c3", 기타: "c3" };

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

  // 기획관님의 IntersectionObserver 애니메이션 로직 완벽 유지
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    
    // 서비스 규격에 맞게 데이터 생성
    const prayerEntry = prayerService.createPrayerEntry(
      user, 
      form.content, 
      form.category
    );

    prayerEntry.isAnonymous = form.isAnonymous;
    if (form.isAnonymous) {
      prayerEntry.authorName = "익명";
    }
    
    // 기획관님의 컬러 클래스 로직 추가
    prayerEntry.colorClass = colorMap[form.category] ?? "c3";

    const result = await prayerService.addPrayer(prayerEntry);
    
    if (result.success) {
      await loadPrayers();
      setForm({ content: "", category: "기타", isAnonymous: false });
      setShowForm(false);
      alert("기도 요청이 소중하게 전달되었습니다.");
    } else {
      alert("데이터 저장 중 문제가 발생했습니다.");
    }
  };

  return (
    <div style={{ background: "var(--cream, #fdf8f2)", minHeight: "100vh" }}>
      <div className="max-w-[780px] mx-auto px-4 sm:px-6 py-[5rem]">
        
        {/* 헤더 디자인 복원 */}
        <div className="flex items-center justify-between mb-8 reveal visible">
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
            className="px-5 py-[0.65rem] text-[0.88rem] font-semibold rounded-[10px] text-white active:scale-95 transition-all shadow-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #8b5e3c, #c8923a)" }}
          >
            {showForm ? "닫기" : "+ 기도 요청"}
          </button>
        </div>

        {/* 작성 폼 (애니메이션 및 스타일 복원) */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-[16px] p-6 mb-6 border-[1.5px] animate-in fade-in slide-in-from-top-4 duration-300"
            style={{ background: "#fff", borderColor: "rgba(200,146,58,0.2)" }}
          >
            <h3 className="font-semibold mb-4 text-[1rem]" style={{ fontFamily: '"Noto Serif KR", serif', color: "#8b5e3c" }}>
               🙏 고민 남기기
            </h3>
            <p className="text-[0.82rem] mb-[1.3rem] leading-[1.7]" style={{ color: "#8c7b6a" }}>
              이름을 밝히지 않아도 괜찮아요. 작은 고민도 소중합니다.
            </p>

            <div className="mb-4">
              <label className="block text-[0.8rem] font-semibold mb-[0.35rem]" style={{ color: "#3a2e24" }}>카테고리</label>
              <div className="flex flex-wrap gap-[0.45rem]">
                {categories.filter((c) => c !== "전체").map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className="px-[0.85rem] py-[0.32rem] rounded-[20px] border-[1.5px] text-[0.78rem] transition-all"
                    style={
                      form.category === cat
                        ? { background: "#c8923a", borderColor: "#c8923a", color: "#fff" }
                        : { background: "var(--cream, #fdf8f2)", borderColor: "rgba(200,146,58,0.12)", color: "#8c7b6a" }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[0.8rem] font-semibold mb-[0.35rem]" style={{ color: "#3a2e24" }}>내용</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="하고 싶은 말을 자유롭게 적어주세요..."
                rows={4}
                className="w-full px-4 py-3 rounded-[8px] border-[1.5px] text-[0.86rem] resize-none focus:outline-none transition-all"
                style={{ borderColor: "rgba(200,146,58,0.12)", background: "var(--cream, #fdf8f2)", color: "#3a2e24" }}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-[0.82rem]" style={{ color: "#8c7b6a" }}>
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={(e) => setForm((p) => ({ ...p, isAnonymous: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#c8923a]"
                />
                익명으로 작성
              </label>
              <button
                type="submit"
                className="px-6 py-[0.65rem] text-[0.88rem] font-semibold rounded-[10px] text-white active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg, #8b5e3c, #c8923a)" }}
              >
                등록하기
              </button>
            </div>
          </form>
        )}

        {/* 필터 버튼 스타일 복원 */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className="px-[0.85rem] py-[0.32rem] rounded-[8px] border-[1.5px] text-[0.78rem] font-medium transition-all"
              style={
                filterCat === cat
                  ? { background: "#c8923a", borderColor: "#c8923a", color: "#fff" }
                  : { background: "#fff", borderColor: "rgba(200,146,58,0.2)", color: "#8c7b6a" }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 기도 리스트 & 애니메이션 복원 */}
        <div className="pray-wall flex flex-col gap-[0.85rem] overflow-y-auto max-h-[600px] pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[#8c7b6a]">
              <p className="text-4xl mb-2">🙏</p>
              <p className="text-[0.88rem]">아직 기도 제목이 없습니다.</p>
            </div>
          ) : (
            filtered.map((prayer, idx) => (
              <div
                key={prayer.id}
                className="reveal"
                ref={(el) => { revealRef.current[idx] = el; if (el) el.dataset.id = String(prayer.id); }}
                style={{ 
                  opacity: visible.includes(String(prayer.id)) ? 1 : 0, 
                  transform: visible.includes(String(prayer.id)) ? "none" : "translateY(28px)", 
                  transition: "opacity .75s ease, transform .75s ease" 
                }}
              >
                <PrayerCard 
                  prayer={prayer} 
                  isAdmin={user?.role === "admin"} 
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}