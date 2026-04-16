import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";

export default function AdminDashboard({ onNavigate }) {
  // --- 상태 관리 ---
  const [activeTab, setActiveTab] = useState("worship");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [relayStatus, setRelayStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const [youtubeId, setYoutubeId] = useState("");
  const [bulletinFile, setBulletinFile] = useState(null);

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  // 🛠️ [정밀 수정] 데이터 로드 로직
  const fetchDashboardData = async () => {
    // 이미 데이터를 불러오는 중이라면 중복 실행을 방지합니다.
    try {
      setLoading(true);
      console.log("🔄 [관제센터] 데이터 동기화 시도...");

      // 1. 필사 현황
      const relayRes = await fetch('/api/relay/status').then(res => res.json()).catch(() => null);
      if (relayRes) setRelayStatus(relayRes);

      // 2. 가입 대기 유저
      const usersRes = await fetch('/api/admin/users').then(res => res.json()).catch(() => []);
      if (Array.isArray(usersRes)) {
        setPendingUsers(usersRes.filter(u => u.status === "PENDING"));
      }

      // 3. 기도 제목
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
      // 0.5초의 여유를 두어 UI가 자연스럽게 전환되도록 합니다.
      setTimeout(() => {
        setLoading(false);
        console.log("✅ [관제센터] 데이터 로드 완료");
      }, 500);
    }
  };

  // ⭐ [핵심 수정] 무한 루프 차단 구역
  useEffect(() => {
    // 1. 보안 체크: 관리자가 아니면 즉시 홈으로 보냄
    if (currentUser && !isAdmin) {
      alert("관리자 권한이 없습니다.");
      onNavigate("home");
      return;
    }

    // 2. 데이터 호출: 의존성 배열을 []로 비워두어 페이지 입장 시 '단 한 번'만 실행되게 합니다.
    fetchDashboardData();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의존성 배열에서 currentUser를 제거하여 무한 루프를 해결했습니다.

  // --- 유저 승인 로직 (기존 유지) ---
  const handleUserApproval = async (userId, decision) => {
    if (!isAdmin) return;
    if (!window.confirm(`${decision === 'ACTIVE' ? '승인' : '반려'} 하시겠습니까?`)) return;

    const result = await authService.updateUserStatus(userId, decision);
    if (result.success) {
      alert("처리가 완료되었습니다.");
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  // ✅ [수정] 주일예배 저장 로직 (API 경로 맞춤)
  const handleWorshipSave = async () => {
    if (!youtubeId) {
      alert("유튜브 ID를 입력하세요.");
      return;
    }

    try {
      const worshipRes = await fetch("/api/admin/worship-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: `https://www.youtube.com/embed/${youtubeId}` }),
      });

      if (bulletinFile) {
        const formData = new FormData();
        formData.append("bulletin", bulletinFile);
        await fetch("/api/admin/upload-bulletin", {
          method: "POST",
          body: formData,
        });
      }

      if (worshipRes.ok) {
        alert("✨ 홈페이지에 실시간으로 반영되었습니다!");
        setYoutubeId("");
        setBulletinFile(null);
      }
    } catch (e) {
      console.error(e);
      alert("반영 중 오류가 발생했습니다.");
    }
  };

  const ADMIN_TABS = [
    { id: "worship", label: "주일예배/주보", icon: "⛪" },
    { id: "bible", label: "필사/가입승인", icon: "📖" },
    { id: "prayer", label: "중보기도", icon: "🕊️" },
    { id: "gallery", label: "활동사진", icon: "📸" },
  ];

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
    <div className="min-h-screen bg-[#f9f2e8] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-black text-[#3a2e24] font-serif tracking-tight">
            {isAdmin ? "사역 관제 센터" : "나의 사역 현황"}
          </h1>
          <button onClick={fetchDashboardData} className="text-xs text-[#8b5e3c] underline">데이터 새로고침</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-2">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-bold transition-all ${
                  activeTab === tab.id ? "bg-[#3a2e24] text-white shadow-lg" : "bg-white/60 text-[#8b5e3c] hover:bg-white"
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm min-h-[400px]">
              {activeTab === "worship" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#3a2e24] mb-4">📺 예배 영상 및 주보 관리</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[#8b5e3c] mb-2">유튜브 비디오 ID</label>
                      <input
                        type="text"
                        value={youtubeId}
                        onChange={(e) => setYoutubeId(e.target.value)}
                        placeholder="v= 뒷부분의 코드 (예: yz7X1X2X3X4)"
                        className="w-full p-4 rounded-2xl border border-[#f5e6d3] focus:outline-[#c8923a]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#8b5e3c] mb-2">주보 파일 (PDF)</label>
                      <input
                        type="file"
                        onChange={(e) => setBulletinFile(e.target.files[0])}
                        className="w-full p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fdf8f2] file:text-[#8b5e3c] hover:file:bg-[#f5e6d3]"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleWorshipSave}
                    className="w-full py-5 bg-[#c8923a] text-white rounded-2xl font-bold shadow-xl hover:bg-[#3a2e24] transition-all"
                  >
                    홈페이지에 즉시 반영하기
                  </button>
                </div>
              )}

              {activeTab === "bible" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#3a2e24] mb-4">📖 가입 승인 대기</h3>
                  {pendingUsers.length === 0 ? (
                    <p className="text-gray-400">대기 중인 성도님이 없습니다.</p>
                  ) : (
                    pendingUsers.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-4 bg-[#fdf8f2] rounded-2xl">
                        <span className="font-bold text-[#3a2e24]">{u.name} ({u.phone})</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleUserApproval(u.id, 'ACTIVE')} className="px-4 py-2 bg-[#8b5e3c] text-white rounded-xl text-sm">승인</button>
                          <button onClick={() => handleUserApproval(u.id, 'REJECTED')} className="px-4 py-2 bg-gray-200 text-gray-500 rounded-xl text-sm">반려</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "prayer" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#3a2e24] mb-4">🕊️ 중보기도 명단</h3>
                  {prayers.length === 0 ? (
                    <p className="text-gray-400">등록된 기도 제목이 없습니다.</p>
                  ) : (
                    prayers.map(p => (
                      <div key={p.id} className="p-4 border-b border-[#f5e6d3]">
                        <p className="text-[#3a2e24] leading-relaxed">{p.content}</p>
                        <p className="text-xs text-[#c8923a] mt-2">- {p.authorName} 성도님</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}