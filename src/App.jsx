import { useState, useEffect } from "react";

// 기존 임포트 유지
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
import Bulletin from "./pages/Bulletin";
import WorshipVideo from "./pages/WorshipVideo";

import { AuthProvider, useAuth } from "./context/AuthContext";

function AppInner() {
  const { user, logout } = useAuth();
  
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("current_page");
    return savedPage || "home"; 
  });

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

  const navigate = (page) => {
    console.log("📍 페이지 이동:", page);
    localStorage.setItem("current_page", page); 
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // [수정된 렌더링 엔진: 주소 체계 이원화]
  const renderPage = () => {
    // 1. 관리자 전용 통로 (admin-office) 분리
    // 주소가 adminDashboard 혹은 admin-office일 때 관리자 체크
    if (currentPage === "adminDashboard" || currentPage === "admin-office") {
      if (!isAdmin) {
        console.warn("⛔ 관리자 외 접근 차단");
        return <Home onNavigate={navigate} currentUser={user} />;
      }
      // 관리자라면 로딩 걱정 없는 전용 대시보드로 연결
      return <AdminDashboard onNavigate={navigate} user={user} />;
    }

    // 2. 공용 보안 체크 (기존 유지)
    const protectedPages = ["prayer", "dashboard", "bible", "worship_video", "bulletin"];
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
      return <Login onNavigate={navigate} />;
    }

    // 3. 일반 페이지 스위칭 (기본 기능 유지)
    switch (currentPage) {
      case "dashboard": return <Dashboard onNavigate={navigate} user={user} />;
      case "worship_video": return <WorshipVideo onNavigate={navigate} />;
      case "bulletin": return <Bulletin onNavigate={navigate} />;
      case "history": return <ChurchHistory onNavigate={navigate} />;
      case "pastor": return <PastorGreeting onNavigate={navigate} />;
      case "vision": return <Vision onNavigate={navigate} />;
      case "login": return <Login onNavigate={navigate} />;
      case "signup": return <Signup onNavigate={navigate} />;
      case "pending": return <Pending onNavigate={navigate} />;
      case "prayer": return <PrayerBoard currentUser={user} onNavigate={navigate} />;
      case "bible": return <BibleWrite onFinish={() => navigate("home")} />;
      case "home":
      default: return <Home onNavigate={navigate} currentUser={user} />;
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