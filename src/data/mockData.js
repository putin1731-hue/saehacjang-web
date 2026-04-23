// ─────────────────────────────────────────
// Mock Data  (API 연결 시 서비스 레이어로 교체)
// ─────────────────────────────────────────

export const worshipSchedule = [
  { label: "주일 예배",    time: "오전 11:00",       sub: "매주 일요일" },
  { label: "수요 기도회",  time: "오후 7:30",         sub: "매주 수요일" },
  { label: "새벽 기도회",  time: "오전 6:00",         sub: "월~금요일"   },
  { label: "소그룹 모임",  time: "오후 7:00",         sub: "매주 목요일" },
];

export const mockPrayers = [
  {
    id: 1,
    authorName:  "이수아",
    category:    "건강",
    content:     "어머니가 요즘 건강이 좋지 않으세요. 빠른 회복을 위해 함께 기도해 주세요.",
    prayerCount: 14,
    createdAt:   "2025-04-01",
    isAnonymous: false,
    colorClass:  "c1",
  },
  {
    id: 2,
    authorName:  "익명",
    category:    "직장/진로",
    content:     "취업 준비 중인데 방향을 잡기가 어렵습니다. 하나님의 인도하심을 구합니다.",
    prayerCount: 9,
    createdAt:   "2025-04-01",
    isAnonymous: true,
    colorClass:  "c2",
  },
  {
    id: 3,
    authorName:  "김민준",
    category:    "가정",
    content:     "가족 모두 하나님 안에서 하나가 되길 기도합니다. 특히 아직 믿지 않는 남편을 위해 기도해 주세요.",
    prayerCount: 21,
    createdAt:   "2025-03-30",
    isAnonymous: false,
    colorClass:  "c3",
  },
  {
    id: 4,
    authorName:  "익명",
    category:    "신앙",
    content:     "요즘 믿음이 흔들립니다. 다시 하나님 곁으로 돌아오고 싶은데 어떻게 해야 할지 막막해요.",
    prayerCount: 17,
    createdAt:   "2025-03-28",
    isAnonymous: true,
    colorClass:  "c4",
  },
  {
    id: 5,
    authorName:  "박지현",
    category:    "감사",
    content:     "이번 주 어려운 시험을 잘 마쳤습니다. 함께해 주신 하나님께 감사드립니다 🙏",
    prayerCount: 32,
    createdAt:   "2025-03-27",
    isAnonymous: false,
    colorClass:  "c3",
  },
];

export const mockCurrentUser = {
  id:     2,
  name:   "이수아",
  email:  "sua@example.com",
  role:   "member",   // "admin" | "member"
  status: "approved", // "approved" | "pending"
};

// 기도 카드 좌측 border 색 매핑
export const prayCardBorder = {
  c1: "border-l-[#e8956a]",
  c2: "border-l-[#7abf8a]",
  c3: "border-l-[#c8923a]",
  c4: "border-l-[#8ab4d8]",
};

// 기도 카드 카테고리 텍스트 색 매핑
export const prayCardCatColor = {
  c1: "text-[#e8956a]",
  c2: "text-[#5a9a6a]",
  c3: "text-[#c8923a]",
  c4: "text-[#5a88b8]",
};