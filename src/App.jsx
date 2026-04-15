import { useState, useEffect } from "react";

// 디자인팀 최신 컴포넌트 및 페이지 임포트
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard"; 
import AdminDashboard from "./pages/AdminDashboard"; 
import PrayerBoard from "./pages/PrayerBoard";
import ChurchHistory from "./pages/ChurchHistory";
import PastorGreeting from "./pages/PastorGreeting";
import Vision from "./pages/Vision";
import BibleWrite from "./pages/BibleWrite";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pending from "./pages/Pending";

// [디자인부 추가] 주일예배 하위 사역 페이지 임포트
import Bulletin from "./pages/Bulletin";
import WorshipVideo from "./pages/WorshipVideo";

// ⭐ AuthContext 사용 (세션 관리의 핵심)
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppInner() {
  const { user, logout } = useAuth();
  
  // 새로고침 방어 로직 유지
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("current_page");
    return savedPage || "home"; 
  });

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

  // 페이지 이동 함수
  const navigate = (page) => {
    console.log("📍 페이지 이동:", page);
    localStorage.setItem("current_page", page); 
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // [최종 최적화된 렌더링 엔진]
  const renderPage = () => {
    // 1. 보안이 필요한 페이지 리스트
    const protectedPages = ["prayer", "dashboard", "adminDashboard", "bible"];
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
      return <Login onNavigate={navigate} />;
    }

    // 2. 스위칭 로직 (새로운 주일예배 페이지 추가)
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={navigate} user={user} />;

      case "adminDashboard":
        return <AdminDashboard onNavigate={navigate} user={user} />;

      // [디자인부 추가] 예배영상 및 주보 로직 연결
      case "worship_video":
        return <WorshipVideo onNavigate={navigate} />;

      case "bulletin":
        return <Bulletin onNavigate={navigate} />;

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
        isAdmin={isAdmin}
        currentPage={currentPage}
        onLogout={handleManualLogout} 
        user={user}
      />

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