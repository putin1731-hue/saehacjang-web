import express from 'express';
import cron from 'node-cron';
import cors from 'cors';
import fs from 'fs'; 

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/* ─────────────────────────────────────────
   [행정부 지시] 신도 명단 데이터
   - activeTeams: 현재 참여 중인 팀 수 (2개 이상 시 지목 차단)
───────────────────────────────────────── */
const MEMBERS = [
    { id: 1, name: "이준혁", phone: "01012345678", role: "admin", activeTeams: 1 },
    { id: 2, name: "김성도", phone: "01011112222", role: "user", activeTeams: 0 },
    { id: 3, name: "조열심", phone: "01033334444", role: "user", activeTeams: 2 }, // ⚠️ 중복 참여 제한 대상
    { id: 4, name: "박교우", phone: "01055556666", role: "user", activeTeams: 1 },
    { id: 5, name: "최집사", phone: "01099990000", role: "user", activeTeams: 1 },
    { id: 6, name: "박교우", phone: "01077778888", role: "user", activeTeams: 0 } 
];

/* ─────────────────────────────────────────
   [지휘부 지시] 릴레이 상태 관리 엔진
───────────────────────────────────────── */
let relayStatus = {
    currentRunner: MEMBERS[0], 
    previousRunnerId: null,
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000), 
    isConfirmed: true,
    status: "ACTIVE", 
    verseCount: 0
};

// [API] 로그인 인증
app.post('/api/login', (req, res) => {
    const { name, phone } = req.body;
    const user = MEMBERS.find(m => m.name === name && m.phone === phone);

    if (user) {
        console.log(`✅ [접속] ${name} 성도님 로그인 성공`);
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, message: "명단에 없는 정보입니다. 행정부에 문의하세요." });
    }
});

// [API] 지목하기 (Nominate) - 행정 규칙 필터 이식 완료
app.post('/api/nominate', (req, res) => {
    const { nextName, nextPhone } = req.body;

    // 1. 명단 존재 확인 (이름 + 번호 정밀 매칭)
    const nextRunner = MEMBERS.find(m => m.name === nextName && m.phone === nextPhone);
    
    if (!nextRunner) {
        console.log(`❌ [차단] 존재하지 않는 멤버: ${nextName}`);
        return res.status(404).json({ success: false, message: "명단에 없는 분입니다. 성함과 번호를 다시 확인해주세요." });
    }

    // 2. ⭐ [행정 지침] 중복 참여 제한 필터 (요청하신 로직 이식)
    if (nextRunner.activeTeams >= 2) {
        console.log(`❌ [차단] 중복 참여 제한: ${nextName}`);
        return res.status(400).json({ 
            success: false, 
            message: `${nextRunner.name} 성도님은 이미 2개 팀에 참여 중입니다. (행정 규칙: 최대 2개 팀)` 
        });
    }

    // 3. 순환 및 본인 지목 방지 (기존 기능 유지)
    if (nextRunner.id === relayStatus.previousRunnerId) {
        return res.status(400).json({ success: false, message: "직전 주자는 다시 지목할 수 없습니다." });
    }
    if (nextRunner.id === relayStatus.currentRunner.id) {
        return res.status(400).json({ success: false, message: "본인을 다음 주자로 지정할 수 없습니다." });
    }

    // 상태 업데이트 및 24시간 카운트다운 가동
    relayStatus.previousRunnerId = relayStatus.currentRunner.id;
    relayStatus.currentRunner = nextRunner;
    relayStatus.deadline = new Date(Date.now() + 24 * 60 * 60 * 1000); 
    relayStatus.isConfirmed = false;
    relayStatus.status = "PENDING";

    console.log(`📢 [지목 알림] 다음 주자: ${nextRunner.name} (${nextPhone})`);
    res.json({ success: true, message: `${nextRunner.name} 성도님께 바통을 넘겼습니다. 24시간 내 수락이 필요합니다.` });
});

// [API] 세션 및 상태 조회
app.get('/api/relay/status', (req, res) => {
    res.json({
        ...relayStatus,
        timeLeft: Math.max(0, relayStatus.deadline - Date.now())
    });
});

/* ─────────────────────────────────────────
   [Watcher] 실시간 타임아웃 감시 엔진 (기존 기능 유지)
───────────────────────────────────────── */
cron.schedule('* * * * *', () => {
    const now = new Date();
    
    if (relayStatus.deadline < now && !relayStatus.isConfirmed) {
        console.log("🚫 [VOID] 타임아웃 발생! 릴레이가 중단되었습니다.");
        relayStatus.status = "VOID";
    }
});

app.listen(PORT, () => {
    console.log(`
    🚀 ==========================================
        디지털 성소 Relay Server 가동중
        포트: ${PORT}
        행정 규칙: 인원 제한, 중복 참여 차단(조열심 필터) 활성화
    ========================================== 🚀
    `);
});