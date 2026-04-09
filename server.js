import express from 'express';
import cron from 'node-cron';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000; 

app.use(cors());
app.use(express.json());

// [행정부 명단 데이터]
const MEMBERS = [
    { id: 1, name: "이준혁", phone: "01012345678", role: "admin", activeTeams: 1 },
    { id: 2, name: "김성도", phone: "01011112222", role: "user", activeTeams: 0 },
    { id: 3, name: "조열심", phone: "01033334444", role: "user", activeTeams: 2 }, 
    { id: 4, name: "박교우", phone: "01055556666", role: "user", activeTeams: 1 },
    { id: 5, name: "최집사", phone: "01099990000", role: "user", activeTeams: 1 },
    { id: 6, name: "박교우", phone: "01077778888", role: "user", activeTeams: 0 } 
];

// [릴레이 상태 엔진] - 마감 기한을 숫자형태(Timestamp)로 저장하여 경고 방지
let relayStatus = {
    currentRunner: MEMBERS[0], 
    previousRunnerId: null,
    deadline: Date.now() + (48 * 60 * 60 * 1000), 
    isConfirmed: true,
    status: "ACTIVE", 
    verseCount: 0
};

// [API] 상태 조회
app.get('/api/relay/status', (req, res) => {
    const now = Date.now();
    const timeLeft = Math.max(0, relayStatus.deadline - now);
    res.json({
        ...relayStatus,
        timeLeft: timeLeft
    });
});

// [API] 로그인 및 지목 로직 (기존과 동일)
app.post('/api/login', (req, res) => {
    const { name, phone } = req.body;
    const user = MEMBERS.find(m => m.name === name && m.phone === phone);
    user ? res.json({ success: true, user }) : res.status(401).json({ success: false, message: "명단 확인 불가" });
});

app.post('/api/nominate', (req, res) => {
    const { nextName, nextPhone } = req.body;
    const nextRunner = MEMBERS.find(m => m.name === nextName && m.phone === nextPhone);
    
    if (!nextRunner) return res.status(404).json({ success: false, message: "명단 확인 불가" });
    if (nextRunner.activeTeams >= 2) return res.status(400).json({ success: false, message: "중복 참여 제한" });

    relayStatus = {
        ...relayStatus,
        previousRunnerId: relayStatus.currentRunner.id,
        currentRunner: nextRunner,
        deadline: Date.now() + (24 * 60 * 60 * 1000),
        isConfirmed: false,
        status: "PENDING"
    };
    res.json({ success: true, message: "바통 전달 완료" });
});

// [정적 파일 경로 보안 강화]
const buildPath = path.resolve(__dirname, 'dist');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

// [감시 엔진] 1분마다 체크
cron.schedule('* * * * *', () => {
    if (Date.now() > relayStatus.deadline && !relayStatus.isConfirmed) {
        relayStatus.status = "VOID";
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server Running on Port ${PORT}`);
});