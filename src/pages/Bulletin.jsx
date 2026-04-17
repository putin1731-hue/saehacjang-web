import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Bulletin() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [bulletinList, setBulletinList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 신규 주보 입력을 위한 로컬 상태
  const [newTitle, setNewTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchBulletins = async () => {
    try {
      const res = await fetch('/api/bulletin/list').then(r => r.json());
      setBulletinList(res.data || []);
    } catch (e) {
      console.error("주보 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBulletins(); }, []);

  // 🛠️ 관리자 전용: 주보 업로드 (+)
  const handleUpload = async () => {
    if (!selectedFile || !newTitle) return alert("주보 제목과 PDF 파일을 모두 등록해주세요.");
    
    const formData = new FormData();
    formData.append("bulletin", selectedFile);
    formData.append("title", newTitle);

    try {
      const res = await fetch("/api/admin/upload-bulletin", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert("✨ 새로운 주보가 리스트에 추가되었습니다.");
        setNewTitle("");
        setSelectedFile(null);
        fetchBulletins(); // 리스트 갱신
      }
    } catch (e) {
      alert("업로드 중 오류가 발생했습니다.");
    }
  };

  // 🛠️ 관리자 전용: 주보 삭제 (X)
  const handleDelete = async (id) => {
    if (!window.confirm("이 주보를 삭제하시겠습니까?")) return;
    try {
      await fetch('/api/admin/bulletin-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      });
      fetchBulletins();
    } catch (e) {
      alert("삭제 실패");
    }
  };

  if (loading) return <div className="p-20 text-center font-serif text-[#8b5e3c]">주보를 정리하는 중입니다...</div>;

  return (
    <div className="min-h-screen bg-[#FDF8F2] p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-[#3a2e24] font-serif mb-10 border-b-2 border-[#f5e6d3] pb-4">
          주간 주보
        </h2>

        {/* ⭐ 관리자에게만 보이는 상단 업로드 바 */}
        {isAdmin && (
          <div className="mb-10 p-6 bg-white rounded-[2rem] shadow-md border-2 border-dashed border-[#C5A059]">
            <p className="text-xs font-bold text-[#C5A059] mb-4 uppercase tracking-widest">Administrator: 신규 주보 등록</p>
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                placeholder="주보 명칭 (예: 4월 3주차)"
                className="flex-1 p-3 rounded-xl border border-gray-200 text-sm focus:outline-[#C5A059]"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <input 
                type="file" 
                className="flex-1 text-xs file:bg-[#3a2e24] file:text-white file:border-none file:px-4 file:py-2 file:rounded-lg cursor-pointer"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <button 
                onClick={handleUpload}
                className="bg-[#C5A059] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#3a2e24] transition-all"
              >
                업로드 (+)
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {bulletinList.length === 0 ? (
            <p className="text-center py-20 text-gray-400 italic">등록된 주보가 없습니다.</p>
          ) : (
            bulletinList.map((b) => (
              <div key={b.id} className="group flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#fdf8f2] rounded-full flex items-center justify-center text-xl">📄</div>
                  <div>
                    <h4 className="font-bold text-[#3a2e24]">{b.title}</h4>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
                      {new Date(b.createdAt).toLocaleDateString()} 발행
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <a 
                    href={b.bulletinUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-5 py-2 bg-gray-100 text-[#3a2e24] rounded-full text-xs font-bold hover:bg-[#3a2e24] hover:text-white transition-all"
                  >
                    주보 보기
                  </a>
                  
                  {/* ⭐ 관리자에게만 보이는 삭제 버튼 */}
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(b.id)}
                      className="p-2 text-red-300 hover:text-red-600 transition-colors"
                      title="주보 삭제"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}