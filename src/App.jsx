import React, { useState, useEffect, Suspense } from "react";

// 디자인 및 기능 페이지 임포트
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

// 인증 및 세션 컨텍스트
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppInner() {
  const { user, logout, loading: authLoading } = useAuth();
  
  // [강철 세션] 브라우저 새로고침 시에도 마지막 페이지 유지
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("current_page") || "home";
  });

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

  // [이동 로직] 페이지 이동 시 기록 저장 및 스크롤 상단 이동
  const navigate = (page) => {
    console.log(`🚀 [시스템 이동] ${currentPage} -> ${page}`);
    localStorage.setItem("current_page", page);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // [보안 로직] 비로그인 사용자의 사역 페이지 접근 차단
  useEffect(() => {
    const protectedPages = ["bible", "dashboard", "prayer"];
    if (protectedPages.includes(currentPage) && !authLoading && !isLoggedIn) {
      console.warn("⚠️ [보안 알림] 접근 권한이 없습니다. 로그인 페이지로 이동합니다.");
      navigate("login");
    }
  }, [currentPage, isLoggedIn, authLoading]);

  // 로딩 화면 (성소 동기화 중)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="animate-pulse tracking-widest uppercase text-xs font-bold">Sanctuary Syncing...</p>
        </div>
      </div>
    );
  }

  // [라우팅 엔진] 기획관님의 Navbar key값과 1:1 매칭
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
      case "home":
      default: return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] font-sans selection:bg-[#C5A059] selection:text-white">
      {/* 기획관님의 최신 Navbar */}
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

      {/* 푸터 영역 */}
      <footer className="py-12 bg-white border-t border-[#E9DCC9] mt-20 text-center">
        <p className="text-[11px] text-[#8b5e3c] font-serif tracking-widest opacity-60 uppercase">
          Digital Sanctuary &copy; 2026. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

// 최상단 래퍼
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}