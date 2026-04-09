import { useState, useEffect } from "react";

const NAV_CONFIG = {
  about: {
    label: "교회소개",
    subItems: [
      { label: "교회역사", key: "history" },
      { label: "담임목사 인사말", key: "pastor" },
      { label: "교회비전", key: "vision" },
    ],
  },
  worship: { label: "주일예배", key: "worship" },
  activity: {
    label: "교회활동",
    subItems: [
      { label: "찬양&워십", key: "worship_team" },
      { label: "지역봉사", key: "service" },
      { label: "주일학교", key: "school" },
    ],
  },
  bible_study: {
    label: "성경공부",
    subItems: [
      { label: "성경 필사", key: "bible" },
      { label: "필사 대시보드", key: "dashboard" },
    ],
  },
  prayer: { label: "고민 남기기", key: "prayer" },
  location: { label: "찾아오시는길", key: "location" },
};

export default function Navbar({ isLoggedIn, isAdmin, currentPage, onNavigate, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeNavKeys = Object.keys(NAV_CONFIG);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled ? "bg-[rgba(253,248,242,0.98)] shadow-md" : "bg-[rgba(253,248,242,0.94)]"
      }`}
      style={{
        borderColor: "rgba(200,146,58,0.2)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[68px]">
        
        {/* 로고 섹션 */}
        <button onClick={() => onNavigate("home")} className="flex flex-col text-left group">
          <span className="font-bold text-[1.1rem] text-[#8b5e3c] group-hover:text-[#c8923a] transition-colors">
            ✝ 새학장교회
          </span>
          <span className="text-[0.78rem] text-[#c8923a]">SaeHakjang Church</span>
        </button>

        {/* 데스크탑 내비게이션 */}
        <div className="hidden sm:flex items-center gap-1">
          <ul className="flex items-center list-none m-0 p-0 gap-[0.15rem]">
            {activeNavKeys.map((key) => {
              const item = NAV_CONFIG[key];
              const isSelected = currentPage === key;

              return (
                <li key={key} className="relative group">
                  <button
                    onClick={() => !item.subItems && onNavigate(key)}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      isSelected ? "text-[#c8923a]" : "text-[#3a2e24] hover:text-[#c8923a]"
                    }`}
                  >
                    {item.label}
                  </button>

                  {item.subItems && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-200">
                      <div className="flex items-center bg-white shadow-xl rounded-full border border-[#f5e6d3] overflow-hidden px-2">
                        {item.subItems.map((sub, idx) => (
                          <div key={sub.key} className="flex items-center">
                            <button
                              onClick={() => onNavigate(sub.key)}
                              className="whitespace-nowrap px-5 py-2.5 text-[0.85rem] text-[#5d4037] hover:bg-[#fdf8f2] hover:text-[#c8923a] transition-colors"
                            >
                              {sub.label}
                            </button>
                            {idx < item.subItems.length - 1 && (
                              <span className="w-[1px] h-3 bg-[#eee3d5]" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}

            {/* 로그인/로그아웃 버튼 */}
            <li className="ml-2">
              {!isLoggedIn ? (
                <button
                  onClick={() => onNavigate("login")}
                  className="px-4 py-1.5 rounded-full bg-[#c8923a] text-white text-sm font-medium hover:bg-[#8b5e3c] transition-all shadow-sm"
                >
                  로그인
                </button>
              ) : (
                <button
                  onClick={onLogout}
                  className="px-4 py-1.5 rounded-full bg-[#eee3d5] text-[#5d4037] text-sm font-medium hover:bg-gray-200 transition-all"
                >
                  로그아웃
                </button>
              )}
            </li>

            {/* ⭐ 관리자 버튼 보안 수정: App에서 넘겨받은 isAdmin이 true일 때만 노출 
                (App에서 이미 '관리자 주소'일 때만 true를 보내주도록 고쳤습니다) */}
            {isLoggedIn && isAdmin && (
              <li className="ml-1">
                <button
                  onClick={() => onNavigate("pastor-office")}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 rounded-full bg-red-50 hover:bg-red-100 animate-pulse shadow-sm"
                >
                  관제모드 ON
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button className="sm:hidden p-2 text-[#8b5e3c]" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* 모바일 메뉴 레이어 (관리자 버튼 포함) */}
      {menuOpen && (
        <div className="sm:hidden bg-[#fdf8f2] border-t border-[#f5e6d3] py-4 shadow-inner">
          {activeNavKeys.map((key) => {
            const item = NAV_CONFIG[key];
            return (
              <div key={key}>
                <button
                  onClick={() => {
                    if (!item.subItems) {
                      onNavigate(key);
                      setMenuOpen(false);
                    }
                  }}
                  className={`w-full text-left px-6 py-3 text-sm font-bold ${
                    item.subItems ? "text-[#8b5e3c] bg-[#f9f3eb]" : "text-[#3a2e24] active:bg-[#f5e6d3]"
                  }`}
                >
                  {item.label}
                </button>
                {item.subItems && (
                  <div className="bg-[#fcfaf7] pb-2">
                    {item.subItems.map((sub) => (
                      <button
                        key={sub.key}
                        onClick={() => {
                          onNavigate(sub.key);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-10 py-2.5 text-[0.85rem] text-[#5d4037] active:text-[#c8923a]"
                      >
                        • {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {/* 모바일 관리자 버튼 */}
          {isLoggedIn && isAdmin && (
            <button
              onClick={() => {
                onNavigate("pastor-office");
                setMenuOpen(false);
              }}
              className="w-full text-center py-4 text-red-600 font-bold bg-red-50 border-t border-red-100"
            >
              🏛️ 관리자 관제 센터 입장
            </button>
          )}
        </div>
      )}
    </nav>
  );
}