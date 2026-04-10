/**
 * [prayerService.js]
 * 성도 기도 제목 관리 (익명성 보장 및 목사님 전용 실명 확인)
 * 저장소: localStorage (서버 구축 전 임시 데이터 저장소)
 */

const STORAGE_KEY = 'saehacjang_prayers';

export const prayerService = {
  // 1. [추가] 모든 기도 제목 가져오기 (배달 기능)
  getAllPrayers: async () => {
    try {
      // 로컬 저장소에서 데이터를 읽어옵니다.
      const data = localStorage.getItem(STORAGE_KEY);
      const prayers = data ? JSON.parse(data) : [];
      
      // 최신순 정렬
      return { 
        success: true, 
        data: prayers.sort((a, b) => b.id - a.id) 
      };
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      return { success: false, data: [] };
    }
  },

  // 2. [추가] 새로운 기도 제목 저장하기 (배달 기능)
  addPrayer: async (prayerEntry) => {
    try {
      const { data: existingPrayers } = await prayerService.getAllPrayers();
      const updatedPrayers = [prayerEntry, ...existingPrayers];
      
      // 로컬 저장소에 저장
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrayers));
      return { success: true };
    } catch (error) {
      console.error("데이터 저장 실패:", error);
      return { success: false };
    }
  },

  // 3. [기존 로직 최적화] 기도 제목 게시물 포맷팅
  // 일반 성도에겐 익명으로, 목사님(admin)에겐 실명으로 보이게 필터링
  getFormattedPrayers: (prayers, currentUser) => {
    if (!prayers) return [];
    
    return prayers.map(prayer => ({
      ...prayer,
      // 목사님(admin)이면 실명 노출, 아니면 무조건 "익명의 동역자"
      // [보안강화] currentUser가 없을 경우를 대비한 방어코드 추가
      authorDisplay: currentUser?.role === 'admin' ? prayer.authorName : "익명의 동역자",
      // 목사님만 볼 수 있는 추가 정보 (연락처 등)
      authorContact: currentUser?.role === 'admin' ? (prayer.authorPhone || "연락처 미기입") : null
    }));
  },

  // 4. [기존 로직 최적화] 기도 제목 저장 시 데이터 구조 생성
  createPrayerEntry: (user, content, category = "기타") => {
    return {
      id: Date.now(),
      authorId: user?.id || 'guest',
      authorName: user?.name || "성도", 
      authorPhone: user?.phone || "010-0000-0000",
      content: content,
      category: category,
      createdAt: new Date().toISOString(),
      prayerCount: 0
    };
  }
};