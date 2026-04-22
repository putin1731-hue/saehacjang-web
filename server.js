import express from 'express';
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

let MEMBERS = [
    { id: 1, name: "황의종", phone: "01025530691", role: "admin", status: "ACTIVE", activeTeams: 0, createdAt: new Date(2024, 0, 1).toISOString() },
    { id: 2, name: "이준혁", phone: "01051581731", role: "user", status: "ACTIVE", activeTeams: 1, createdAt: new Date(2024, 0, 2).toISOString() },
    { id: 99, name: "새가족테스트", phone: "01000000000", role: "user", status: "PENDING", activeTeams: 0, createdAt: new Date().toISOString() } 
];

let PRAYERS = [
  { id: 1, content: "새학장 교회의 부흥을 위해 기도합니다.", authorName: "황의종", authorPhone: "01025530691", isAnonymous: false, createdAt: new Date().toISOString() },
  { id: 2, content: "성경 필사 사역이 은혜롭게 진행되길 원합니다.", authorName: "이준혁", authorPhone: "01051581731", isAnonymous: true, createdAt: new Date().toISOString() }
];

let WORSHIP_LIST = [
    { id: 1, videoUrl: "https://www.youtube.com/embed/현장예배코드", sermonTitle: "주의 길을 예비하라", updatedAt: new Date().toISOString() }
];

let BULLETIN_LIST = [
    { id: 1, title: "제 2026-01호 주보", bulletinUrl: "", createdAt: new Date().toISOString() }
];

/* ─────────────────────────────────────────
    [지휘부] 릴레이 필사 현황 (창세기 1:1 리셋)
───────────────────────────────────────── */
let relayStatus = {
    currentRunner: MEMBERS[1], 
    deadline: Date.now() + (48 * 60 * 60 * 1000), 
    isConfirmed: true, 
    status: "ACTIVE", 
    totalVerseCount: 0, 
    currentBookName: "창세기", 
    currentChapterNum: 1, 
    currentVerseNum: 1,
    teamProgress: [
        { name: "사랑팀", progress: 0 },
        { name: "소망팀", progress: 0 },
        { name: "믿음팀", progress: 0 }
    ]
};

