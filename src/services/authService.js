/**
 * [authService.js]
 * 회원가입 신청 및 목사님 승인 프로세스 관리
 */
export const authService = {
  // 1. 회원가입 신청 (초기 상태: PENDING)
  registerRequest: (userData) => {
    return {
      ...userData,
      role: "user",
      status: "PENDING", 
      requestDate: new Date().toISOString(),
      activeTeams: 0
    };
  },

  // 2. 로그인 가능 여부 판별
  canAccess: (user) => {
    if (!user) return { allowed: false, message: "회원 정보가 없습니다." };
    if (user.status === "PENDING") return { allowed: false, message: "목사님의 승인을 기다리는 중입니다." };
    if (user.status === "REJECTED") return { allowed: false, message: "가입 신청이 반려되었습니다." };
    return { allowed: user.status === "ACTIVE", message: "환영합니다!" };
  },

  // 3. [목사님 전용] 승인/반려 서버 연동 함수 (추가)
  // 관리자 대시보드에서 호출 시 실제 서버 API와 통신합니다.
  updateUserStatus: async (userId, decision) => {
    // decision: 'ACTIVE' (승인) or 'REJECTED' (거절)
    try {
      const response = await fetch(`/api/admin/approve-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: decision })
      });
      return await response.json();
    } catch (error) {
      console.error("행정 처리 중 오류 발생:", error);
      return { success: false };
    }
  }
};