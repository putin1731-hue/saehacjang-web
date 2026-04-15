import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";

export default function AdminDashboard({ onNavigate }) {
  // --- [기술부] 기존 상태 관리 로직 보존 ---
  const [activeTab, setActiveTab] = useState("worship"); // 기본 탭: 주일예배
  const [pendingUsers, setPendingUsers] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [relayStatus, setRelayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  // --- [기술부] 기존 데이터 페칭 함수 (호환성 유지) ---
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. 필사 현황
      const relayRes = await fetch('/api/relay/status').then(res => res.json()).catch(() => null);
      if (relayRes) setRelayStatus(relayRes);

      // 2. 관리자용 신도 명단
      const usersRes = await fetch('/api/admin/users').then(res => res.json()).catch(() => []);
      if (Array.isArray(usersRes)) {
        setPendingUsers(usersRes.filter(u => u.status === "PENDING"));
      }

      // 3. 기도 제목 로드
      const prayerRes = await fetch('/api/prayers').then(res => res.json()).catch(() => ({ success: false, data: [] }));
      if (prayerRes?.success && Array.isArray(prayerRes.data)) {
        const allPrayers = prayerRes.data;
        if (isAdmin) {
          setPrayers(allPrayers);
        } else {
          const myPhone = currentUser?.phone?.replace(/-/g, "");
          setPrayers(allPrayers.filter(p => p.authorPhone?.replace(/-/g, "") === myPhone));
        }
      }
    } catch (e) {
      console.error("❌ 데이터 로드 오류:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  // --- [기술부] 승인 처리 로직 보존 ---
  const handleUserApproval = async (userId, decision) => {
    if (!isAdmin) return;
    if (!window.confirm(`${decision === 'ACTIVE' ? '승인' : '반려'} 하시겠습니까?`)) return;
    
    const result = await authService.updateUserStatus(userId, decision);
    if (result.success) {
      alert("처리가 완료되었습니다.");
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  // 탭 네비게이션 구성
  const ADMIN_TABS = [
    { id: "worship", label: "주일예배/주보", icon: "⛪" },
    { id: "bible", label: "필사/가입승인", icon: "📖" },
    { id: "prayer", label: "중보기도", icon: "🕊️" },
    { id: "gallery", label: "활동사진", icon: "📸" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="animate-pulse tracking-widest uppercase text-xs font-bold font-sans">은혜의 기록을 불러오는 중...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9f2e8] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* 상단 헤더 섹션 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#3a2e24] font-serif tracking-tight">
              {isAdmin ? "사역 관제 센터" : "나의 사역 현황"}
            </h1>
            <p className="text-[#c8923a] font-bold text-sm mt-1">
              {isAdmin ? "목사님 모드로 접속 중입니다" : `${currentUser?.name} 성도님, 평안하신지요?`}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchDashboardData} className="px-4 py-2 bg-white/50 text-[10px] font-bold text-[#8b5e3c] rounded-full hover:bg-white transition-all">
              🔄 실시간 새로고침
            </button>
            <button onClick={() => onNavigate("home")} className="px-6 py-2 bg-white border border-[#e9dcc9] text-[#8b5e3c] rounded-full text-xs font-bold shadow-sm hover:bg-[#fdf8f2] transition-all">
              메인으로 ➔
            </button>
          </div>
        </div>

        {/* 메인 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* 좌측 메뉴 (탭) */}
          <div className="lg:col-span-1 space-y-2">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-bold transition-all ${
                  activeTab === tab.id 
                  ? "bg-[#3a2e24] text-white shadow-xl translate-x-2" 
                  : "bg-white/60 text-[#8b5e3c] hover:bg-white border border-[#e9dcc9]/50"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 우측 콘텐츠 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-[#e9dcc9] p-8 md:p-10 min-h-[600px]">
              
              {/* 1. 주일예배/주보 관리 (디자인부 기획) */}
              {activeTab === "worship" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 border-b border-[#f9f2e8] pb-6">
                    <span className="text-2xl">📅</span>
                    <h3 className="text-xl font-bold text-[#3a2e24]">주일예배 업데이트</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#c8923a] uppercase tracking-widest ml-1">유튜브 설교 영상 ID</label>
                      <input type="text" placeholder="예: yz7X1X2X3X4" className="w-full p-4 rounded-2xl border-2 border-[#f9f2e8] focus:border-[#c8923a] outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#c8923a] uppercase tracking-widest ml-1">이번 주 온라인 주보</label>
                      <div className="border-2 border-dashed border-[#e9dcc9] rounded-[1.5rem] p-10 text-center hover:bg-[#fdf8f2] transition-colors cursor-pointer">
                        <span className="text-3xl block mb-2">📄</span>
                        <p className="text-xs text-[#8b5e3c]">주보 파일(PDF/JPG) 선택</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-5 bg-[#c8923a] text-white rounded-[1.5rem] font-black shadow-lg hover:bg-[#3a2e24] transition-all">
                    홈페이지에 즉시 반영하기
                  </button>
                </div>
              )}

              {/* 2. 필사 현황 및 가입 승인 (기존 기능 통합) */}
              {activeTab === "bible" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {/* 필사 현황 카드 */}
                  <div className="p-6 bg-[#fdf8f2] rounded-3xl border border-[#e9dcc9]/50">
                    <h4 className="text-[#8b5e3c] font-bold text-sm mb-4">📖 실시간 필사 위치</h4>
                    {relayStatus ? (
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-2xl font-black text-[#3a2e24] font-serif">
                            {relayStatus.currentBookName} {relayStatus.currentChapterNum}장 {relayStatus.currentVerseNum}절
                          </p>
                          <p className="text-xs text-[#c8923a] mt-1">현재 주자: {relayStatus.currentRunner?.name} 성도님</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">누적 구절</p>
                          <p className="text-xl font-black text-[#3a2e24]">{relayStatus.verseCount}</p>
                        </div>
                      </div>
                    ) : <p className="text-gray-400 text-sm italic">데이터가 없습니다.</p>}
                  </div>

                  {/* 승인 대기 목록 (관리자 전용) */}
                  {isAdmin && (
                    <div className="space-y-4">
                      <h4 className="text-[#3a2e24] font-bold flex items-center gap-2">
                        👤 승인 대기 신규 성도 <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px]">{pendingUsers.length}</span>
                      </h4>
                      <div className="space-y-2">
                        {pendingUsers.map(u => (
                          <div key={u.id} className="flex items-center justify-between p-4 bg-white border border-[#e9dcc9]/50 rounded-2xl shadow-sm">
                            <span className="font-bold text-sm text-[#3a2e24]">{u.name} ({u.phone})</span>
                            <div className="flex gap-2">
                              <button onClick={() => handleUserApproval(u.id, 'ACTIVE')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-green-700">승인</button>
                              <button onClick={() => handleUserApproval(u.id, 'REJECTED')} className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-gray-200">반려</button>
                            </div>
                          </div>
                        ))}
                        {pendingUsers.length === 0 && <p className="text-center text-gray-400 py-10 italic text-xs">신규 신청이 없습니다.</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. 중보기도 관리 (기존 기능 통합) */}
              {activeTab === "prayer" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <h3 className="text-xl font-bold text-[#3a2e24] border-b pb-4">🕊️ 중보기도 요청 목록</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#fdf8f2] text-[10px] text-[#c8923a] font-black uppercase">
                        <tr>
                          {isAdmin && <th className="p-4">작성자</th>}
                          <th className="p-4">기도 제목</th>
                          <th className="p-4 text-right">날짜</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f9f2e8]">
                        {prayers.map(p => (
                          <tr key={p.id} className="text-sm text-[#5d4037] hover:bg-[#fdf8f2]/50 transition-colors">
                            {isAdmin && <td className="p-4 font-bold">{p.authorName}</td>}
                            <td className="p-4 leading-relaxed">{p.content}</td>
                            <td className="p-4 text-[10px] text-gray-400 text-right">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {prayers.length === 0 && <p className="text-center py-20 text-gray-400 italic text-xs">기록된 기도 제목이 없습니다.</p>}
                  </div>
                </div>
              )}

              {/* 4. 활동 사진 관리 (확장용) */}
              {activeTab === "gallery" && (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-300">
                  <span className="text-5xl mb-4">📸</span>
                  <p className="italic text-sm">활동 사진 아카이브 기능은 현재 준비 중입니다.</p>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}