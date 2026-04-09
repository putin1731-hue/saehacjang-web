/**
 * [authService.js]
 * 회원가입 신청 및 목사님 승인 프로세스 관리
 */

export const authService = {
  // 1. 회원가입 신청 (초기 상태: PENDING)
  // 성도가 가입 폼을 제출하면 호출됩니다.
  registerRequest: (userData) => {
    return {
      ...userData,
      role: "user",
      status: "PENDING", // 목사님 승인 전까지 대기 상태
      requestDate: new Date().toISOString(),
      activeTeams: 0
    };
  },

  // 2. 로그인 가능 여부 판별
  // 승인된(ACTIVE) 성도만 문을 열어줍니다.
  canAccess: (user) => {
    if (!user) return { allowed: false, message: "회원 정보가 없습니다." };
    
    if (user.status === "PENDING") {
      return { allowed: false, message: "목사님의 승인을 기다리는 중입니다. 잠시만 기다려 주세요." };
    }
    
    if (user.status === "REJECTED") {
      return { allowed: false, message: "가입 신청이 반려되었습니다. 행정부에 문의하세요." };
    }
    
    return { allowed: user.status === "ACTIVE", message: "환영합니다!" };
  },

  // 3. [목사님 전용] 승인/반려 처리 로직
  // 관리자 페이지에서 목사님이 결재하실 때 사용됩니다.
  handleApproval: (targetUser, decision) => {
    // decision: 'APPROVE' | 'REJECT'
    if (decision === 'APPROVE') {
      return { ...targetUser, status: "ACTIVE" };
    } else {
      return { ...targetUser, status: "REJECTED" };
    }
  }
};