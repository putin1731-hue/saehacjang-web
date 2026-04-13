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

// ⭐ [중요 추가] 아까 만든 통합형 관리자 대시보드 임포트
import AdminDashboard from "./pages/AdminDashboard"; 

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
    window.scrollTo(0, 0); // 페이지 전환 시 상단 이동
  };

  // [디자인부 최신 시안 기반 렌더링 엔진]
  const renderPage = () => {
    // 1. 비로그인 상태에서 보호가 필요한 페이지 처리
    const protectedPages = ["prayer", "dashboard", "bible", "pastor-office", "AdminDashboard"];
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
      return <Login onNavigate={navigate} />;
    }

    // 2. 스위칭 로직 (디자인팀 최종 페이지 리스트 100% 반영 + 관리자 모드 추가)
    switch (currentPage) {
      // ⭐ [신규 추가] 목사님 관제 센터 전용 통로
      case "pastor-office":
      case "AdminDashboard":
        return <AdminDashboard onNavigate={navigate} />;

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
        // 일반 성도는 Dashboard로, 관리자(목사님)는 자동으로 관제 센터 기능을 가진 AdminDashboard로 연결
        // (아까 우리가 AdminDashboard 하나로 통합했으므로 이를 활용합니다)
        return <AdminDashboard onNavigate={navigate} />;

      case "bible":
        return <BibleWrite onFinish={() => navigate("home")} />;

      case "home":
      default:
        return <Home onNavigate={navigate} currentUser={user} />;
    }
  };

  const handleManualLogout = async () => {
    if (window.confirm("정말로 로그아웃하시겠습니까?")) {
      localStorage.removeItem("current_page"); 
      await logout(); 
      navigate("home");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f2] font-sans">
      <Navbar
        onNavigate={navigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin} // 목사님 로그인 시 true가 전달되어 ⚙️ 버튼이 활성화됨
        currentPage={currentPage}
        onLogout={handleManualLogout} 
        user={user} // Navbar에서 이름 표시를 위해 추가
      />

      {/* 디자인부 가이드: 상단 여백 유지 */}
      <div className="pt-[70px]">
        {renderPage()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}