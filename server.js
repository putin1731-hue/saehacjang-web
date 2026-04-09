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
   [행정부] 신도 명단 (activeTeams 필드 활용)
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
   [지휘부] 릴레이 상태 및 미션 관리
───────────────────────────────────────── */
let relayStatus = {
    currentRunner: MEMBERS[0], 
    previousRunnerId: null,
    deadline: Date.now() + (48 * 60 * 60 * 1000), 
    isConfirmed: true,
    status: "ACTIVE", 
    verseCount: 0,
    currentBookName: "창세기",
    currentChapterNum: 1,
    currentVerseNum: 1,
    type: "TEAM" // 기본값은 팀 릴레이
};

/* ─────────────────────────────────────────
   [기술부] 핵심 로직 엔진 (중복 차단 & 유형 분기)
───────────────────────────────────────── */

// 1. 중복 참여 체크 함수
const getActiveMissionCount = (phone) => {
    const user = MEMBERS.find(m => m.phone === phone);
    return user ? user.activeTeams : 0;
};

// 2. 사역 신청 및 중복 차단 API (HTTP 403 적용)
app.post('/api/mission/apply', (req, res) => {
    const { applicant, type, teamMembers } = req.body; // type: "TEAM" | "INDIVIDUAL"

    // [규칙] 신청자 본인 중복 체크
    if (getActiveMissionCount(applicant.phone) >= 2) {
        return res.status(403).json({ success: false, message: "사역 제한: 이미 2개의 미션에 참여 중입니다." });
    }

    // [규칙] 팀원 중복 체크
    if (type === "TEAM" && teamMembers) {
        const overLimitMember = teamMembers.find(m => getActiveMissionCount(m.phone) >= 2);
        if (overLimitMember) {
            return res.status(403).json({ success: false, message: `미션 초과 유저 포함: ${overLimitMember.name} 성도님` });
        }
    }

    res.json({ success: true, message: "사역 신청 접수 완료 (목사님 승인 대기)" });
});

// 3. 목사님 승인 API (유형별 엔진 트리거)
app.post('/api/admin/approve', (req, res) => {
    const { missionId, type } = req.body;
    
    if (type === "TEAM") {
        console.log("🚀 팀 릴레이 엔진 가동: 24/48시간 타이머 적용");
        relayStatus.deadline = Date.now() + (48 * 60 * 60 * 1000);
    } else {
        console.log("🕊️ 개인 사역 엔진 가동: 자율 기간제 적용");
        relayStatus.deadline = Date.now() + (365 * 24 * 60 * 60 * 1000); // 예: 1년 자율
    }
    
    relayStatus.type = type;
    relayStatus.status = "ACTIVE";
    res.json({ success: true, message: `${type} 사역이 공식 승인되었습니다.` });
});

/* ─────────────────────────────────────────
   [기존 API 유지 및 강화]
───────────────────────────────────────── */

app.get('/api/relay/status', (req, res) => {
    const now = Date.now();
    const timeLeft = Math.max(0, relayStatus.deadline - now);
    res.json({ ...relayStatus, timeLeft });
});

app.post('/api/login', (req, res) => {
    const { name, phone } = req.body;
    const user = MEMBERS.find(m => m.name === name && m.phone === phone);
    user ? res.json({ success: true, user }) : res.status(401).json({ success: false, message: "명단 확인 불가" });
});

app.post('/api/relay/update-verse', (req, res) => {
    const { count, bookName, chapterNum, verseNum } = req.body;
    if (typeof count === 'number') {
        relayStatus.verseCount = count;
        if (bookName) relayStatus.currentBookName = bookName;
        if (chapterNum) relayStatus.currentChapterNum = chapterNum;
        if (verseNum) relayStatus.currentVerseNum = verseNum;
        res.json({ success: true, count: relayStatus.verseCount });
    } else {
        res.status(400).json({ success: false });
    }
});

app.post('/api/nominate', (req, res) => {
    const { nextName, nextPhone } = req.body;
    const nextRunner = MEMBERS.find(m => m.name === nextName && m.phone === nextPhone);
    
    if (!nextRunner) return res.status(404).json({ success: false, message: "명단 확인 불가" });
    
    // [행정 규칙] 지목 단계에서도 중복 참여 체크
    if (nextRunner.activeTeams >= 2) {
        return res.status(403).json({ success: false, message: "지목 불가: 이미 2개 팀에 참여 중인 성도님입니다." });
    }

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

app.get('/api/bible/:fileName', (req, res) => {
    const { fileName } = req.params;
    const biblePath = path.resolve(__dirname, 'data', 'bible', fileName);
    res.sendFile(biblePath, (err) => {
        if (err) res.status(404).json({ message: "말씀을 찾을 수 없습니다." });
    });
});

const buildPath = path.resolve(__dirname, 'dist');
app.use(express.static(buildPath));
app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));

cron.schedule('* * * * *', () => {
    if (Date.now() > relayStatus.deadline && !relayStatus.isConfirmed && relayStatus.type === "TEAM") {
        relayStatus.status = "VOID";
    }
});

app.listen(PORT, () => console.log(`🚀 Server Running with Administrative Rules`));