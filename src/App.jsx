import { useState, useEffect } from "react";

// 디자인팀 최신 컴포넌트 및 페이지 누락 없이 임포트
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PrayerBoard from "./pages/PrayerBoard";
import ChurchHistory from "./pages/ChurchHistory";
import PastorGreeting from "./pages/PastorGreeting";
import Vision from "./pages/Vision";
import BibleWrite from "./pages/BibleWrite";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pending from "./pages/Pending";

// ⭐ AuthContext 사용 (세션 관리의 핵심)
import { AuthProvider, useAuth } from "./context/AuthContext";

/* ─────────────────────────────────────────
   디자인 정체성 유지 + 세션 고정 로직 통합
───────────────────────────────────────── */

function AppInner() {
  const { user, logout } = useAuth();
  
  // [기술부 핵심 수정] 초기값 자체를 localStorage에서 즉시 복구 (새로고침 방어)
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("current_page");
    return savedPage || "home"; 
  });

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

  // 페이지 이동 시 즉시 브라우저에 각인 (디자인부 UX 흐름 보존)
  const navigate = (page) => {
    console.log("📍 페이지 이동 및 세션 기록:", page);
    localStorage.setItem("current_page", page); 
    setCurrentPage(page);
    window.scrollTo(0, 0); // 페이지 전환 시 상단 이동 (UX 가이드 준수)
  };

  // [디자인부 최신 시안 기반 렌더링 엔진]
  const renderPage = () => {
    // 1. 비로그인 상태에서 보호가 필요한 페이지 처리 (튕김 방지 및 보안)
    const protectedPages = ["prayer", "dashboard", "bible"];
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
      return <Login onNavigate={navigate} />;
    }

    // 2. 스위칭 로직 (디자인팀 최종 페이지 리스트 100% 반영)
    switch (currentPage) {
      case "history":
        return <ChurchHistory onNavigate={navigate} />;

      case "pastor":
        return <PastorGreeting onNavigate={navigate} />;

      case "vision":
        return <Vision onNavigate={navigate} />;

      case "login":
        return <Login onNavigate={navigate} />;

      case "signup":
        return <Signup onNavigate={navigate} />;

      case "pending":
        return <Pending onNavigate={navigate} />;

      case "prayer":
        return <PrayerBoard currentUser={user} onNavigate={navigate} />;

      case "dashboard":
        return <Dashboard user={user} onNavigate={navigate} />;

      case "bible":
        // 디자인부의 최신 정밀 필사 엔진 (onFinish 시 홈으로 안전하게 복귀)
        return <BibleWrite onFinish={() => navigate("home")} />;

      case "home":
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  // [수정] 인위적인 로그아웃 버튼 클릭 시에만 세션 파기
  const handleManualLogout = async () => {
    if (window.confirm("정말로 로그아웃하시겠습니까?")) {
      localStorage.removeItem("current_page"); // 보던 페이지 기록 삭제
      await logout(); // AuthContext의 logout 호출 (세션 제거)
      navigate("home");
    }
  };

  return (
    // 디자인부 가이드: 배경색 #fdf8f2 및 폰트 설정 엄수
    <div className="min-h-screen bg-[#fdf8f2] font-sans">
      <Navbar
        onNavigate={navigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        currentPage={currentPage}
        onLogout={handleManualLogout} 
      />

      {/* 디자인부 네비바 높이(70px)를 고려한 상단 여백 유지 */}
      <div className="pt-[70px]">
        {renderPage()}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   AuthProvider로 감싸기 (시스템의 심장)
───────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}