import express from 'express';
import cron from 'node-cron';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 모듈에서 경로 설정을 위한 도구
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Render 환경에서는 process.env.PORT를 사용해야 합니다.
const PORT = process.env.PORT || 10000; 

app.use(cors());
app.use(express.json());

// [중요] 리액트 빌드 파일(dist) 서비스 설정
// 이 코드가 있어야 404 에러 없이 화면이 뜹니다.
app.use(express.static(path.join(__dirname, 'dist')));

/* ─────────────────────────────────────────
   [행정부 지시] 신도 명단 데이터 (기존 유지)
───────────────────────────────────────── */
const MEMBERS = [
    { id: 1, name: "이준혁", phone: "01012345678", role: "admin", activeTeams: 1 },
    { id: 2, name: "김성도", phone: "01011112222", role: "user", activeTeams: 0 },
    { id: 3, name: "조열심", phone: "01033334444", role: "user", activeTeams: 2 }, 
    { id: 4, name: "박교우", phone: "01055556666", role: "user", activeTeams: 1 },
    { id: 5, name: "최집사", phone: "01099990000", role: "user", activeTeams: 1 },
    { id: 6, name: "박교우", phone: "01077778888", role: "user", activeTeams: 0 } 
];

/* ─────────────────────────────────────────
   [지휘부 지시] 릴레이 상태 관리 엔진 (기존 유지)
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
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, message: "명단에 없는 정보입니다." });
    }
});

// [API] 지목하기 (기존 규칙 유지)
app.post('/api/nominate', (req, res) => {
    const { nextName, nextPhone } = req.body;
    const nextRunner = MEMBERS.find(m => m.name === nextName && m.phone === nextPhone);
    
    if (!nextRunner) return res.status(404).json({ success: false, message: "명단 확인 불가" });
    if (nextRunner.activeTeams >= 2) return res.status(400).json({ success: false, message: "중복 참여 제한" });

    relayStatus.previousRunnerId = relayStatus.currentRunner.id;
    relayStatus.currentRunner = nextRunner;
    relayStatus.deadline = new Date(Date.now() + 24 * 60 * 60 * 1000); 
    relayStatus.isConfirmed = false;
    relayStatus.status = "PENDING";

    res.json({ success: true, message: "바통 전달 완료" });
});

// [API] 상태 조회
app.get('/api/relay/status', (req, res) => {
    res.json({
        ...relayStatus,
        timeLeft: Math.max(0, relayStatus.deadline - Date.now())
    });
});

// [핵심] 모든 경로에서 index.html을 반환 (리액트 라우팅 지원)
// API 요청이 아닌 모든 접속은 화면(index.html)으로 연결합니다.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

/* ─────────────────────────────────────────
   [Watcher] 타임아웃 감시 (기존 유지)
───────────────────────────────────────── */
cron.schedule('* * * * *', () => {
    const now = new Date();
    if (relayStatus.deadline < now && !relayStatus.isConfirmed) {
        relayStatus.status = "VOID";
    }
});

app.listen(PORT, () => {
    console.log(`🚀 성소 서버 가동: Port ${PORT}`);
});