import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [relayStatus, setRelayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 현재 로그인한 사람 정보 (authService에서 가져옴)
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("🔍 서버 데이터 동기화 시작...");

      // 1. [서버 호환] 필사 현황 로드 (/api/relay/status)
      const relayRes = await fetch('/api/relay/status')
        .then(res => res.json())
        .catch(() => null);
      if (relayRes) setRelayStatus(relayRes);

      // 2. [서버 호환] 관리자용 신도 명단 로드 (/api/admin/users)
      const usersRes = await fetch('/api/admin/users')
        .then(res => res.json())
        .catch(() => []);
      if (Array.isArray(usersRes)) {
        // PENDING 상태인 성도만 승인 대기 목록에 표시
        setPendingUsers(usersRes.filter(u => u.status === "PENDING"));
      }

      // 3. [서버 호환] 기도 제목 로드 (/api/prayers)
      // 서버 규격: { success: true, data: PRAYERS }
      const prayerRes = await fetch('/api/prayers')
        .then(res => res.json())
        .catch(() => ({ success: false, data: [] }));
      
      if (prayerRes && prayerRes.success && Array.isArray(prayerRes.data)) {
        const allPrayers = prayerRes.data;
        if (isAdmin) {
          setPrayers(allPrayers);
        } else {
          // 성도는 본인 번호와 일치하는 것만 필터링 (하이픈 제거 후 비교)
          const myPhone = currentUser?.phone?.replace(/-/g, "");
          setPrayers(allPrayers.filter(p => 
            p.authorPhone?.replace(/-/g, "") === myPhone
          ));
        }
      }

    } catch (e) {
      console.error("❌ 대시보드 로드 중 연결 오류:", e);
    } finally {
      // 로딩 바를 끄고 화면을 보여줍니다.
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  // 승인 처리 로직
  const handleUserApproval = async (userId, decision) => {
    if (!isAdmin) return;
    if (!window.confirm(`${decision === 'ACTIVE' ? '승인' : '반려'} 하시겠습니까?`)) return;
    
    // authService의 승인 로직 호출
    const result = await authService.updateUserStatus(userId, decision);
    if (result.success) {
      alert("처리가 완료되었습니다.");
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  // 로딩 화면 (기존 디자인 유지)
  if (loading) return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="animate-pulse tracking-widest uppercase text-xs font-bold font-sans">은혜의 기록을 불러오는 중...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* 상단 헤더: 권한에 따라 제목 분기 */}
        <div className="flex justify-between items-center mb-10 bg-[#3a2e24] p-8 rounded-[2rem] text-white shadow-2xl">
          <div>
            <h1 className="text-3xl font-black font-serif tracking-tight">
              {isAdmin ? "🏛️ 사역 관제 센터" : "🕊️ 나의 사역 현황"}
            </h1>
            <p className="text-[#C5A059] mt-2 font-medium opacity-90 text-sm">
              {isAdmin ? "새학장교회 전체 행정 및 영적 돌봄" : `${currentUser?.name} 성도님의 신앙 기록`}
            </p>
          </div>
          <button onClick={fetchDashboardData} className="text-xs text-white/60 hover:text-white transition-all flex items-center gap-1 active:scale-95">
            🔄 실시간 새로고침
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. 필사 현황 카드 (서버 relayStatus 데이터 표시) */}
          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-[#3a2e24] mb-6 font-serif">📖 성경 필사 진행 현황</h3>
            {relayStatus ? (
              <div className="space-y-6">
                <div className="p-6 bg-[#F9F7F2] rounded-2xl border-l-4 border-[#C5A059]">
                  <p className="text-[10px] font-bold text-[#8b5e3c] uppercase mb-1">현재 필사 위치</p>
                  <p className="text-2xl font-serif font-bold text-[#3a2e24]">
                    {relayStatus.currentBookName} {relayStatus.currentChapterNum}장 {relayStatus.currentVerseNum}절
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 mb-1 text-[10px] font-bold uppercase">현재 주자</p>
                    <p className="font-bold text-[#3a2e24]">{relayStatus.currentRunner?.name} 성도님</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 mb-1 text-[10px] font-bold uppercase">누적 구절</p>
                    <p className="font-bold text-[#3a2e24]">{relayStatus.verseCount} 구절</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-10 italic font-sans text-sm">필사 데이터를 불러올 수 없습니다.</p>
            )}
          </div>

          {/* 2. 관리자(승인) 또는 안내 문구 카드 */}
          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-200">
            {isAdmin ? (
              <>
                <h3 className="text-xl font-bold text-[#3a2e24] mb-6 font-serif flex items-center gap-2">
                  👤 가입 승인 대기 <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-sans font-bold">{pendingUsers.length}</span>
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {pendingUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="font-bold text-sm text-[#3a2e24]">{u.name} ({u.phone})</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleUserApproval(u.id, 'ACTIVE')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-green-700 transition-all">승인</button>
                        <button onClick={() => handleUserApproval(u.id, 'REJECTED')} className="bg-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-gray-300 transition-all">반려</button>
                      </div>
                    </div>
                  ))}
                  {pendingUsers.length === 0 && <p className="text-center text-gray-400 py-10 italic text-sm">신규 신청이 없습니다.</p>}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <span className="text-4xl mb-4">🌿</span>
                <p className="text-[#3a2e24] font-serif font-bold mb-2">사역의 동역자님!</p>
                <p className="text-xs text-gray-400 leading-relaxed font-sans font-medium">
                  성경 필사는 개인의 성장이자 <br/>새학장 공동체의 거룩한 릴레이입니다.
                </p>
              </div>
            )}
          </div>

          {/* 3. 하단 기도 제목 테이블 (서버 PRAYERS 데이터 표시) */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-[#3a2e24] mb-6 font-serif">
              {isAdmin ? "🕊️ 전체 중보 기도 요청" : "🕊️ 나의 기도 제목 기록"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {isAdmin && <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">작성자</th>}
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">기도 내용</th>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">날짜</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {prayers.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-all cursor-default">
                      {isAdmin && <td className="p-4 font-bold text-sm text-[#3a2e24]">{p.authorName}</td>}
                      <td className="p-4 text-sm text-gray-600 leading-relaxed">{p.content}</td>
                      <td className="p-4 text-[10px] text-gray-400 font-mono text-right">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {prayers.length === 0 && <p className="text-center py-20 text-gray-400 font-sans italic text-sm">기록된 기도 제목이 없습니다.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}