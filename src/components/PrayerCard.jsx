import { useState } from "react";
import { prayCardBorder, prayCardCatColor } from "../data/mockData";

// Props:
//   prayer   : mockPrayers 항목 1개
//   onPray   : (id) => void
//   isAdmin  : boolean

export default function PrayerCard({ prayer, onPray, isAdmin = false }) {
  const [prayed, setPrayed] = useState(false);
  const [count,  setCount]  = useState(prayer.prayerCount);

  const handlePray = () => {
    if (prayed) return;
    setPrayed(true);
    setCount((c) => c + 1);
    onPray?.(prayer.id);
    // TODO: POST /prayers/:id/pray
  };

  const borderColor = prayCardBorder[prayer.colorClass]  ?? "border-l-[#c8923a]";
  const catColor    = prayCardCatColor[prayer.colorClass] ?? "text-[#c8923a]";

  return (
    <div
      className={`rounded-[12px] p-[1.1rem_1.3rem] border-l-[3px] ${borderColor} animate-slideIn`}
      style={{ background: "var(--cream, #fdf8f2)" }}
    >
      {/* 카테고리 */}
      <p className={`text-[0.72rem] font-semibold mb-[0.3rem] tracking-[0.04em] ${catColor}`}>
        {prayer.category}
      </p>

      {/* 본문 */}
      <p className="text-[0.87rem] leading-[1.7] mb-[0.55rem]" style={{ color: "#3a2e24" }}>
        {prayer.content}
      </p>

      {/* 푸터 */}
      <div className="flex items-center justify-between">
        <span className="text-[0.73rem]" style={{ color: "#8c7b6a" }}>
          {prayer.authorName} · {prayer.createdAt}
        </span>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              className="text-[0.7rem] px-2 py-1 rounded-lg transition-colors"
              style={{ color: "#e87b7b" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(232,123,123,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              삭제
            </button>
          )}

          <button
            onClick={handlePray}
            disabled={prayed}
            className="text-[0.7rem] font-medium px-[0.65rem] py-[0.18rem] rounded-[20px] border-[1.5px] transition-all"
            style={
              prayed
                ? { borderColor: "#c8923a", color: "#c8923a", background: "rgba(200,146,58,0.06)", cursor: "default" }
                : { borderColor: "rgba(200,146,58,0.2)", color: "#8c7b6a" }
            }
            onMouseEnter={(e) => {
              if (!prayed) { e.currentTarget.style.borderColor = "#c8923a"; e.currentTarget.style.color = "#c8923a"; e.currentTarget.style.background = "rgba(200,146,58,0.06)"; }
            }}
            onMouseLeave={(e) => {
              if (!prayed) { e.currentTarget.style.borderColor = "rgba(200,146,58,0.2)"; e.currentTarget.style.color = "#8c7b6a"; e.currentTarget.style.background = "transparent"; }
            }}
          >
            🙏 기도했어요 {count}
          </button>
        </div>
      </div>
    </div>
  );
}