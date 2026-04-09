/**
 * [prayerService.js]
 * 성도 기도 제목 관리 (익명성 보장 및 목사님 전용 실명 확인)
 */
export const prayerService = {
  // 1. 기도 제목 게시물 포맷팅
  // 일반 성도에겐 익명으로, 목사님(admin)에겐 실명으로 보이게 필터링
  getFormattedPrayers: (prayers, currentUser) => {
    return prayers.map(prayer => ({
      ...prayer,
      // 목사님(admin)이면 실명 노출, 아니면 무조건 "익명의 동역자"
      authorDisplay: currentUser.role === 'admin' ? prayer.authorName : "익명의 동역자",
      // 목사님만 볼 수 있는 추가 정보 (연락처 등)
      authorContact: currentUser.role === 'admin' ? prayer.authorPhone : null
    }));
  },

  // 2. 기도 제목 저장 시 데이터 구조
  createPrayerEntry: (user, content) => {
    return {
      id: Date.now(),
      authorId: user.id,
      authorName: user.name, // 서버엔 저장되지만 표시할 때 필터링됨
      authorPhone: user.phone,
      content: content,
      createdAt: new Date().toISOString()
    };
  }
};