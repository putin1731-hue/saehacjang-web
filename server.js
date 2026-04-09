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

/* ─────────────────────────────────────────
   [행정부 지시] 신도 명단 데이터 (기본 유지)
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
   [지휘부 지시] 릴레이 상태 관리 엔진 (기본 유지)
───────────────────────────────────────── */
let relayStatus = {
    currentRunner: MEMBERS[0], 
    previousRunnerId: null,
    deadline: Date.now() + (48 * 60 * 60 * 1000), 
    isConfirmed: true,
    status: "ACTIVE", 
    verseCount: 0
};

/* ─────────────────────────────────────────
   [API 엔진] 기존 기능 유지 + 성경 보급로 추가
───────────────────────────────────────── */

// [기존] 상태 조회
app.get('/api/relay/status', (req, res) => {
    const now = Date.now();
    const timeLeft = Math.max(0, relayStatus.deadline - now);
    res.json({
        ...relayStatus,
        timeLeft: timeLeft
    });
});

// [기존] 로그인 인증
app.post('/api/login', (req, res) => {
    const { name, phone } = req.body;
    const user = MEMBERS.find(m => m.name === name && m.phone === phone);
    user ? res.json({ success: true, user }) : res.status(401).json({ success: false, message: "명단 확인 불가" });
});

// [기존] 지목하기 (행정 규칙 포함)
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

// ⭐ [신규 추가] 성경 말씀 보급로 (public/data/bible 파일 전송)
app.get('/api/bible/:fileName', (req, res) => {
    const { fileName } = req.params;
    // public/data/bible 폴더 내의 파일을 안전하게 찾아갑니다.
    const biblePath = path.resolve(__dirname, 'public', 'data', 'bible', fileName);
    
    res.sendFile(biblePath, (err) => {
        if (err) {
            console.error(`⚠️ 말씀 배달 실패: ${fileName}`);
            res.status(404).json({ message: "말씀을 찾을 수 없습니다." });
        }
    });
});

/* ─────────────────────────────────────────
   [배포 설정] 정적 파일 서비스
───────────────────────────────────────── */
const buildPath = path.resolve(__dirname, 'dist');
app.use(express.static(buildPath));

// 리액트 라우팅 대응
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

/* ─────────────────────────────────────────
   [Watcher] 타임아웃 감시 (1분마다)
───────────────────────────────────────── */
cron.schedule('* * * * *', () => {
    if (Date.now() > relayStatus.deadline && !relayStatus.isConfirmed) {
        relayStatus.status = "VOID";
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server Running on Port ${PORT}`);
});