import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";

export default function AdminDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("worship");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 리스트 관리용 상태
  const [worshipList, setWorshipList] = useState([]);
  const [bulletinList, setBulletinList] = useState([]);
  
  // ✅ 선택 삭제용 체크박스 상태
  const [selectedWorships, setSelectedWorships] = useState([]);
  const [selectedBulletins, setSelectedBulletins] = useState([]);

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  // 🛠️ 데이터 로드 로직 (통합 동기화)
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. 유저 명단 로드 및 PENDING(대기자) 필터링
      const usersRes = await fetch('/api/admin/users').then(res => res.json()).catch(() => []);
      setPendingUsers(usersRes.filter(u => u.status === "PENDING"));

      // 2. 기도 제목 로드
      const prayerRes = await fetch('/api/prayers').then(res => res.json()).catch(() => ({ success: false, data: [] }));
      if (prayerRes?.success) setPrayers(prayerRes.data);

      // 3. 예배 영상 및 주보 리스트 로드
      const wRes = await fetch('/api/worship/list').then(res => res.json()).catch(() => ({ data: [] }));
      const bRes = await fetch('/api/bulletin/list').then(res => res.json()).catch(() => ({ data: [] }));
      
      setWorshipList(wRes.data || []);
      setBulletinList(bRes.data || []);

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

  // ---------------------------------------------------------
  // 👤 회원 관리 (새가족 승인) 로직
  // ---------------------------------------------------------
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
        fetchDashboardData(); // 명단 새로고침
      }
    } catch (e) {
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  // ---------------------------------------------------------
  // 📺 예배 영상 관리 로직
  // ---------------------------------------------------------
  const addWorshipRow = () => {
    const newRow = { id: `temp-${Date.now()}`, sermonTitle: "", videoUrl: "", isNew: true };
    setWorshipList([newRow, ...worshipList]);
  };

  const handleWorshipSave = async (item) => {
    if (!item.sermonTitle || !item.videoUrl) return alert("제목과 URL을 입력해주세요.");
    try {
      const res = await fetch("/api/admin/worship-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        alert("✨ 예배 정보가 저장되었습니다.");
        fetchDashboardData();
      }
    } catch (e) { alert("저장 실패"); }
  };

  const deleteSelectedWorship = async () => {
    if (selectedWorships.length === 0) return alert("삭제할 항목을 선택해주세요.");
    if (!window.confirm("선택한 항목을 삭제하시겠습니까?")) return;
    try {
      await fetch('/api/admin/worship-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedWorships })
      });
      setSelectedWorships([]);
      fetchDashboardData();
    } catch (e) { alert("삭제 실패"); }
  };

  // ---------------------------------------------------------
  // 📄 주보 관리 로직
  // ---------------------------------------------------------
  const handleBulletinAdd = async (title, file) => {
    if (!file || !title) return alert("제목과 파일을 모두 선택하세요.");
    try {
      const formData = new FormData();
      formData.append("bulletin", file);
      formData.append("title", title);
      const res = await fetch("/api/admin/upload-bulletin", { method: "POST", body: formData });
      if (res.ok) {
        alert("📂 주보가 등록되었습니다.");
        fetchDashboardData();
      }
    } catch (e) { alert("업로드 실패"); }
  };

  const deleteSelectedBulletins = async () => {
    if (selectedBulletins.length === 0) return alert("삭제할 항목을 선택해주세요.");
    if (!window.confirm("선택한 주보를 삭제하시겠습니까?")) return;
    try {
      await fetch('/api/admin/bulletin-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedBulletins })
      });
      setSelectedBulletins([]);
      fetchDashboardData();
    } catch (e) { alert("삭제 실패"); }
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
        <p className="text-sm font-bold">사역 데이터를 동기화 중...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9f2e8] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#3a2e24] font-serif tracking-tight">🏛️ 사역 관제 센터</h1>
            <p className="text-[#8b5e3c] font-medium opacity-70">새학장교회 행정 및 영적 돌봄 시스템</p>
          </div>
          <button onClick={fetchDashboardData} className="text-xs text-[#8b5e3c] underline active:scale-95">데이터 새로고침</button>
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

          {/* 우측 컨텐츠 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm min-h-[500px] border border-[#f5e6d3]">
              
              {/* 1. 예배 영상 관리 */}
              {activeTab === "worship" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#3a2e24]">📺 예배 영상 리스트</h3>
                    <div className="flex gap-2">
                      <button onClick={addWorshipRow} className="px-4 py-2 bg-[#3a2e24] text-white rounded-xl text-xs font-bold">+ 추가</button>
                      <button onClick={deleteSelectedWorship} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-50">선택 삭제</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {worshipList.map((w) => (
                      <div key={w.id} className="flex flex-col md:flex-row items-center gap-3 p-4 bg-[#fdf8f2] rounded-2xl border border-[#f5e6d3]">
                        <input type="checkbox" className="w-5 h-5 accent-[#3a2e24]" checked={selectedWorships.includes(w.id)} onChange={(e) => e.target.checked ? setSelectedWorships([...selectedWorships, w.id]) : setSelectedWorships(selectedWorships.filter(id => id !== w.id))} />
                        <input className="flex-[2] p-2 text-sm rounded-lg border-none" placeholder="설교 제목" value={w.sermonTitle} onChange={(e) => { const newList = [...worshipList]; newList.find(item => item.id === w.id).sermonTitle = e.target.value; setWorshipList(newList); }} />
                        <input className="flex-[3] p-2 text-sm rounded-lg border-none" placeholder="YouTube URL" value={w.videoUrl} onChange={(e) => { const newList = [...worshipList]; newList.find(item => item.id === w.id).videoUrl = e.target.value; setWorshipList(newList); }} />
                        <button onClick={() => handleWorshipSave(w)} className="px-4 py-2 bg-[#c8923a] text-white rounded-lg text-xs font-bold">저장</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. 주보 관리 */}
              {activeTab === "bulletin" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#3a2e24]">📄 주보 리스트 관리</h3>
                    <button onClick={deleteSelectedBulletins} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">선택 삭제</button>
                  </div>
                  <div className="p-6 bg-[#f2f6f9] rounded-3xl space-y-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-3">
                      <input id="new-b-title" type="text" placeholder="주보 명칭" className="flex-1 p-3 rounded-xl border-none text-sm" />
                      <input id="new-b-file" type="file" className="text-xs file:bg-blue-600 file:text-white file:border-none file:px-4 file:py-2 file:rounded-lg" />
                      <button onClick={() => handleBulletinAdd(document.getElementById('new-b-title').value, document.getElementById('new-b-file').files[0])} className="px-6 py-3 bg-[#3a2e24] text-white rounded-xl text-sm font-bold">추가</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {bulletinList.map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={selectedBulletins.includes(b.id)} onChange={(e) => e.target.checked ? setSelectedBulletins([...selectedBulletins, b.id]) : setSelectedBulletins(selectedBulletins.filter(id => id !== b.id))} />
                          <span className="text-sm font-bold">{b.title}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. 중보기도 요청 확인 */}
              {activeTab === "prayer" && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <h3 className="text-xl font-bold text-[#3a2e24] mb-6">🕊️ 성도 중보기도 요청함</h3>
                  <div className="space-y-3">
                    {prayers.map(p => (
                      <div key={p.id} className="p-5 bg-[#fdf8f2] rounded-2xl border border-[#f5e6d3]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-[#c8923a]">{p.isAnonymous ? "👤 성도(익명요구)" : `👤 ${p.authorName} 성도`}</span>
                          <span className="text-[10px] text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-[#3a2e24] italic">"{p.content}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ✅ 4. 회원 관리 (새가족 승인 처리 통합) */}
              {activeTab === "users" && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#3a2e24]">👤 신규 가입 승인 대기 명단</h3>
                    <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold">대기자: {pendingUsers.length}명</span>
                  </div>

                  {pendingUsers.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <p className="text-gray-400 italic">현재 승인 대기 중인 새가족이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {pendingUsers.map(u => (
                        <div key={u.id} className="flex flex-col md:flex-row justify-between items-center p-6 bg-[#fdf8f2] rounded-3xl border border-[#f5e6d3] shadow-sm">
                          <div className="mb-4 md:mb-0">
                            <p className="text-lg font-bold text-[#3a2e24]">{u.name}</p>
                            <p className="text-sm text-[#8b5e3c] opacity-70">{u.phone}</p>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={() => handleUserApproval(u.id, 'ACTIVE')} className="flex-1 md:flex-none px-6 py-3 bg-[#3a2e24] text-white rounded-xl text-sm font-bold hover:bg-black transition-all">승인</button>
                            <button onClick={() => handleUserApproval(u.id, 'REJECTED')} className="flex-1 md:flex-none px-6 py-3 bg-white text-gray-400 rounded-xl text-sm font-bold border border-gray-100 hover:bg-gray-50 transition-all">반려</button>
                          </div>
                        </div>
                      ))}
                    </div>
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