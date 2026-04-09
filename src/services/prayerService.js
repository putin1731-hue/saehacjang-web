// [prayerService.js] 익명 기도 사역 엔진
export const prayerService = {
  // 1. 기도 제목 등록 (작성자 ID를 숨겨서 저장)
  createPost: (user, content) => {
    return {
      id: Date.now(),
      authorId: user.id, // 내부적으로만 기억
      authorName: user.name, 
      content: content,
      isAnonymous: true, // 일반 유저에겐 익명으로 표시
      createdAt: new Date()
    };
  },

  // 2. 화면에 뿌려줄 때 (권한별 분기)
  formatPost: (post, currentUser) => {
    if (currentUser.role === 'admin') {
      // 목사님께는 실명과 함께 [실명 확인] 마크 표시
      return { ...post, displayName: `${post.authorName} 성도님` };
    }
    // 일반 성도님께는 무조건 익명 처리
    return { ...post, displayName: "익명의 동역자" };
  }
};