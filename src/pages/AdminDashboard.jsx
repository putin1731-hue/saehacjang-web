import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { prayerService } from "../services/prayerService";

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [relayStatus, setRelayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 현재 로그인한 사람 정보 가져오기
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. 필사 현황은 목사님/성도 공통으로 보여줍니다.
      const relayRes = await fetch('/api/relay/status').then(res => res.json()).catch(() => null);
      if (relayRes) setRelayStatus(relayRes);

      if (isAdmin) {
        // [목사님 전용] 모든 가입 대기자와 모든 기도 제목 로드
        const usersRes = await fetch('/api/admin/users').then(res => res.json()).catch(() => null);
        if (usersRes) setPendingUsers(usersRes.filter(u => u.status === "PENDING"));

        const prayerRes = await prayerService.getAllPrayers();
        if (prayerRes.success) setPrayers(prayerRes.data);
      } else {
        // [성도 전용] 본인의 기도 제목만 로드 (사생활 보호)
        const prayerRes = await prayerService.getAllPrayers();
        if (prayerRes.success) {
          const mine = prayerRes.data.filter(p => p.authorPhone === currentUser.phone);
          setPrayers(mine);
        }
      }
    } catch (e) {
      console.error("데이터 동기화 중 오류:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  // 가입 승인 로직 (목사님만 사용)
  const handleUserApproval = async (userId, decision) => {
    if (!isAdmin) return;
    if (!window.confirm(`${decision === 'ACTIVE' ? '승인' : '반려'} 하시겠습니까?`)) return;
    const result = await authService.updateUserStatus(userId, decision);
    if (result.success) {
      alert("처리가 완료되었습니다.");
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  if (loading) return <div className="p-20 text-center font-serif text-[#C5A059]">은혜의 기록을 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* 상단 헤더: 권한에 따라 제목 변경 */}
        <div className="flex justify-between items-center mb-10 bg-[#3a2e24] p-8 rounded-[2rem] text-white shadow-2xl">
          <div>
            <h1 className="text-3xl font-black font-serif tracking-tight">
              {isAdmin ? "🏛️ 사역 관제 센터" : "🕊️ 나의 사역 현황"}
            </h1>
            <p className="text-[#C5A059] mt-2 font-medium opacity-90">
              {isAdmin ? "새학장교회 전체 행정 시스템" : `${currentUser.name} 성도님의 영적 여정`}
            </p>
          </div>
          <button onClick={fetchDashboardData} className="text-xs text-white/60 hover:text-white transition-all flex items-center gap-1">
            🔄 실시간 새로고침
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. 필사 현황 (공통 노출) */}
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
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-500 mb-1 text-xs font-bold uppercase">현재 주자</p>
                  <p className="font-bold text-[#3a2e24]">{relayStatus.currentRunner?.name} 성도님</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-10 italic">필사 데이터를 불러올 수 없습니다.</p>
            )}
          </div>

          {/* 2. 목사님이면 '가입 승인', 성도면 '안내 문구' */}
          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-200">
            {isAdmin ? (
              <>
                <h3 className="text-xl font-bold text-[#3a2e24] mb-6 font-serif flex items-center gap-2">
                  👤 가입 승인 대기 <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{pendingUsers.length}</span>
                </h3>
                <div className="space-y-3">
                  {pendingUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="font-bold">{u.name} ({u.phone})</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleUserApproval(u.id, 'ACTIVE')} className="bg-green-600 text-white px-3 py-1 rounded text-xs">승인</button>
                        <button onClick={() => handleUserApproval(u.id, 'REJECTED')} className="bg-gray-300 text-gray-600 px-3 py-1 rounded text-xs">반려</button>
                      </div>
                    </div>
                  ))}
                  {pendingUsers.length === 0 && <p className="text-center text-gray-400 py-10">신규 신청이 없습니다.</p>}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-6">
                <span className="text-4xl mb-4">🌿</span>
                <p className="text-[#3a2e24] font-serif font-bold mb-2">사역의 동역자님!</p>
                <p className="text-xs text-gray-400 leading-relaxed">성경 필사는 개인의 성장이자 <br/>새학장 공동체의 거룩한 릴레이입니다.</p>
              </div>
            )}
          </div>

          {/* 3. 기도 제목 (목사님은 전체, 성도는 본인 것만) */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-[#3a2e24] mb-6 font-serif">
              {isAdmin ? "🕊️ 전체 중보 기도 요청" : "🕊️ 나의 기도 제목 기록"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {isAdmin && <th className="p-4 text-xs font-bold text-gray-500">작성자</th>}
                    <th className="p-4 text-xs font-bold text-gray-500">기도 내용</th>
                    <th className="p-4 text-xs font-bold text-gray-500">날짜</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {prayers.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      {isAdmin && <td className="p-4 font-bold text-xs">{p.authorName}</td>}
                      <td className="p-4 text-sm text-gray-600">{p.content}</td>
                      <td className="p-4 text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {prayers.length === 0 && <p className="text-center py-20 text-gray-400">기록된 기도 제목이 없습니다.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}