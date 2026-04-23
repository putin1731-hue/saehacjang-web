import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function WorshipVideo() {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';
  const [worshipList, setWorshipList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 데이터 로드 함수
  const fetchList = async () => {
    try {
      const res = await fetch('/api/worship/list');
      const data = await res.json();
      if (data.success) {
        setWorshipList(data.data || []);
      }
    } catch (e) {
      console.error("영상 데이터를 불러오는 데 실패했습니다:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchList(); 
  }, []);

  // 🛠️ 유튜브 주소 자동 변환기 (연결 거부 문제 해결 핵심)
  const formatYoutubeUrl = (url) => {
    if (!url) return "";
    // 이미 embed 형식이면 그대로 반환
    if (url.includes("embed/")) return url;
    
    // 유튜브 ID 추출 정규식 (일반주소, 단축주소 모두 대응)
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?rel=0&modestbranding=1`;
    }
    return url;
  };

  // 관리자 기능: 신규 항목 추가
  const handleAdd = () => {
    setWorshipList([{ 
      id: `temp-${Date.now()}`, 
      sermonTitle: "", 
      videoUrl: "", 
      isNew: true 
    }, ...worshipList]);
  };

  // 관리자 기능: 저장 (데이터 동기화 강화)
  const handleSave = async (item) => {
    if (!item.sermonTitle || !item.videoUrl) {
      return alert("설교 제목과 영상 주소를 모두 입력해주세요.");
    }

    const correctedItem = {
      ...item,
      videoUrl: formatYoutubeUrl(item.videoUrl) // 저장 시 자동으로 주소 교정
    };

    try {
      const res = await fetch('/api/admin/worship-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(correctedItem)
      });
      
      if (res.ok) {
        alert("✨ 성공적으로 저장되었습니다.");
        fetchList(); // 서버 데이터와 프론트엔드 싱크 맞추기
      }
    } catch (e) {
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 관리자 기능: 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("이 영상을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch('/api/admin/worship-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      });
      if (res.ok) {
        fetchList();
      }
    } catch (e) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F2] flex items-center justify-center font-serif text-[#C5A059]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="animate-pulse tracking-widest text-sm font-bold">은혜로운 영상을 불러오는 중...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F2] p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* 상단 헤더 영역 - 기존 디자인 유지 */}
        <div className="flex justify-between items-center mb-12 border-b border-[#f5e6d3] pb-8">
          <div>
            <h2 className="text-4xl font-black text-[#3a2e24] font-serif tracking-tight">주일예배 영상</h2>
            <p className="text-[#C5A059] mt-2 font-medium">새학장교회의 신령과 진정어린 예배</p>
          </div>
          {isAdmin && (
            <button 
              onClick={handleAdd} 
              className="bg-[#3a2e24] text-white px-8 py-3 rounded-full font-bold shadow-xl hover:bg-[#5a4638] transition-all active:scale-95"
            >
              + 신규 영상 등록
            </button>
          )}
        </div>

        {/* 영상 리스트 영역 */}
        <div className="space-y-16">
          {worshipList.length === 0 && (
            <div className="text-center py-32 text-gray-300 italic font-serif">현재 등록된 예배 영상이 없습니다.</div>
          )}
          
          {worshipList.map((video) => (
            <div key={video.id} className="bg-white rounded-[3rem] p-8 shadow-sm border border-[#f5e6d3] hover:shadow-md transition-shadow">
              
              {isAdmin ? (
                /* 🛠️ 관리자 편집 카드 (목사님 전용) */
                <div className="space-y-4 mb-8 bg-[#F9F7F2] p-8 rounded-[2rem] border-2 border-dashed border-[#C5A059]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-[#C5A059] rounded-full"></span>
                    <p className="text-xs font-bold text-[#8b5e3c] uppercase tracking-widest">Editor Mode</p>
                  </div>
                  <input 
                    className="w-full p-4 rounded-2xl border-none shadow-inner focus:ring-2 focus:ring-[#C5A059] text-sm" 
                    value={video.sermonTitle} 
                    onChange={(e) => {
                      const newList = [...worshipList];
                      newList.find(v => v.id === video.id).sermonTitle = e.target.value;
                      setWorshipList(newList);
                    }}
                    placeholder="설교 날짜 및 제목 입력"
                  />
                  <input 
                    className="w-full p-4 rounded-2xl border-none shadow-inner focus:ring-2 focus:ring-[#C5A059] text-sm" 
                    value={video.videoUrl} 
                    onChange={(e) => {
                      const newList = [...worshipList];
                      newList.find(v => v.id === video.id).videoUrl = e.target.value;
                      setWorshipList(newList);
                    }}
                    placeholder="유튜브 주소 (복사해서 그대로 붙여넣으세요)"
                  />
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => handleSave(video)} className="flex-1 bg-[#C5A059] text-white py-4 rounded-2xl font-bold hover:bg-[#b38f4d] transition-colors shadow-lg">저장하기</button>
                    <button onClick={() => handleDelete(video.id)} className="px-8 bg-white text-red-400 border border-red-100 py-4 rounded-2xl font-bold hover:bg-red-50 transition-colors">삭제</button>
                  </div>
                </div>
              ) : (
                /* 📺 일반 성도 뷰 */
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-[#3a2e24] font-serif mb-2">{video.sermonTitle}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#f5e6d3] text-[#8b5e3c] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter">Lord's Day Service</span>
                    <p className="text-[10px] text-gray-400 font-medium">SAEHAKJANG CHURCH</p>
                  </div>
                </div>
              )}
              
              {/* 비디오 프레임 - 기존 UI 유지 */}
              <div className="relative pt-[56.25%] overflow-hidden rounded-[2rem] shadow-2xl bg-black border-[6px] border-white">
                <iframe 
                  className="absolute top-0 left-0 w-full h-full"
                  src={formatYoutubeUrl(video.videoUrl)}
                  title="Worship Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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