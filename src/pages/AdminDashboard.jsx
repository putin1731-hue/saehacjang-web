import React, { useState, useEffect } from "react";

// 외부 파일 참조 오류를 해결하기 위해 authService 임포트를 제거하고
// 상위 컴포넌트(App.jsx)로부터 전달받은 user 객체를 사용하도록 수정했습니다.
export default function AdminDashboard({ onNavigate, user }) {
  const [activeTab, setActiveTab] = useState("users"); // 기본 탭: 회원 관리
  const [pendingUsers, setPendingUsers] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [transcriptionStatus, setTranscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // 상위에서 전달받은 user를 현재 사용자로 설정합니다.
  const currentUser = user;
  const isAdmin = currentUser?.role === 'admin';

  // 🛠️ [행정 데이터 동기화 엔진]
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // 1. 전체 유저 명단 로드 및 새가족(PENDING) 필터링
      const usersRes = await fetch('/api/admin/users')
        .then(res => res.ok ? res.json() : [])
        .catch(() => []);
      
      setPendingUsers(usersRes.filter(u => u.status === "PENDING"));

      // 2. 중보기도 요청 로드
      const prayerRes = await fetch('/api/prayers')
        .then(res => res.json())
        .catch(() => ({ success: false, data: [] }));
      if (prayerRes?.success) setPrayers(prayerRes.data);

      // 3. 필사 진행 현황 로드 (server.js의 relayStatus와 동기화)
      const relayRes = await fetch('/api/relay/status')
        .then(res => res.json())
        .catch(() => null);
        
      setTranscriptionStatus(relayRes);

    } catch (e) {
      console.error("행정 데이터 로드 오류:", e);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    // 보안 체크: 관리자가 아니거나 user 정보가 없으면 홈으로 리다이렉트
    if (!currentUser || currentUser.role !== 'admin') {
      alert("관리자 권한이 필요합니다.");
      onNavigate("home");
      return;
    }
    fetchAdminData();
  }, [currentUser]);

  // 👤 [회원 승인/반려 처리 로직]
  const handleUserApproval = async (userId, decision) => {
    const actionName = decision === 'ACTIVE' ? '승인' : '반려';
    if (!window.confirm(`${actionName} 처리하시겠습니까?`)) return;

    try {
      const res = await fetch('/api/admin/update-user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: decision })
      });

      if (res.ok) {
        await fetchAdminData();
      } else {
        alert("처리에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (e) { 
      alert("서버 연결 오류가 발생했습니다."); 
    }
  };

  const ADMIN_TABS = [
    { id: "users", label: "새가족 승인", icon: "👤" },
    { id: "prayer", label: "기도요청 확인", icon: "🕊️" },
    { id: "transcription", label: "필사 현황", icon: "📖" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold tracking-widest animate-pulse uppercase font-sans">사역 관제 데이터 동기화 중...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9f2e8] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* 상단 타이틀 섹션 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#3a2e24] font-serif tracking-tight">🏛️ 사역 관제 센터</h1>
            <p className="text-[#8b5e3c] font-medium opacity-70 mt-1">새학장교회 행정 및 영적 돌봄 시스템</p>
          </div>
          <button 
            onClick={fetchAdminData} 
            className="px-4 py-2 bg-white/40 hover:bg-white text-[#8b5e3c] text-xs font-bold rounded-xl border border-[#8b5e3c]/20 transition-all active:scale-95 flex items-center gap-2"
          >
            🔄 실시간 명단 갱신
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* [좌측 메뉴] */}
          <div className="lg:col-span-1 space-y-3">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.8rem] text-sm font-bold transition-all transform ${
                  activeTab === tab.id 
                    ? "bg-[#3a2e24] text-white shadow-2xl translate-x-2" 
                    : "bg-white/60 text-[#8b5e3c] hover:bg-white hover:shadow-md"
                }`}
              >
                <span className="text-xl">{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* [우측 컨텐츠 영역] */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl min-h-[550px] border border-[#f5e6d3]">
              
              {/* 1. 회원 관리 (새가족 승인) */}
              {activeTab === "users" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-[#3a2e24] font-serif">👤 신규 가입 승인 대기</h3>
                    <span className="bg-[#C5A059] text-white px-3 py-1 rounded-full text-[10px] font-bold">
                      {pendingUsers.length}명 대기
                    </span>
                  </div>
                  
                  {pendingUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                      <span className="text-4xl mb-4 opacity-30">🌿</span>
                      <p className="text-gray-400 italic font-serif">현재 새로운 등록 신청이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingUsers.map(u => (
                        <div key={u.id} className="flex flex-col sm:flex-row justify-between items-center p-6 bg-[#fdf8f2] rounded-[2rem] border border-[#f5e6d3] hover:shadow-md transition-all">
                          <div className="mb-4 sm:mb-0 text-center sm:text-left">
                            <p className="text-lg font-bold text-[#3a2e24]">{u.name}</p>
                            <p className="text-sm text-[#8b5e3c] opacity-70 font-mono">{u.phone}</p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                              신청일: {new Date(u.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUserApproval(u.id, 'ACTIVE')} 
                              className="px-8 py-3 bg-[#3a2e24] text-white rounded-full text-sm font-bold shadow-lg hover:bg-black transition-all active:scale-95"
                            >
                              승인
                            </button>
                            <button 
                              onClick={() => handleUserApproval(u.id, 'REJECTED')} 
                              className="px-6 py-3 bg-white text-gray-400 rounded-full text-sm font-bold border border-gray-100 hover:bg-gray-50 transition-all"
                            >
                              반려
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. 중보기도 요청 확인 */}
              {activeTab === "prayer" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-2xl font-bold text-[#3a2e24] font-serif mb-6">🕊️ 성도 중보기도 요청함</h3>
                  <div className="space-y-4">
                    {prayers.length === 0 ? (
                      <p className="text-center py-20 text-gray-300 italic">도착한 기도 제목이 없습니다.</p>
                    ) : (
                      prayers.map(p => (
                        <div key={p.id} className="p-7 bg-[#fdf8f2] rounded-3xl border border-[#f5e6d3] relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#c8923a] opacity-50 group-hover:opacity-100 transition-all"></div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-black text-[#c8923a] bg-[#c8923a]/10 px-3 py-1 rounded-full">
                              {p.isAnonymous ? "👤 익명 성도" : `👤 ${p.authorName} 성도`}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">{new Date(p.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[#3a2e24] leading-relaxed italic font-medium">"{p.content}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 3. 성경 필사 진행 현황 */}
              {activeTab === "transcription" && transcriptionStatus && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-2xl font-bold text-[#3a2e24] font-serif mb-6">📖 성경 필사 사역 모니터링</h3>
                  
                  {/* 메인 현황 카드 */}
                  <div className="p-8 bg-[#3a2e24] text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl">📜</div>
                    <p className="text-[10px] text-[#C5A059] font-bold mb-3 uppercase tracking-[0.2em]">현재 필사 구절</p>
                    <h4 className="text-3xl font-serif font-bold mb-6">
                      {transcriptionStatus.currentBookName} {transcriptionStatus.currentChapterNum}장 {transcriptionStatus.currentVerseNum}절
                    </h4>
                    <div className="flex justify-between items-end border-t border-white/10 pt-6">
                      <div>
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">진행 주자</p>
                        <p className="text-lg font-bold">{transcriptionStatus.currentRunner?.name} 성도</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/40 uppercase font-bold mb-1">누적 구절</p>
                        <p className="text-3xl font-black text-[#C5A059]">{transcriptionStatus.totalVerseCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* 팀별 진행도 섹션 */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold text-[#8b5e3c] uppercase tracking-widest border-l-4 border-[#C5A059] pl-3">팀별 진행도</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {transcriptionStatus.teamProgress.map((team, idx) => (
                        <div key={idx} className="bg-[#fdf8f2] p-5 rounded-3xl border border-[#f5e6d3]">
                          <div className="flex justify-between items-end mb-3">
                            <span className="text-sm font-bold text-[#3a2e24]">{team.name}</span>
                            <span className="text-xl font-black text-[#C5A059]">{team.progress}%</span>
                          </div>
                          <div className="h-2 bg-white rounded-full overflow-hidden border border-gray-100">
                            <div 
                              className="h-full bg-[#C5A059] shadow-[0_0_8px_rgba(197,160,89,0.4)] transition-all duration-1000" 
                              style={{ width: `${team.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
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