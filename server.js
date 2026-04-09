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
   [지휘부 지시] 릴레이 상태 관리 엔진
───────────────────────────────────────── */
let relayStatus = {
    currentRunner: MEMBERS[0], 
    previousRunnerId: null,
    deadline: Date.now() + (48 * 60 * 60 * 1000), 
    isConfirmed: true,
    status: "ACTIVE", 
    verseCount: 0 // 성도님들이 필사한 총 구절 수가 여기에 기록됩니다.
};

/* ─────────────────────────────────────────
   [1단계: API 엔진 정의] 
───────────────────────────────────────── */

// 1. 상태 조회 API
app.get('/api/relay/status', (req, res) => {
    const now = Date.now();
    const timeLeft = Math.max(0, relayStatus.deadline - now);
    res.json({
        ...relayStatus,
        timeLeft: timeLeft
    });
});

// 2. 로그인 인증 API
app.post('/api/login', (req, res) => {
    const { name, phone } = req.body;
    const user = MEMBERS.find(m => m.name === name && m.phone === phone);
    user ? res.json({ success: true, user }) : res.status(401).json({ success: false, message: "명단 확인 불가" });
});

// ⭐ 3. [신규] 필사 구절 카운트 업데이트 API
// 성도님이 '필사 완료' 버튼을 누를 때 호출되어 숫자를 올립니다.
app.post('/api/relay/update-verse', (req, res) => {
    relayStatus.verseCount += 1;
    console.log(`✨ 필사 기록 갱신: 현재 총 ${relayStatus.verseCount}구절`);
    res.json({ success: true, newCount: relayStatus.verseCount });
});

// 4. 지목하기 API (기존 규칙 유지)
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
        // verseCount는 초기화하지 않고 누적 기록을 유지합니다.
    };
    res.json({ success: true, message: "바통 전달 완료" });
});

// 5. 성경 말씀 보급로 API
app.get('/api/bible/:fileName', (req, res) => {
    const { fileName } = req.params;
    const biblePath = path.resolve(__dirname, 'data', 'bible', fileName);
    
    res.sendFile(biblePath, (err) => {
        if (err) {
            console.error(`⚠️ 말씀 배달 실패: ${fileName}`);
            res.status(404).json({ message: "말씀을 찾을 수 없습니다." });
        }
    });
});

/* ─────────────────────────────────────────
   [2단계: 정적 파일 및 화면 연결] 
───────────────────────────────────────── */
const buildPath = path.resolve(__dirname, 'dist');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

/* ─────────────────────────────────────────
   [3단계: Watcher] 타임아웃 감시 (1분마다)
───────────────────────────────────────── */
cron.schedule('* * * * *', () => {
    if (Date.now() > relayStatus.deadline && !relayStatus.isConfirmed) {
        relayStatus.status = "VOID";
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server Running on Port ${PORT} with Auto-Counter`);
});