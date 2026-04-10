import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { prayerService } from "../services/prayerService"; // 실제 서비스 임포트 확인

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [relayStatus, setRelayStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. [핵심 수정] 목사님 전용 실시간 데이터 로드
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // 실제 API와 서비스를 통해 데이터를 동시에 가져옵니다.
      const [userRes, relayRes, dbPrayers] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/relay/status'),
        prayerService.getAllPrayers() // [수정] 가짜 데이터 대신 실제 DB의 모든 기도를 가져옴
      ]);

      const users = await userRes.json();
      const relay = await relayRes.json();

      setPendingUsers(users.filter(u => u.status === "PENDING"));
      setRelayStatus(relay);
      
      // [수정] DB에서 가져온 실제 기도 목록을 상태에 반영
      // 만약 prayerService.getAllPrayers()가 { success, data } 형태라면 dbPrayers.data로 넣어주세요.
      setPrayers(dbPrayers.success ? dbPrayers.data : dbPrayers);

    } catch (e) {
      console.error("데이터 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 2. 가입 승인 처리 로직 (기존 유지)
  const handleUserApproval = async (userId, decision) => {
    if (!window.confirm(`${decision === 'ACTIVE' ? '승인' : '반려'} 하시겠습니까?`)) return;
    const result = await authService.updateUserStatus(userId, decision);
    if (result.success) {
      alert("처리가 완료되었습니다.");
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="animate-pulse tracking-widest uppercase text-xs font-bold">관제 센터 데이터 동기화 중...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* 상단 헤더: 수동 새로고침 버튼 추가 */}
        <div className="flex justify-between items-center mb-10 bg-[#3a2e24] p-8 rounded-[2rem] text-white shadow-2xl">
          <div>
            <h1 className="text-3xl font-black font-serif tracking-tight">🏛️ 사역 관제 센터</h1>
            <p className="text-[#C5A059] mt-2 font-medium opacity-90">새학장교회 행정 및 영적 돌봄 시스템</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="bg-[#C5A059] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest">Administrator Mode</span>
            {/* [추가] 목사님을 위한 긴급 데이터 갱신 버튼 */}
            <button 
              onClick={fetchAdminData}
              className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1"
            >
              🔄 실시간 데이터 갱신
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ... 가입 승인 대기소 및 필사 현황 (기존 디자인 유지) ... */}
          
          {/* [좌측] 가입 승인 대기소 */}
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

          {/* [우측] 필사 현황 (기존 코드와 동일) */}
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

          {/* [하단 전체] 기도 제목 확인소 - 실제 데이터 노출 */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-[#3a2e24] mb-6 flex items-center gap-2">
              🕊️ 중보 기도 요청 (목사님 전용 실명 모드)
            </h3>
            <div className="overflow-x-auto">
              {prayers.length === 0 ? (
                <div className="text-center py-20 text-gray-400 italic font-serif">현재 접수된 기도 제목이 없습니다.</div>
              ) : (
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
                        <td className="p-4 text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}