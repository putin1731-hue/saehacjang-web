import React, { useState, useEffect, Suspense } from "react";

// 페이지 컴포넌트 임포트 (기존과 동일)
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
  
  // [개정] 첫 접속 시 무조건 home으로 고정
  const [currentPage, setCurrentPage] = useState("home");

  // [수정] 오직 'pastor-office' 페이지에 있을 때만 Navbar에 관리자 메뉴(빨간 버튼)가 보이게 설정
  const isLoggedIn = !!user;
  const isPastorOffice = currentPage === "pastor-office";
  const showAdminMenu = user?.role === "admin" && isPastorOffice;

  const navigate = (page) => {
    console.log(`🚀 [시스템 이동] ${page}`);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  /* ─────────────────────────────────────────────────────────────
     [보안 관제 엔진] 기획관님 지침 반영
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    // 1. 첫 접속 시 자동 로그아웃 (사람들이 처음 들어왔을 때 로그아웃 상태를 보장)
    // 이 로직은 배포 초기 테스트 시 사용자들이 깨끗한 상태로 시작하게 돕습니다.
    // 만약 계속 자동 로그아웃되는 게 불편하시면 이 useEffect를 주석 처리하세요.
    const isFirstVisit = !sessionStorage.getItem("visited");
    if (isFirstVisit) {
      logout();
      sessionStorage.setItem("visited", "true");
    }
  }, [logout]);

  useEffect(() => {
    const protectedPages = ["bible", "dashboard", "prayer"];
    const adminOnlyPages = ["pastor-office"];

    // 2. 비로그인 사용자 차단
    if (protectedPages.includes(currentPage) && !authLoading && !isLoggedIn) {
      navigate("login");
    }

    // 3. 관리자 전용 구역 보안 체크
    if (adminOnlyPages.includes(currentPage) && !authLoading) {
      if (user?.role !== "admin") {
        console.error("⛔ [접근 거부] 일반 성도는 진입할 수 없습니다.");
        navigate("home"); // 관리자 아니면 홈으로 쫓아냄
      }
    }
  }, [currentPage, isLoggedIn, user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="animate-pulse tracking-widest text-xs font-bold text-[#C5A059]">서버 연결 중...</p>
        </div>
      </div>
    );
  }

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
      case "pastor-office": 
        return user?.role === "admin" ? <AdminDashboard onNavigate={navigate} /> : <Home onNavigate={navigate} />;
      case "home":
      default: return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] font-sans">
      <Navbar
        onNavigate={navigate}
        isLoggedIn={isLoggedIn}
        isAdmin={showAdminMenu} // [핵심] pastor-office 주소일 때만 true가 넘어감
        currentPage={currentPage}
        onLogout={() => {
          if (window.confirm("로그아웃하시겠습니까?")) {
            logout();
            navigate("home");
          }
        }}
      />

      <main className="pt-[75px] animate-in fade-in duration-700">
        <Suspense fallback={<div className="bg-[#F9F7F2] h-screen" />}>
          {renderPage()}
        </Suspense>
      </main>

      <footer className="py-12 bg-white border-t border-[#E9DCC9] mt-20 text-center">
        <p className="text-[11px] text-[#8b5e3c] font-serif tracking-widest opacity-60 uppercase">
          Digital Sanctuary &copy; 2026. All Rights Reserved.
        </p>
      </footer>
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