/* ─────────────────────────────────────────
    [기술부] 파일 업로드 엔진
───────────────────────────────────────── */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/bulletin/'),
    filename: (req, file, cb) => cb(null, `bulletin_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage: storage });

/* ─────────────────────────────────────────
    [API] 유저 관리 및 승인 (보강된 로직)
───────────────────────────────────────── */

/* ─────────────────────────────────────────
    [행정부] 데이터 보관소 (유저 리스트)
───────────────────────────────────────── */
let MEMBERS = [
    { id: 1, name: "황의종", phone: "01025530691", role: "admin", status: "ACTIVE", activeTeams: 0 },
    { id: 2, name: "이준혁", phone: "01051581731", role: "user", status: "ACTIVE", activeTeams: 1 }
    // 새가족이 가입하면 여기에 { status: "PENDING" } 상태로 추가됩니다.
];

// ... (다른 리스트들 생략) ...

/* ─────────────────────────────────────────
    [API] 유저 관리 및 승인 (이 부분이 핵심입니다!)
───────────────────────────────────────── */

// 1. 회원가입 API: 가입 시 PENDING 상태로 확실히 저장
app.post('/api/signup', (req, res) => {
    const { name, phone } = req.body;
    const cleanPhone = phone.replace(/-/g, "");
    
    // 중복 체크
    if (MEMBERS.find(m => m.phone === cleanPhone)) {
        return res.status(400).json({ success: false, message: "이미 등록된 번호입니다." });
    }

    const newUser = { 
        id: Date.now(), 
        name, 
        phone: cleanPhone, 
        role: "user", 
        status: "PENDING", // 반드시 대기 상태로!
        activeTeams: 0, 
        createdAt: new Date().toISOString() 
    };

    MEMBERS.push(newUser);
    console.log(`🆕 새가족 가입 신청: ${name} (${cleanPhone})`);
    res.json({ success: true });
});

// 2. 관리자용 전체 유저 조회 API: 반드시 MEMBERS 전체를 보냄
app.get('/api/admin/users', (req, res) => {
    console.log("👮 관리자가 전체 명단을 요청했습니다. 현재 인원:", MEMBERS.length);
    res.json(MEMBERS); // 필터링하지 말고 전체를 다 보내야 프론트에서 PENDING을 골라냅니다.
});

// 3. 유저 상태 변경 API: 승인 누르면 ACTIVE로 변경
app.post('/api/admin/update-user-status', (req, res) => {
    const { userId, status } = req.body;
    const user = MEMBERS.find(u => u.id === Number(userId));
    
    if (user) {
        user.status = status;
        console.log(`✅ 유저 상태 변경: ${user.name} -> ${status}`);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: "유저를 찾을 수 없습니다." });
    }
});

/* ─────────────────────────────────────────
    [API] 사역 콘텐츠 (예배/주보/기도)
───────────────────────────────────────── */

// 예배 영상
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

// 주보 관리
app.get('/api/bulletin/list', (req, res) => res.json({ success: true, data: [...BULLETIN_LIST].reverse() }));
app.post('/api/admin/upload-bulletin', upload.single('bulletin'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false });
    BULLETIN_LIST.push({ id: Date.now(), title: req.body.title || "새 주보", bulletinUrl: `/uploads/bulletin/${req.file.filename}`, createdAt: new Date().toISOString() });
    res.json({ success: true });
});
app.post('/api/admin/bulletin-delete', (req, res) => {
    const { ids } = req.body;
    BULLETIN_LIST = BULLETIN_LIST.filter(b => !ids.includes(b.id));
    res.json({ success: true });
});

// 기도 제목
app.get('/api/prayers', (req, res) => res.json({ success: true, data: PRAYERS }));

/* ─────────────────────────────────────────
    [핵심 API] 릴레이 필사 실시간 동기화
───────────────────────────────────────── */
app.get('/api/relay/status', (req, res) => {
    res.json({ ...relayStatus, timeLeft: Math.max(0, relayStatus.deadline - Date.now()) });
});

app.post('/api/relay/update-verse', (req, res) => {
    const { count, bookName, chapterNum, verseNum } = req.body;
    if (bookName) relayStatus.currentBookName = bookName;
    if (chapterNum) relayStatus.currentChapterNum = chapterNum;
    if (verseNum) relayStatus.currentVerseNum = verseNum;
    if (typeof count === 'number') {
        relayStatus.totalVerseCount = count;
    }
    console.log(`📖 [위치 갱신] ${relayStatus.currentBookName} ${relayStatus.currentChapterNum}:${relayStatus.currentVerseNum}`);
    res.json({ success: true, currentStatus: relayStatus });
});

/* ─────────────────────────────────────────
    [기본 기능] 로그인 / 성경파일 / 정적서비스
───────────────────────────────────────── */
app.post('/api/login', (req, res) => {
    const { name, phone } = req.body;
    const cleanPhone = phone.replace(/-/g, ""); 
    const user = MEMBERS.find(m => m.name === name && m.phone === cleanPhone);
    if (user && user.status === "ACTIVE") res.json({ success: true, user });
    else if (user && user.status === "PENDING") res.status(401).json({ success: false, message: "승인 대기 중입니다." });
    else res.status(401).json({ success: false, message: "정보 불일치" });
});

app.get('/api/bible/:fileName', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'data', 'bible', req.params.fileName));
});

const buildPath = path.resolve(__dirname, 'dist');
app.use(express.static(buildPath));
app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));

app.listen(PORT, () => console.log(`🚀 Saehakjang Full-System Server Running on Port ${PORT}`));