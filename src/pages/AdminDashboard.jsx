import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";

export default function AdminDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("worship");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 신규 등록용 상태 (더 상세하게 분리)
  const [worshipForm, setWorshipForm] = useState({ title: "", youtubeId: "" });
  const [bulletinTitle, setBulletinTitle] = useState("");
  const [bulletinFile, setBulletinFile] = useState(null);

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const usersRes = await fetch('/api/admin/users').then(res => res.json()).catch(() => []);
      setPendingUsers(usersRes.filter(u => u.status === "PENDING"));

      const prayerRes = await fetch('/api/prayers').then(res => res.json()).catch(() => ({ success: false, data: [] }));
      if (prayerRes?.success) setPrayers(prayerRes.data);
    } catch (e) {
      console.error("데이터 로드 오류:", e);
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
    fetchDashboardData();
  }, []);

  // ✅ [기능 1] 예배 영상 신규 등록 (+)
  const handleWorshipAdd = async () => {
    if (!worshipForm.title || !worshipForm.youtubeId) return alert("제목과 유튜브 ID를 모두 입력하세요.");
    
    try {
      const res = await fetch("/api/admin/worship-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sermonTitle: worshipForm.title,
          videoUrl: `https://www.youtube.com/embed/${worshipForm.youtubeId}` 
        }),
      });

      if (res.ok) {
        alert("✨ 새로운 예배 영상이 WorshipVideo 페이지에 추가되었습니다.");
        setWorshipForm({ title: "", youtubeId: "" });
      }
    } catch (e) {
      alert("등록 실패");
    }
  };

  // ✅ [기능 2] 주보 신규 등록 (+)
  const handleBulletinAdd = async () => {
    if (!bulletinFile || !bulletinTitle) return alert("주보 제목과 파일을 모두 선택하세요.");

    try {
      const formData = new FormData();
      formData.append("bulletin", bulletinFile);
      formData.append("title", bulletinTitle);

      const res = await fetch("/api/admin/upload-bulletin", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("📂 새로운 주보가 Bulletin 페이지에 등록되었습니다.");
        setBulletinTitle("");
        setBulletinFile(null);
      }
    } catch (e) {
      alert("주보 업로드 실패");
    }
  };

  const ADMIN_TABS = [
    { id: "worship", label: "주일예배 관리", icon: "⛪" },
    { id: "bulletin", label: "주보 관리", icon: "📄" },
    { id: "prayer", label: "중보기도 요청", icon: "🕊️" },
    { id: "users", label: "회원 관리", icon: "👤" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center font-serif text-[#C5A059]">
      <div className="text-center animate-pulse">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold">사역 데이터를 연결하는 중...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9f2e8] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-[#3a2e24] font-serif tracking-tight">🏛️ 사역 관제 센터</h1>
          <p className="text-[#8b5e3c] font-medium opacity-70">새학장교회 행정 및 영적 돌봄 시스템</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 좌측 메뉴 */}
          <div className="lg:col-span-1 space-y-2">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-bold transition-all ${
                  activeTab === tab.id ? "bg-[#3a2e24] text-white shadow-xl translate-x-2" : "bg-white/60 text-[#8b5e3c] hover:bg-white"
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* 우측 컨텐츠 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm min-h-[500px] border border-[#f5e6d3]">
              
              {/* 1. 예배 영상 관리 (+) */}
              {activeTab === "worship" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#3a2e24]">📺 예배 영상 신규 등록</h3>
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">WorshipVideo.jsx 연동</span>
                  </div>
                  <div className="p-6 bg-[#fdf8f2] rounded-3xl space-y-4">
                    <div>
                      <label className="text-xs font-bold text-[#8b5e3c] ml-1">설교 제목</label>
                      <input
                        type="text"
                        value={worshipForm.title}
                        onChange={(e) => setWorshipForm({...worshipForm, title: e.target.value})}
                        placeholder="예: 2026년 4월 셋째 주일 설교"
                        className="w-full p-4 mt-1 rounded-2xl border-none focus:ring-2 focus:ring-[#c8923a]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#8b5e3c] ml-1">유튜브 ID</label>
                      <input
                        type="text"
                        value={worshipForm.youtubeId}
                        onChange={(e) => setWorshipForm({...worshipForm, youtubeId: e.target.value})}
                        placeholder="예: yz7X1X2X3X4"
                        className="w-full p-4 mt-1 rounded-2xl border-none focus:ring-2 focus:ring-[#c8923a]"
                      />
                    </div>
                  </div>
                  <button onClick={handleWorshipAdd} className="w-full py-5 bg-[#3a2e24] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg">
                    <span className="text-xl">+</span> 영상 리스트에 추가하기
                  </button>
                </div>
              )}

              {/* 2. 주보 관리 (+) */}
              {activeTab === "bulletin" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#3a2e24]">📄 주간 주보 신규 등록</h3>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">Bulletin.jsx 연동</span>
                  </div>
                  <div className="p-6 bg-[#f2f6f9] rounded-3xl space-y-4">
                    <div>
                      <label className="text-xs font-bold text-[#4a5568] ml-1">주보 명칭</label>
                      <input
                        type="text"
                        value={bulletinTitle}
                        onChange={(e) => setBulletinTitle(e.target.value)}
                        placeholder="예: 제 2026-15호 주보"
                        className="w-full p-4 mt-1 rounded-2xl border-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                      <input
                        type="file"
                        onChange={(e) => setBulletinFile(e.target.files[0])}
                        className="hidden"
                        id="bulletin-upload"
                      />
                      <label htmlFor="bulletin-upload" className="cursor-pointer text-sm text-gray-500">
                        {bulletinFile ? `✅ ${bulletinFile.name}` : "📁 클릭하여 PDF 주보 파일 선택"}
                      </label>
                    </div>
                  </div>
                  <button onClick={handleBulletinAdd} className="w-full py-5 bg-[#4a5568] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg">
                    <span className="text-xl">+</span> 주보 리스트에 추가하기
                  </button>
                </div>
              )}

              {/* 3. 중보기도 요청 확인 (기존 유지) */}
              {activeTab === "prayer" && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <h3 className="text-xl font-bold text-[#3a2e24] mb-6">🕊️ 성도 중보기도 요청함</h3>
                  <div className="space-y-3">
                    {prayers.map(p => (
                      <div key={p.id} className="p-5 bg-[#fdf8f2] rounded-2xl border border-[#f5e6d3]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-[#c8923a]">
                            {p.isAnonymous ? "👤 성도(익명요구)" : `👤 ${p.authorName} 성도`}
                          </span>
                          <span className="text-[10px] text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-[#3a2e24] leading-relaxed italic">"{p.content}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. 회원 승인 관리 (기존 유지) */}
              {activeTab === "users" && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <h3 className="text-xl font-bold text-[#3a2e24] mb-6">👤 신규 가입 승인 대기</h3>
                  {pendingUsers.map(u => (
                    <div key={u.id} className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <p className="font-bold text-[#3a2e24]">{u.name}</p>
                        <p className="text-[10px] text-gray-400">{u.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleUserApproval(u.id, 'ACTIVE')} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold">승인</button>
                        <button onClick={() => handleUserApproval(u.id, 'REJECTED')} className="px-4 py-2 bg-gray-200 text-gray-400 rounded-xl text-xs font-bold">반려</button>
                      </div>
                    </div>
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