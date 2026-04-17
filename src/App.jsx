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

// AuthContext 사용
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppInner() {
  const { user, logout } = useAuth();
  
  // 새로고침 시에도 페이지 유지
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

  // [수정된 렌더링 엔진: 사역 현장 개방형 구조]
  const renderPage = () => {
    
    // 1. 행정 관제 센터 (회원 승인, 기도 관리, 필사 팀 현황 전용)
    // 오직 관리자(목사님)만 진입 가능한 순수 행정 통로입니다.
    if (currentPage === "adminDashboard" || currentPage === "admin-office") {
      if (!isAdmin) {
        console.warn("⛔ 관리자 외 접근 차단됨 (행정 센터)");
        return <Home onNavigate={navigate} currentUser={user} />;
      }
      return <AdminDashboard onNavigate={navigate} user={user} />;
    }

    // 2. 사역 현장 및 보안 체크 (성도용 필수 페이지)
    // 예배 영상과 주보를 이 공용 통로로 이동시켰습니다.
    const protectedPages = ["prayer", "dashboard", "bible", "worship_video", "bulletin"];
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
      console.log("🔒 로그인 필요 페이지 접근 - 로그인으로 이동");
      return <Login onNavigate={navigate} />;
    }

    // 3. 페이지 스위칭 로직 (성도/관리자 공용 공간)
    switch (currentPage) {
      case "dashboard": 
        return <Dashboard onNavigate={navigate} user={user} />;
      
      // ⭐ 예배 영상과 주보는 이제 모든 성도가 들어올 수 있습니다.
      // 내부 로직에 의해 관리자에게만 편집 버튼이 노출됩니다.
      case "worship_video": 
        return <WorshipVideo onNavigate={navigate} />;
      
      case "bulletin": 
        return <Bulletin onNavigate={navigate} />;
      
      case "prayer": 
        return <PrayerBoard currentUser={user} onNavigate={navigate} />;
      
      case "bible": 
        return <BibleWrite onFinish={() => navigate("home")} />;

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
      
      {/* Navbar 높이를 고려한 패딩 */}
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