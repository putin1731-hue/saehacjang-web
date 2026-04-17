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
    [행정부] 데이터 보관소
───────────────────────────────────────── */

// 1. 성도 명단
let MEMBERS = [
    { id: 1, name: "황의종", phone: "01025530691", role: "admin", status: "ACTIVE", activeTeams: 0 },
    { id: 2, name: "이준혁", phone: "01051581731", role: "user", status: "ACTIVE", activeTeams: 1 },
    { id: 99, name: "새가족테스트", phone: "01000000000", role: "user", status: "PENDING", activeTeams: 0 } 
];

// 2. 중보기도 데이터
let PRAYERS = [
  { id: 1, content: "새학장 교회의 부흥을 위해 기도합니다.", authorName: "황의종", authorPhone: "01025530691", isAnonymous: false, createdAt: new Date().toISOString() },
  { id: 2, content: "성경 필사 사역이 은혜롭게 진행되길 원합니다.", authorName: "이준혁", authorPhone: "01051581731", isAnonymous: true, createdAt: new Date().toISOString() }
];

// 3. 주일예배 영상 리스트
let WORSHIP_LIST = [
    { id: 1, videoUrl: "https://www.youtube.com/embed/현장예배코드", sermonTitle: "주의 길을 예비하라", updatedAt: new Date().toISOString() }
];

// 4. 주간 주보 리스트
let BULLETIN_LIST = [
    { id: 1, title: "제 2026-01호 주보", bulletinUrl: "", createdAt: new Date().toISOString() }
];

/* ─────────────────────────────────────────
    [지휘부] 릴레이 및 팀별 필사 현황 (AdminDashboard 연동용)
───────────────────────────────────────── */
let relayStatus = {
    currentRunner: MEMBERS[1], 
    deadline: Date.now() + (48 * 60 * 60 * 1000), 
    isConfirmed: true, 
    status: "ACTIVE", 
    totalVerseCount: 1254, // 누적 전체 구절
    currentBookName: "창세기", 
    currentChapterNum: 1, 
    currentVerseNum: 1,
    // ⭐ AdminDashboard의 Progress Bar를 위한 팀별 데이터
    teamProgress: [
        { name: "사랑팀", progress: 75 },
        { name: "소망팀", progress: 62 },
        { name: "믿음팀", progress: 88 }
    ]
};

/* ─────────────────────────────────────────
    [기술부] 파일 업로드 엔진 (Multer)
───────────────────────────────────────── */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/bulletin/'),
    filename: (req, file, cb) => cb(null, `bulletin_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage: storage });

/* ─────────────────────────────────────────
    [관제 센터 지원 API] - 유저 관리 및 승인
───────────────────────────────────────── */

app.post('/api/signup', (req, res) => {
    const { name, phone } = req.body;
    const cleanPhone = phone.replace(/-/g, "");
    if (MEMBERS.find(m => m.phone === cleanPhone)) {
        return res.status(400).json({ success: false, message: "이미 등록된 번호입니다." });
    }
    const newMember = {
        id: Date.now(),
        name,
        phone: cleanPhone,
        role: "user",
        status: "PENDING",
        activeTeams: 0,
        createdAt: new Date().toISOString()
    };
    MEMBERS.push(newMember);
    res.json({ success: true });
});

app.get('/api/admin/users', (req, res) => res.json(MEMBERS || []));

app.post('/api/admin/update-user-status', (req, res) => {
    const { userId, status } = req.body;
    const user = MEMBERS.find(u => u.id === userId);
    if (user) {
        user.status = status;
        res.json({ success: true });
    } else res.status(404).json({ success: false });
});

/* ─────────────────────────────────────────
    [사역 관리 API] - 예배 / 주보 / 기도
───────────────────────────────────────── */

app.get('/api/worship/list', (req, res) => res.json({ success: true, data: [...WORSHIP_LIST].reverse() }));

app.post('/api/admin/worship-update', (req, res) => {
    const { id, videoUrl, sermonTitle } = req.body;
    if (id && String(id).startsWith('temp')) {
        WORSHIP_LIST.push({ id: Date.now(), videoUrl, sermonTitle, updatedAt: new Date().toISOString() });
    } else {
        const idx = WORSHIP_LIST.findIndex(w => w.id === id);
        if (idx !== -1) WORSHIP_LIST[idx] = { ...WORSHIP_LIST[idx], videoUrl, sermonTitle, updatedAt: new Date().toISOString() };
    }
    res.json({ success: true });
});

app.post('/api/admin/worship-delete', (req, res) => {
    const { ids } = req.body;
    WORSHIP_LIST = WORSHIP_LIST.filter(w => !ids.includes(w.id));
    res.json({ success: true });
});

app.get('/api/bulletin/list', (req, res) => res.json({ success: true, data: [...BULLETIN_LIST].reverse() }));

app.post('/api/admin/upload-bulletin', upload.single('bulletin'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false });
    const newBulletin = {
        id: Date.now(),
        title: req.body.title || "새 주보",
        bulletinUrl: `/uploads/bulletin/${req.file.filename}`,
        createdAt: new Date().toISOString()
    };
    BULLETIN_LIST.push(newBulletin);
    res.json({ success: true });
});

app.post('/api/admin/bulletin-delete', (req, res) => {
    const { ids } = req.body;
    BULLETIN_LIST = BULLETIN_LIST.filter(b => !ids.includes(b.id));
    res.json({ success: true });
});

app.get('/api/prayers', (req, res) => res.json({ success: true, data: PRAYERS }));

/* ─────────────────────────────────────────
    [기존 핵심 로직] 로그인 / 릴레이 / 성경 (호환 유지)
───────────────────────────────────────── */
app.post('/api/login', (req, res) => {
    const { name, phone } = req.body;
    const cleanPhone = phone.replace(/-/g, ""); 
    const user = MEMBERS.find(m => m.name === name && m.phone === cleanPhone);
    if (user && user.status === "ACTIVE") res.json({ success: true, user });
    else if (user && user.status === "PENDING") res.status(401).json({ success: false, message: "승인 대기 중입니다." });
    else res.status(401).json({ success: false, message: "등록되지 않은 정보입니다." });
});

app.get('/api/relay/status', (req, res) => {
    res.json({ ...relayStatus, timeLeft: Math.max(0, relayStatus.deadline - Date.now()) });
});

app.get('/api/bible/:fileName', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'data', 'bible', req.params.fileName));
});

/* ─────────────────────────────────────────
    [정적 파일 서비스]
───────────────────────────────────────── */
const buildPath = path.resolve(__dirname, 'dist');
app.use(express.static(buildPath));
app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));

app.listen(PORT, () => console.log(`🚀 Saehakjang Server Running with Team Progress Support`));