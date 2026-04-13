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
    [행정부] 신도 명단 (목사님/기획관님 권한 분리)
───────────────────────────────────────── */
const MEMBERS = [
    { 
      id: 1, 
      name: "황의종",         // ⭐ 목사님: 관리자(admin)
      phone: "01025530691", 
      role: "admin", 
      status: "ACTIVE", 
      activeTeams: 0 
    },
    { 
      id: 2, 
      name: "이준혁",         // ⭐ 기획관님: 유저(user) - 대시보드에서 사생활 보호 모드 작동
      phone: "01051581731", 
      role: "user", 
      status: "ACTIVE", 
      activeTeams: 1 
    },
    { id: 3, name: "김성도", phone: "01011112222", role: "user", status: "ACTIVE", activeTeams: 0 },
    { id: 4, name: "조열심", phone: "01033334444", role: "user", status: "ACTIVE", activeTeams: 2 }, 
    { id: 5, name: "박교우", phone: "01055556666", role: "user", status: "ACTIVE", activeTeams: 1 },
    { id: 6, name: "최집사", phone: "01099990000", role: "user", status: "ACTIVE", activeTeams: 1 } 
];

// [보강] 기도 제목 데이터 보관소
let PRAYERS = [
  { id: 1, content: "새학장 교회의 부흥을 위해 기도합니다.", authorName: "황의종", authorPhone: "01025530691", createdAt: new Date().toISOString() },
  { id: 2, content: "성경 필사 사역이 은혜롭게 진행되길 원합니다.", authorName: "이준혁", authorPhone: "01051581731", createdAt: new Date().toISOString() }
];

/* ─────────────────────────────────────────
    [지휘부] 릴레이 상태 및 미션 관리 (기존 엔진)
───────────────────────────────────────── */
let relayStatus = {
    currentRunner: MEMBERS[1], // 이준혁 기획관님을 첫 주자로 설정
    previousRunnerId: null,
    deadline: Date.now() + (48 * 60 * 60 * 1000), 
    isConfirmed: true,
    status: "ACTIVE", 
    verseCount: 0,
    currentBookName: "창세기",
    currentChapterNum: 1,
    currentVerseNum: 1,
    type: "TEAM"
};

/* ─────────────────────────────────────────
    [기술부] 핵심 로직 엔진 (기존 기능 100% 유지)
───────────────────────────────────────── */

const getActiveMissionCount = (phone) => {
    const user = MEMBERS.find(m => m.phone === phone);
    return user ? user.activeTeams : 0;
};

// 사역 신청 API (기존 유지)
app.post('/api/mission/apply', (req, res) => {
    const { applicant, type, teamMembers } = req.body;
    if (getActiveMissionCount(applicant.phone) >= 2) {
        return res.status(403).json({ success: false, message: "사역 제한: 이미 2개의 미션에 참여 중입니다." });
    }
    if (type === "TEAM" && teamMembers) {
        const overLimitMember = teamMembers.find(m => getActiveMissionCount(m.phone) >= 2);
        if (overLimitMember) {
            return res.status(403).json({ success: false, message: `미션 초과 유저 포함: ${overLimitMember.name} 성도님` });
        }
    }
    res.json({ success: true, message: "사역 신청 접수 완료 (목사님 승인 대기)" });
});

// 목사님 승인 API (기존 유지)
app.post('/api/admin/approve', (req, res) => {
    const { type } = req.body;
    if (type === "TEAM") {
        relayStatus.deadline = Date.now() + (48 * 60 * 60 * 1000);
    } else {
        relayStatus.deadline = Date.now() + (365 * 24 * 60 * 60 * 1000); 
    }
    relayStatus.type = type;
    relayStatus.status = "ACTIVE";
    res.json({ success: true, message: `${type} 사역이 공식 승인되었습니다.` });
});

/* ─────────────────────────────────────────
    [보강 API] 관제 센터 및 기도 사역 지원
───────────────────────────────────────── */

// 1. 관리자용 전체 신도 명단 조회 (AdminDashboard 로드용)
app.get('/api/admin/users', (req, res) => {
    res.json(MEMBERS);
});

// 2. 기도 데이터 조회 API (통합 대시보드용)
app.get('/api/prayers', (req, res) => {
    res.json({ success: true, data: PRAYERS });
});

/* ─────────────────────────────────────────
    [기존 API 유지 및 관리자 대응 강화]
───────────────────────────────────────── */

app.get('/api/relay/status', (req, res) => {
    const now = Date.now();
    const timeLeft = Math.max(0, relayStatus.deadline - now);
    res.json({ ...relayStatus, timeLeft });
});

// 로그인 시 유저의 role 정보를 포함하여 응답 (하이픈 제거 로직 추가)
app.post('/api/login', (req, res) => {
    const { name, phone } = req.body;
    const cleanPhone = phone.replace(/-/g, ""); // 하이픈 무시
    const user = MEMBERS.find(m => m.name === name && m.phone === cleanPhone);
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
    const cleanPhone = nextPhone.replace(/-/g, "");
    const nextRunner = MEMBERS.find(m => m.name === nextName && m.phone === cleanPhone);
    
    if (!nextRunner) return res.status(404).json({ success: false, message: "명단 확인 불가" });
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

app.listen(PORT, () => console.log(`🚀 Server Running with Pastor & Member Roles`));