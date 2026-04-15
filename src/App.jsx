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

// [디자인부 신규] 주일예배 하위 사역 페이지 임포트
import Bulletin from "./pages/Bulletin";
import WorshipVideo from "./pages/WorshipVideo";

// ⭐ AuthContext 사용 (세션 관리의 핵심)
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppInner() {
  const { user, logout } = useAuth();
  
  // 새로고침 방어 로직 (localStorage 기반)
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("current_page");
    return savedPage || "home"; 
  });

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

  // 페이지 이동 함수 (UX 최적화: 상단 이동 포함)
  const navigate = (page) => {
    console.log("📍 페이지 이동:", page);
    localStorage.setItem("current_page", page); 
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // [최종 최적화된 렌더링 엔진]
  const renderPage = () => {
    // 1. 공용 보안 체크: 로그인이 필요한 페이지 리스트
    // [보안강화] 주보와 예배영상도 보호가 필요한 경우 리스트에 추가
    const protectedPages = ["prayer", "dashboard", "adminDashboard", "bible", "worship_video", "bulletin"];
    
    if (protectedPages.includes(currentPage) && !isLoggedIn) {
      return <Login onNavigate={navigate} />;
    }

    // 2. 관리자 전용 보안 체크: 일반 유저가 adminDashboard 주소로 접근 시 차단
    if (currentPage === "adminDashboard" && !isAdmin) {
      console.warn("⛔ 경고: 관리자 권한 없는 접근 감지");
      return <Home onNavigate={navigate} currentUser={user} />;
    }

    // 3. 스위칭 로직 (디자인부 요청 사항 100% 반영)
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={navigate} user={user} />;

      case "adminDashboard":
        return <AdminDashboard onNavigate={navigate} user={user} />;

      // [신설] 주일예배 영상 (서버 API와 연동될 예정)
      case "worship_video":
        return <WorshipVideo onNavigate={navigate} />;

      // [신설] 주간 주보 (PDF 뷰어 연동 예정)
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