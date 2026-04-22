import { useState, useEffect } from "react";
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
  
  // 새로고침 시에도 페이지 유지
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("current_page");
    return savedPage || "home"; 
  });

  const isLoggedIn = !!user;
  const isAdmin = user && user.role === "admin";

  const navigate = (page) => {
    localStorage.setItem("current_page", page); 
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // 🛠️ [페이지 렌더링 엔진: 보안 계층 설정]
  const renderPage = () => {
    
    // 🟢 [보안 계층 1] 관리자 관제 센터 (adminDashboard)
    if (currentPage === "adminDashboard" || currentPage === "admin-office") {
      if (!isAdmin) {
        console.warn("⛔ 관리자 전용 구역입니다. 홈으로 이동합니다.");
        return <Home onNavigate={navigate} currentUser={user} />;
      }
      // [수정] AdminDashboard에 user 정보 전달
      return <AdminDashboard onNavigate={navigate} user={user} />;
    }

    // 🟡 [보안 계층 2] 성도 전용 페이지 (Dashboard, 필사, 기도)
    const protectedPages = ["dashboard", "bible", "prayer"];
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
      console.log("🔒 로그인 후 이용 가능한 메뉴입니다.");
      return <Login onNavigate={navigate} />;
    }

    // ⚪ [보안 계층 3] 사역 개방 페이지 및 기타 (기존 로직 유지)
    switch (currentPage) {
      case "worship_video": 
        return <WorshipVideo onNavigate={navigate} />;
      
      case "bulletin": 
        return <Bulletin onNavigate={navigate} />;

      case "dashboard": 
        return <Dashboard onNavigate={navigate} user={user} />;
      
      case "prayer": 
        return <PrayerBoard currentUser={user} onNavigate={navigate} />;
      
      case "bible": 
        // [수정] BibleWrite가 끝났을 때 홈으로 이동하도록 설정
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