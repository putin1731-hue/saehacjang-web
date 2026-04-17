import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function WorshipVideo() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [worshipList, setWorshipList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    const res = await fetch('/api/worship/list').then(r => r.json());
    setWorshipList(res.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchList(); }, []);

  // ✅ 관리자 전용 기능: 추가/저장/삭제
  const handleAdd = () => setWorshipList([{ id: `temp-${Date.now()}`, sermonTitle: "", videoUrl: "", isNew: true }, ...worshipList]);
  
  const handleSave = async (item) => {
    await fetch('/api/admin/worship-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    alert("저장되었습니다.");
    fetchList();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await fetch('/api/admin/worship-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] })
    });
    fetchList();
  };

  if (loading) return <div className="p-20 text-center">은혜로운 영상을 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-[#FDF8F2] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-[#3a2e24] font-serif">주일예배 영상</h2>
          {/* ⭐ 관리자에게만 보이는 마법의 + 버튼 */}
          {isAdmin && (
            <button onClick={handleAdd} className="bg-[#3a2e24] text-white px-6 py-2 rounded-full font-bold shadow-lg">+ 신규 영상 등록</button>
          )}
        </div>

        <div className="space-y-12">
          {worshipList.map((video) => (
            <div key={video.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-[#f5e6d3]">
              {isAdmin ? (
                /* 🛠️ 관리자 편집 모드 */
                <div className="space-y-4 mb-4">
                  <input 
                    className="w-full p-3 border rounded-xl" 
                    value={video.sermonTitle} 
                    onChange={(e) => {
                      const newList = [...worshipList];
                      newList.find(v => v.id === video.id).sermonTitle = e.target.value;
                      setWorshipList(newList);
                    }}
                    placeholder="설교 제목 입력"
                  />
                  <input 
                    className="w-full p-3 border rounded-xl" 
                    value={video.videoUrl} 
                    onChange={(e) => {
                      const newList = [...worshipList];
                      newList.find(v => v.id === video.id).videoUrl = e.target.value;
                      setWorshipList(newList);
                    }}
                    placeholder="유튜브 URL 입력"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleSave(video)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">저장하기</button>
                    <button onClick={() => handleDelete(video.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">삭제</button>
                  </div>
                </div>
              ) : (
                /* 📺 일반 유저 모드 */
                <h3 className="text-xl font-bold text-[#3a2e24] mb-4">{video.sermonTitle}</h3>
              )}
              
              <div className="relative pt-[56.25%] overflow-hidden rounded-2xl shadow-inner bg-black">
                <iframe 
                  className="absolute top-0 left-0 w-full h-full"
                  src={video.videoUrl}
                  title="Worship Video"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}