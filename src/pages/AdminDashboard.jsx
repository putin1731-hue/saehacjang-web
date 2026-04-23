import React, { useState, useEffect } from "react";

// 🚀 [수정 1] API_BASE를 비워두거나 상대 경로를 사용해야 배포 후에도 작동합니다.
const API_BASE = ""; 

export default function AdminDashboard({ onNavigate, user }) {
  const [activeTab, setActiveTab] = useState("users");
  const [allUsers, setAllUsers] = useState([]); // [변경] 대기자만이 아닌 전체 유저 이력
  const [prayers, setPrayers] = useState([]);
  const [transcriptionStatus, setTranscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = user;

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // 1. 유저 목록 (가입 이력 전체)
      const usersRes = await fetch(`${API_BASE}/api/admin/users`);
      if (!usersRes.ok) throw new Error("유저 조회 실패");
      const usersData = await usersRes.json();
      
      // 🚀 [수정 2] PENDING 필터를 풀고 가입 날짜순(최신순)으로 전체 이력을 보여줍니다.
      setAllUsers(usersData); 

      // 2. 기도 목록
      const prayerRes = await fetch(`${API_BASE}/api/prayers`);
      if (!prayerRes.ok) throw new Error("기도 조회 실패");
      const prayerData = await prayerRes.json();
      setPrayers(prayerData.data || []);

      // 3. 필사 상태
      const relayRes = await fetch(`${API_BASE}/api/relay/status`);
      if (!relayRes.ok) throw new Error("필사 상태 조회 실패");
      const relayData = await relayRes.json();
      setTranscriptionStatus(relayData);

    } catch (e) {
      console.error("행정 데이터 로드 오류:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert("관리자 권한이 필요합니다.");
      onNavigate("home");
      return;
    }
    fetchAdminData();
  }, [currentUser]);

  const ADMIN_TABS = [
    { id: "users", label: "교적 등록 이력", icon: "👤" },
    { id: "prayer", label: "기도요청 확인", icon: "🕊️" },
    { id: "transcription", label: "필사 현황", icon: "📖" },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf8f2]">
      <p className="text-[#8b5e3c] font-bold">새학장교회 행정 데이터 동기화 중...</p>
    </div>
  );

  return (
    <div className="p-6 bg-[#fdf8f2] min-h-screen">
      <h1 className="text-2xl font-bold text-[#3a2e24] mb-6 font-serif">관리자 센터</h1>

      {/* 상단 탭 */}
      <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm">
        {ADMIN_TABS.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id ? "bg-[#8b5e3c] text-white shadow-md" : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 1. 교적 등록 이력 (최근 가입자순) */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#3a2e24] px-1">최근 등록 현황 ({allUsers.length}명)</h2>
          {allUsers.length === 0 ? (
            <p className="text-center py-10 text-gray-400 bg-white rounded-2xl">아직 등록된 성도가 없습니다.</p>
          ) : (
            allUsers.map(u => (
              <div key={u.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#3a2e24]">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold">정회원</span>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. 중보기도 관리 */}
      {activeTab === "prayer" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#3a2e24] px-1">기도 제목함</h2>
          {prayers.length === 0 ? (
            <p className="text-center py-10 text-gray-400 bg-white rounded-2xl">도달한 기도 제목이 없습니다.</p>
          ) : (
            prayers.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-[#3a2e24] leading-relaxed mb-3">"{p.content}"</p>
                <p className="text-xs text-[#c8923a] font-bold">
                  — {p.isAnonymous ? "어느 익명의 성도" : `${p.authorName} 성도`}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. 필사 현황 (조회용) */}
      {activeTab === "transcription" && transcriptionStatus && (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm text-center">
          <p className="text-[#c8923a] text-xs font-bold uppercase tracking-widest mb-2">Relay Progress</p>
          <h2 className="text-3xl font-serif font-bold text-[#3a2e24] mb-4">
            {transcriptionStatus.currentBookName} {transcriptionStatus.currentChapterNum}:{transcriptionStatus.currentVerseNum}
          </h2>
          <div className="inline-block px-6 py-2 bg-brown-50 text-brown-600 rounded-full font-bold">
            누적 {transcriptionStatus.totalVerseCount}절 필사 중
          </div>
        </div>
      )}
    </div>
  );
}