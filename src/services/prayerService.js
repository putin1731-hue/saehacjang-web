/**
 * [prayerService.js]
 * 성도 기도 제목 관리 (서버 연동형)
 * 로컬 저장소(localStorage)를 버리고 중앙 서버(server.js)와 실시간 연동됩니다.
 */

export const prayerService = {
  // 1. 모든 기도 제목 가져오기 (서버 우체국에서 전체 목록 수령)
  getAllPrayers: async () => {
    try {
      // 🚀 서버 API 주소로 최신 기도 목록 요청
      const response = await fetch('/api/prayers');
      const result = await response.json();
      
      if (response.ok && result.success) {
        return { 
          success: true, 
          data: result.data // 서버 메모리에 저장된 최신 기도 배열
        };
      }
      return { success: false, data: [] };
    } catch (error) {
      console.error("🙏 서버 데이터 로드 실패:", error);
      return { success: false, data: [] };
    }
  },

  // 2. 새로운 기도 제목 저장하기 (서버 우체국으로 발송)
  addPrayer: async (prayerEntry) => {
    try {
      // 🚀 서버 API(/api/prayers)로 새 기도 데이터 전송
      const response = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prayerEntry)
      });
      
      const result = await response.json();
      return { success: response.ok && result.success };
    } catch (error) {
      console.error("🙏 서버 저장 실패:", error);
      return { success: false };
    }
  },

  // 3. 기도 제목 데이터 구조 생성 (규격화)
  createPrayerEntry: (user, content, category = "기타", isAnonymous = false) => {
    return {
      id: Date.now(),
      authorId: user?.id || 'guest',
      authorName: user?.name || "성도", 
      authorPhone: user?.phone || "",
      content: content,
      category: category,
      isAnonymous: isAnonymous,
      createdAt: new Date().toISOString()
    };
  },

  // 4. 포맷팅 로직 (익명 보안 유지)
  // 일반 성도에겐 "익명의 동역자", 관리자(admin)에겐 실명이 보이게 처리
  getFormattedPrayers: (prayers, currentUser) => {
    if (!prayers) return [];
    
    return prayers.map(prayer => ({
      ...prayer,
      // 관리자(admin) 권한일 때만 실명 노출, 그 외엔 익명 처리
      authorDisplay: (currentUser?.role === 'admin' || !prayer.isAnonymous) 
        ? prayer.authorName 
        : "익명의 동역자",
      
      // 관리자만 연락처 확인 가능
      authorContact: currentUser?.role === 'admin' ? (prayer.authorPhone || "연락처 미기입") : null
    }));
  }
};