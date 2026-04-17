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

  // [수정된 렌더링 엔진: 관리자 기능 및 기존 페이지 완벽 호환]
  const renderPage = () => {
    
    // 1. 관리자 전용 보안 통로 (이원화 주소 대응)
    // adminDashboard 혹은 admin-office 주소로 접근 시
    if (currentPage === "adminDashboard" || currentPage === "admin-office") {
      if (!isAdmin) {
        console.warn("⛔ 관리자 외 접근 차단됨");
        return <Home onNavigate={navigate} currentUser={user} />;
      }
      // 관리자일 경우 최신 업데이트 기능이 포함된 대시보드 렌더링
      return <AdminDashboard onNavigate={navigate} user={user} />;
    }

    // 2. 공용 보안 체크 (로그인 필수 페이지)
    const protectedPages = ["prayer", "dashboard", "bible", "worship_video", "bulletin"];
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
      console.log("🔒 로그인 필요 페이지 접근 - 로그인으로 리다이렉트");
      return <Login onNavigate={navigate} />;
    }

    // 3. 페이지 스위칭 로직 (기존 디자인 및 기능 100% 유지)
    switch (currentPage) {
      case "dashboard": 
        return <Dashboard onNavigate={navigate} user={user} />;
      
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