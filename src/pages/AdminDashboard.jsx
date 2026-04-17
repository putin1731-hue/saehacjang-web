import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";

export default function AdminDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("users"); // 기본 탭: 회원 관리
  const [pendingUsers, setPendingUsers] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [transcriptionStatus, setTranscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  // 🛠️ 데이터 로드 (행정/사역 데이터 중심)
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // 1. 새가족 승인 대기 명단 로드
      const usersRes = await fetch('/api/admin/users').then(res => res.json()).catch(() => []);
      setPendingUsers(usersRes.filter(u => u.status === "PENDING"));

      // 2. 중보기도 요청 로드
      const prayerRes = await fetch('/api/prayers').then(res => res.json()).catch(() => ({ success: false, data: [] }));
      if (prayerRes?.success) setPrayers(prayerRes.data);

      // 3. 필사 진행 현황 로드 (임시 데이터 포함)
      const relayRes = await fetch('/api/relay/status').then(res => res.json()).catch(() => null);
      setTranscriptionStatus(relayRes || {
        currentBookName: "마태복음",
        currentChapterNum: 5,
        currentVerseNum: 1,
        currentRunner: { name: "이준혁" },
        totalVerseCount: 1254,
        teamProgress: [
          { name: "사랑팀", progress: 75 },
          { name: "소망팀", progress: 62 },
          { name: "믿음팀", progress: 88 }
        ]
      });

    } catch (e) {
      console.error("행정 데이터 로드 오류:", e);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    if (currentUser && !isAdmin) {
      alert("관리자 권한이 없습니다.");
      onNavigate("home");
      return;
    }
    fetchAdminData();
  }, []);

  // 👤 회원 승인/반려 로직
  const handleUserApproval = async (userId, decision) => {
    if (!window.confirm(`${decision === 'ACTIVE' ? '승인' : '반려'} 하시겠습니까?`)) return;
    try {
      const res = await fetch('/api/admin/update-user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: decision })
      });
      if (res.ok) {
        alert("처리가 완료되었습니다.");
        fetchAdminData();
      }
    } catch (e) { alert("처리 오류"); }
  };

  const ADMIN_TABS = [
    { id: "users", label: "새가족 승인", icon: "👤" },
    { id: "prayer", label: "기도요청 확인", icon: "🕊️" },
    { id: "transcription", label: "필사 현황", icon: "📖" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059]">
      <div className="text-center animate-pulse">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold">사역 관제 데이터 동기화 중...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9f2e8] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#3a2e24] font-serif tracking-tight">🏛️ 사역 관제 센터</h1>
            <p className="text-[#8b5e3c] font-medium opacity-70">행정 및 영적 돌봄 시스템</p>
          </div>
          <button onClick={fetchAdminData} className="text-xs text-[#8b5e3c] underline active:scale-95">실시간 갱신</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 좌측 메뉴 */}
          <div className="lg:col-span-1 space-y-2">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-bold transition-all ${
                  activeTab === tab.id ? "bg-[#3a2e24] text-white shadow-xl" : "bg-white/60 text-[#8b5e3c] hover:bg-white"
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* 우측 컨텐츠 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm min-h-[500px] border border-[#f5e6d3]">
              
              {/* 1. 회원 관리 (새가족 승인) */}
              {activeTab === "users" && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <h3 className="text-xl font-bold text-[#3a2e24] mb-6">👤 신규 가입 승인 대기 명단</h3>
                  {pendingUsers.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400 italic">승인 대기 중인 새가족이 없습니다.</div>
                  ) : (
                    pendingUsers.map(u => (
                      <div key={u.id} className="flex justify-between items-center p-6 bg-[#fdf8f2] rounded-3xl border border-[#f5e6d3]">
                        <div>
                          <p className="text-lg font-bold text-[#3a2e24]">{u.name}</p>
                          <p className="text-sm text-[#8b5e3c] opacity-70">{u.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleUserApproval(u.id, 'ACTIVE')} className="px-6 py-3 bg-[#3a2e24] text-white rounded-xl text-sm font-bold shadow-md hover:bg-black">승인</button>
                          <button onClick={() => handleUserApproval(u.id, 'REJECTED')} className="px-6 py-3 bg-white text-gray-400 rounded-xl text-sm font-bold border border-gray-100 hover:bg-gray-50">반려</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 2. 중보기도 요청 확인 */}
              {activeTab === "prayer" && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <h3 className="text-xl font-bold text-[#3a2e24] mb-6">🕊️ 성도 중보기도 요청함</h3>
                  <div className="space-y-3">
                    {prayers.map(p => (
                      <div key={p.id} className="p-6 bg-[#fdf8f2] rounded-2xl border border-[#f5e6d3]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-[#c8923a]">{p.isAnonymous ? "👤 익명 성도" : `👤 ${p.authorName} 성도`}</span>
                          <span className="text-[10px] text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-[#3a2e24] leading-relaxed italic">"{p.content}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. 성경 필사 진행 현황 */}
              {activeTab === "transcription" && transcriptionStatus && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <h3 className="text-xl font-bold text-[#3a2e24] mb-6">📖 성경 필사 사역 현황</h3>
                  <div className="p-6 bg-[#3a2e24] text-white rounded-[2rem] shadow-xl">
                    <p className="text-xs text-[#C5A059] font-bold mb-2 uppercase tracking-widest">현재 필사 구절</p>
                    <h4 className="text-2xl font-serif font-bold mb-4">{transcriptionStatus.currentBookName} {transcriptionStatus.currentChapterNum}장 {transcriptionStatus.currentVerseNum}절</h4>
                    <div className="flex justify-between items-end border-t border-white/10 pt-4">
                      <span className="text-sm opacity-70">진행 주자: {transcriptionStatus.currentRunner?.name} 성도</span>
                      <span className="text-lg font-black text-[#C5A059]">{transcriptionStatus.totalVerseCount} 구절 누적</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#8b5e3c]">팀별 진행도</h4>
                    {transcriptionStatus.teamProgress.map((team, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-[#3a2e24]">
                          <span>{team.name}</span>
                          <span>{team.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#C5A059] transition-all duration-1000" style={{ width: `${team.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}