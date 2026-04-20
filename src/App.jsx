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
  const isAdmin = user && user.role === "admin"; // 비회원(null) 안전 처리

  const navigate = (page) => {
    console.log("📍 페이지 이동:", page);
    localStorage.setItem("current_page", page); 
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // 🛠️ [렌더링 엔진: 개방형 사역 환경 구축]
  const renderPage = () => {
    
    // 1. 행정 관제 센터 (보안 유지: 관리자만 진입 가능)
    if (currentPage === "adminDashboard" || currentPage === "admin-office") {
      if (!isAdmin) {
        console.warn("⛔ 행정 센터는 관리자 전용입니다.");
        return <Home onNavigate={navigate} currentUser={user} />;
      }
      return <AdminDashboard onNavigate={navigate} user={user} />;
    }

    // 2. 공용 보안 체크 (기도요청, 대시보드, 성경필사만 로그인 필수)
    // ⭐ worship_video와 bulletin을 여기서 제거하여 비회원에게 개방했습니다.
    const protectedPages = ["prayer", "dashboard", "bible"];
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
      console.log("🔒 로그인 필요 페이지 - 로그인으로 이동");
      return <Login onNavigate={navigate} />;
    }

    // 3. 페이지 스위칭 로직 (로그인 여부와 무관하게 접근 가능한 공용 사역 공간)
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