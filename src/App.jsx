import React, { useState, useEffect, Suspense } from "react";

// 페이지 컴포넌트 임포트
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
import AdminDashboard from "./pages/AdminDashboard";

// 인증 및 세션 컨텍스트
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppInner() {
  const { user, logout, loading: authLoading } = useAuth();
  
  // [개정] 사용자가 처음 들어올 때는 무조건 'home' 화면이 나오도록 초기값 고정
  const [currentPage, setCurrentPage] = useState("home");

  const isLoggedIn = !!user;
  // user 객체의 role이 admin인지 확인하여 마스터키 권한 부여
  const isAdmin = user?.role === "admin";

  const navigate = (page) => {
    console.log(`🚀 [시스템 이동] ${currentPage} -> ${page}`);
    // 나중에 다시 들어올 때를 위해 페이지를 기억하고 싶다면 저장, 
    // 하지만 첫 접속은 항상 home이어야 하므로 useState 초기값은 "home" 유지
    localStorage.setItem("current_page", page);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  /* ─────────────────────────────────────────────────────────────
     [보안 관제 엔진] 특정 페이지 접근 권한 실시간 체크
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const protectedPages = ["bible", "dashboard", "prayer"];
    const adminOnlyPages = ["pastor-office"]; // 목사님 전용 관제 센터

    // 1. 비로그인 사용자 차단 (필사, 대시보드, 기도 게시판)
    if (protectedPages.includes(currentPage) && !authLoading && !isLoggedIn) {
      console.warn("⚠️ [보안 알림] 성도 인증이 필요한 메뉴입니다. 로그인으로 이동합니다.");
      navigate("login");
    }

    // 2. 관리자 전용 구역 보안 체크 (일반 성도가 접근 시 대시보드로 회송)
    if (adminOnlyPages.includes(currentPage) && !authLoading) {
      if (!isAdmin) {
        console.error("⛔ [접근 거부] 관리자 전용 구역입니다. 접근이 차단되었습니다.");
        navigate("dashboard");
      }
    }
  }, [currentPage, isLoggedIn, isAdmin, authLoading]);

  // 시스템 로딩 화면 (Sanctuary Syncing...)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="animate-pulse tracking-widest uppercase text-xs font-bold">새학장 서버 연결 중...</p>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     [라우팅 엔진] 현재 페이지 상태에 따라 컴포넌트 렌더링
  ───────────────────────────────────────────────────────────── */
  const renderPage = () => {
    switch (currentPage) {
      case "pastor": return <PastorGreeting onNavigate={navigate} />;
      case "vision": return <Vision onNavigate={navigate} />;
      case "history": return <ChurchHistory onNavigate={navigate} />;
      case "bible": return <BibleWrite onFinish={() => navigate("home")} />;
      case "dashboard": return <Dashboard onNavigate={navigate} />;
      case "prayer": return <PrayerBoard currentUser={user} onNavigate={navigate} />;
      case "login": return <Login onNavigate={navigate} />;
      case "signup": return <Signup onNavigate={navigate} />;
      case "pending": return <Pending />;
      
      // 관리자 전용 비밀 통로 (AdminDashboard)
      case "pastor-office": 
        return isAdmin ? <AdminDashboard onNavigate={navigate} /> : <Dashboard onNavigate={navigate} />;

      case "home":
      default: return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] font-sans selection:bg-[#C5A059] selection:text-white">
      {/* 상단 네비게이션 바 */}
      <Navbar
        onNavigate={navigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        currentPage={currentPage}
        onLogout={() => {
          if (window.confirm("로그아웃하시겠습니까?")) {
            logout();
            navigate("home");
          }
        }}
      />

      {/* 메인 콘텐츠 영역 */}
      <main className="pt-[75px] animate-in fade-in duration-700">
        <Suspense fallback={<div className="bg-[#F9F7F2] h-screen" />}>
          {renderPage()}
        </Suspense>
      </main>

      {/* 하단 푸터 */}
      <footer className="py-12 bg-white border-t border-[#E9DCC9] mt-20 text-center">
        <p className="text-[11px] text-[#8b5e3c] font-serif tracking-widest opacity-60 uppercase">
          Saehacjang Digital Sanctuary &copy; 2026. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

// 최상위 App 컴포넌트: 전역 인증 상태(AuthProvider) 주입
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}