import express from 'express';
import cron from 'node-cron';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000; 

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

/* ─────────────────────────────────────────
    [행정부] 데이터 보관소 (기존 유지)
───────────────────────────────────────── */
const MEMBERS = [
    { id: 1, name: "황의종", phone: "01025530691", role: "admin", status: "ACTIVE", activeTeams: 0 },
    { id: 2, name: "이준혁", phone: "01051581731", role: "user", status: "ACTIVE", activeTeams: 1 },
    { id: 3, name: "김성도", phone: "01011112222", role: "user", status: "ACTIVE", activeTeams: 0 },
    { id: 4, name: "조열심", phone: "01033334444", role: "user", status: "ACTIVE", activeTeams: 2 }, 
    { id: 5, name: "박교우", phone: "01055556666", role: "user", status: "ACTIVE", activeTeams: 1 },
    { id: 6, name: "최집사", phone: "01099990000", role: "user", status: "ACTIVE", activeTeams: 1 } 
];

let PRAYERS = [
  { id: 1, content: "새학장 교회의 부흥을 위해 기도합니다.", authorName: "황의종", authorPhone: "01025530691", createdAt: new Date().toISOString() },
  { id: 2, content: "성경 필사 사역이 은혜롭게 진행되길 원합니다.", authorName: "이준혁", authorPhone: "01051581731", createdAt: new Date().toISOString() }
];

let WORSHIP_DATA = {
    videoUrl: "https://www.youtube.com/embed/현장예배코드",
    sermonTitle: "주의 길을 예비하라",
    sermonPassage: "마태복음 3:1-12",
    bulletinUrl: "",
    updatedAt: new Date().toISOString()
};

/* ─────────────────────────────────────────
    [기술부] 주보 업로드 엔진
───────────────────────────────────────── */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/bulletin/'),
    filename: (req, file, cb) => cb(null, `bulletin_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage: storage });

/* ─────────────────────────────────────────
    [지휘부] 릴레이 상태 관리 (기존 유지)
───────────────────────────────────────── */
let relayStatus = {
    currentRunner: MEMBERS[1], 
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
    [보강 API] 관제 센터 지원 (로딩 해결의 핵심)
───────────────────────────────────────── */

// 1. 관리자용 신도 명단 조회 (로그 추가로 추적 용이)
app.get('/api/admin/users', (req, res) => {
    console.log("👤 [관제센터] 명단 요청 수신");
    res.json(MEMBERS); 
});

// 2. 기도 데이터 조회 (success 상자에 담아 확실히 전달)
app.get('/api/prayers', (req, res) => {
    console.log("🕊️ [관제센터] 기도 제목 데이터 요청");
    res.json({ success: true, data: PRAYERS });
});

/* ─────────────────────────────────────────
    [주일예배 관리 API]
───────────────────────────────────────── */
app.get('/api/worship/current', (req, res) => {
    res.json({ success: true, data: WORSHIP_DATA });
});

app.post('/api/admin/worship-update', (req, res) => {
    const { videoUrl, sermonTitle, sermonPassage, bulletinUrl } = req.body;
    WORSHIP_DATA = {
        ...WORSHIP_DATA,
        videoUrl: videoUrl || WORSHIP_DATA.videoUrl,
        sermonTitle: sermonTitle || WORSHIP_DATA.sermonTitle,
        sermonPassage: sermonPassage || WORSHIP_DATA.sermonPassage,
        bulletinUrl: bulletinUrl || WORSHIP_DATA.bulletinUrl,
        updatedAt: new Date().toISOString()
    };
    res.json({ success: true, message: "예배 정보 반영 완료" });
});

app.post('/api/admin/upload-bulletin', upload.single('bulletin'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "파일 없음" });
    const fileUrl = `/uploads/bulletin/${req.file.filename}`;
    res.json({ success: true, fileUrl });
});

/* ─────────────────────────────────────────
    [핵심 사역 로직] 기존 기능 100% 호환
───────────────────────────────────────── */
const getActiveMissionCount = (phone) => {
    const user = MEMBERS.find(m => m.phone === phone);
    return user ? user.activeTeams : 0;
};

app.post('/api/mission/apply', (req, res) => {
    const { applicant } = req.body;
    if (getActiveMissionCount(applicant.phone) >= 2) {
        return res.status(403).json({ success: false, message: "사역 제한" });
    }
    res.json({ success: true, message: "접수 완료" });
});

app.get('/api/relay/status', (req, res) => {
    const now = Date.now();
    const timeLeft = Math.max(0, relayStatus.deadline - now);
    res.json({ ...relayStatus, timeLeft });
});

app.post('/api/login', (req, res) => {
    const { name, phone } = req.body;
    const cleanPhone = phone.replace(/-/g, ""); 
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

app.get('/api/bible/:fileName', (req, res) => {
    const { fileName } = req.params;
    const biblePath = path.resolve(__dirname, 'data', 'bible', fileName);
    res.sendFile(biblePath, (err) => {
        if (err) res.status(404).json({ message: "말씀 찾기 실패" });
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

app.listen(PORT, () => console.log(`🚀 Server Running with Worship Admin Support`));