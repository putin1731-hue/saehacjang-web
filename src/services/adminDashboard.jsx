// [AdminDashboard.jsx 구조 요약]
export default function AdminDashboard() {
  return (
    <div className="admin-container">
      <h1>🏛️ 새학장교회 사역 관제 센터</h1>
      
      {/* 1. 필사 릴레이 현황 섹션 */}
      <section>
        <h3>📖 필사 릴레이 모니터링</h3>
        <table>
          <thead>
            <tr><th>팀명/주자</th><th>진행 위치</th><th>남은 시간</th><th>상태</th></tr>
          </thead>
          <tbody>
            {/* server.js에서 받아온 relayStatus 이력 출력 */}
          </tbody>
        </table>
      </section>

      {/* 2. 가입 승인 대기 섹션 */}
      <section>
        <h3>👥 신규 가입 승인 대기</h3>
        {/* authService에서 status가 PENDING인 유저 목록 */}
      </section>
    </div>
  );
}