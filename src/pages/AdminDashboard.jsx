import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { prayerService } from "../services/prayerService";

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [relayStatus, setRelayStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 목사님 전용 데이터 로드 (승인 대기자, 기도 제목, 필사 현황)
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // 실제 구현 시에는 각각의 API 경로에서 데이터를 가져옵니다.
        const [userRes, relayRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/relay/status')
        ]);

        const users = await userRes.json();
        const relay = await relayRes.json();

        // 승인 대기 중(PENDING)인 유저만 필터링
        setPendingUsers(users.filter(u => u.status === "PENDING"));
        setRelayStatus(relay);
        
        // 임시 기도 제목 데이터 (나중에 DB 연결)
        const mockPrayers = [
          { id: 1, authorName: "김성도", authorPhone: "010-1111-2222", content: "취업 준비로 마음이 힘듭니다..", createdAt: "2026-04-09" }
        ];
        setPrayers(mockPrayers);
      } catch (e) {
        console.error("데이터 로드 실패:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  // 2. [행정 결재] 가입 승인 및 반려 처리
  const handleUserApproval = async (userId, decision) => {
    if (!window.confirm(`${decision === 'ACTIVE' ? '승인' : '반려'} 하시겠습니까?`)) return;
    
    const result = await authService.updateUserStatus(userId, decision);
    if (result.success) {
      alert("처리가 완료되었습니다.");
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  if (loading) return <div className="p-10 text-center font-serif">관제 센터 시스템 가동 중...</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center mb-10 bg-[#3a2e24] p-8 rounded-[2rem] text-white shadow-2xl">
          <div>
            <h1 className="text-3xl font-black font-serif tracking-tight">🏛️ 사역 관제 센터</h1>
            <p className="text-[#C5A059] mt-2 font-medium opacity-90">새학장교회 행정 및 영적 돌봄 시스템</p>
          </div>
          <div className="text-right">
            <span className="bg-[#C5A059] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">Administrator Mode</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* [좌측] 회원 가입 결재 대기소 */}
          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-[#3a2e24] mb-6 flex items-center gap-2">
              👤 신규 가입 승인 대기 <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{pendingUsers.length}</span>
            </h3>
            <div className="space-y-4">
              {pendingUsers.length === 0 ? (
                <p className="text-gray-400 text-center py-10 italic">새로운 가입 신청이 없습니다.</p>
              ) : (
                pendingUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="font-bold text-[#3a2e24]">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUserApproval(u.id, 'ACTIVE')} className="px-4 py-2 bg-green-600 text-white text-xs rounded-lg font-bold hover:bg-green-700 transition-all">승인</button>
                      <button onClick={() => handleUserApproval(u.id, 'REJECTED')} className="px-4 py-2 bg-gray-200 text-gray-600 text-xs rounded-lg font-bold hover:bg-gray-300 transition-all">반려</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* [우측] 필사 릴레이 실시간 상황실 */}
          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-[#3a2e24] mb-6">📖 필사 사역 실시간 현황</h3>
            {relayStatus && (
              <div className="space-y-6">
                <div className="p-6 bg-[#F9F7F2] rounded-2xl border-l-4 border-[#C5A059]">
                  <p className="text-[10px] font-bold text-[#8b5e3c] uppercase mb-1">현재 필사 위치</p>
                  <p className="text-2xl font-serif font-bold text-[#3a2e24]">
                    {relayStatus.currentBookName} {relayStatus.currentChapterNum}장 {relayStatus.currentVerseNum}절
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 mb-1">현재 주자</p>
                    <p className="font-bold text-[#3a2e24]">{relayStatus.currentRunner?.name} 성도</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 mb-1">누적 구절</p>
                    <p className="font-bold text-[#3a2e24]">{relayStatus.verseCount} 구절</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* [하단 전체] 익명 기도 제목 실명 확인소 */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-[#3a2e24] mb-6 flex items-center gap-2">
              🕊️ 중보 기도 요청 (목사님 전용 실명 모드)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">작성자(실명)</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">기도 내용</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">연락처</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">날짜</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {prayers.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-all">
                      <td className="p-4 font-bold text-[#3a2e24]">{p.authorName}</td>
                      <td className="p-4 text-gray-600 break-keep">{p.content}</td>
                      <td className="p-4 text-sm text-[#C5A059] font-medium">{p.authorPhone}</td>
                      <td className="p-4 text-xs text-gray-400">{p.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}