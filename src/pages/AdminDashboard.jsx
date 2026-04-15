import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";

export default function AdminDashboard({ onNavigate }) {
  // --- 기존 상태 ---
  const [activeTab, setActiveTab] = useState("worship");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [relayStatus, setRelayStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 추가 (기존 영향 없음)
  const [youtubeId, setYoutubeId] = useState("");
  const [bulletinFile, setBulletinFile] = useState(null);

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const relayRes = await fetch('/api/relay/status').then(res => res.json()).catch(() => null);
      if (relayRes) setRelayStatus(relayRes);

      const usersRes = await fetch('/api/admin/users').then(res => res.json()).catch(() => []);
      if (Array.isArray(usersRes)) {
        setPendingUsers(usersRes.filter(u => u.status === "PENDING"));
      }

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

  const handleUserApproval = async (userId, decision) => {
    if (!isAdmin) return;
    if (!window.confirm(`${decision === 'ACTIVE' ? '승인' : '반려'} 하시겠습니까?`)) return;

    const result = await authService.updateUserStatus(userId, decision);
    if (result.success) {
      alert("처리가 완료되었습니다.");
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  // ✅ 추가 기능
  const handleWorshipSave = async () => {
    if (!youtubeId) {
      alert("유튜브 ID를 입력하세요");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("youtubeId", youtubeId);
      if (bulletinFile) {
        formData.append("file", bulletinFile);
      }

      const res = await fetch("/api/worship", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("저장 완료!");
        setYoutubeId("");
        setBulletinFile(null);
      } else {
        alert("저장 실패");
      }
    } catch (e) {
      console.error(e);
      alert("에러 발생");
    }
  };

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

        {/* 상단 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#3a2e24] font-serif tracking-tight">
              {isAdmin ? "사역 관제 센터" : "나의 사역 현황"}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* 좌측 탭 */}
          <div className="lg:col-span-1 space-y-2">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-bold ${
                  activeTab === tab.id
                    ? "bg-[#3a2e24] text-white"
                    : "bg-white/60 text-[#8b5e3c]"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 우측 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] p-8">

              {/* ================== 주일예배 ================== */}
              {activeTab === "worship" && (
                <div className="space-y-6">

                  {/* 유튜브 */}
                  <input
                    type="text"
                    value={youtubeId} // ✅ 연결
                    onChange={(e) => setYoutubeId(e.target.value)} // ✅ 추가
                    placeholder="예: yz7X1X2X3X4"
                    className="w-full p-4 rounded-2xl border"
                  />

                  {/* 파일 */}
                  <input
                    type="file"
                    onChange={(e) => setBulletinFile(e.target.files[0])} // ✅ 추가
                  />

                  {/* 버튼 */}
                  <button
                    onClick={handleWorshipSave} // ✅ 연결
                    className="w-full py-4 bg-[#c8923a] text-white rounded-xl"
                  >
                    홈페이지에 즉시 반영하기
                  </button>
                </div>
              )}

              {/* 기존 기능 그대로 */}
              {activeTab === "bible" && (
                <div>
                  {pendingUsers.map(u => (
                    <div key={u.id}>
                      {u.name}
                      <button onClick={() => handleUserApproval(u.id, 'ACTIVE')}>승인</button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "prayer" && (
                <div>
                  {prayers.map(p => (
                    <div key={p.id}>{p.content}</div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}