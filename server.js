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
    { id: 1, name: "황의종", phone: "01025530691", role: "admin", status: "ACTIVE", activeTeams: 0 },
    { id: 2, name: "이준혁", phone: "01051581731", role: "user", status: "ACTIVE", activeTeams: 1 }
];

let PRAYERS = [
  { id: 1, content: "새학장 교회의 부흥을 위해 기도합니다.", authorName: "황의종", authorPhone: "01025530691", isAnonymous: false, category: "신앙", createdAt: new Date().toISOString() }
];

let WORSHIP_LIST = [
    { id: 1, videoUrl: "https://www.youtube.com/embed/현장예배코드", sermonTitle: "주의 길을 예비하라", updatedAt: new Date().toISOString() }
];

let BULLETIN_LIST = [
    { id: 1, title: "제 2026-01호 주보", bulletinUrl: "", createdAt: new Date().toISOString() }
];

/* ─────────────────────────────────────────
    [지휘부] 릴레이 필사 현황
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
    [API] 유저 관리 (소문자 signup으로 통일!)
───────────────────────────────────────── */
app.post('/api/signup', (req, res) => { // 🚀 소문자로 전격 수정!
    const { name, phone } = req.body;
    const cleanPhone = phone.replace(/-/g, "");
    
    if (MEMBERS.find(m => m.phone === cleanPhone)) {
        return res.status(400).json({ success: false, message: "이미 등록된 번호입니다." });
    }

    const newUser = { 
        id: Date.now(), 
        name, 
        phone: cleanPhone, 
        role: "user", 
        status: "ACTIVE", // 🚀 가입 즉시 활동 가능하게 변경!
        activeTeams: 0, 
        createdAt: new Date().toISOString() 
    };

    MEMBERS.push(newUser);
    console.log(`🎊 새가족 등록: ${name}`);
    res.json({ success: true, user: newUser });
});

app.get('/api/admin/users', (req, res) => {
    // 최신 가입자가 위로 오게 뒤집어서 보냅니다.
    res.json([...MEMBERS].reverse()); 
});

app.post('/api/admin/update-user-status', (req, res) => {
    const { userId, status } = req.body;
    const user = MEMBERS.find(u => String(u.id) === String(userId));
    
    if (user) {
        user.status = status;
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

/* ─────────────────────────────────────────
    [API] 중보기도 (대시보드 연동 강화)
───────────────────────────────────────── */
app.get('/api/prayers', (req, res) => {
    res.json({ success: true, data: [...PRAYERS].reverse() });
});

app.post('/api/prayers', (req, res) => {
    const { content, authorName, authorPhone, isAnonymous, category } = req.body;
    if (!content) return res.status(400).json({ success: false, message: "내용이 없습니다." });

    const newPrayer = {
        id: Date.now(),
        content,
        authorName: isAnonymous ? "익명" : (authorName || "성도"),
        authorPhone: authorPhone || "",
        isAnonymous: !!isAnonymous,
        category: category || "기타",
        createdAt: new Date().toISOString()
    };

    PRAYERS.push(newPrayer);
    console.log(`🙏 새 기도제목 접수 완료`);
    res.json({ success: true, data: newPrayer });
});

/* ─────────────────────────────────────────
    [필사/예배/주보 API] (기존 로직 유지)
───────────────────────────────────────── */
app.get('/api/relay/status', (req, res) => {
    res.json({ ...relayStatus, timeLeft: Math.max(0, relayStatus.deadline - Date.now()) });
});

app.post('/api/relay/update-verse', (req, res) => {
    const { count, bookName, chapterNum, verseNum } = req.body;
    if (bookName) relayStatus.currentBookName = bookName;
    if (chapterNum) relayStatus.currentChapterNum = chapterNum;
    if (verseNum) relayStatus.currentVerseNum = verseNum;
    if (typeof count === 'number') relayStatus.totalVerseCount = count;
    res.json({ success: true, currentStatus: relayStatus });
});

app.post('/api/login', (req, res) => {
    const { name, phone } = req.body;
    const cleanPhone = phone.replace(/-/g, ""); 
    const user = MEMBERS.find(m => m.name === name && m.phone === cleanPhone);
    if (user && user.status === "ACTIVE") res.json({ success: true, user });
    else if (user && user.status === "PENDING") res.status(401).json({ success: false, message: "승인 대기 중입니다." });
    else res.status(401).json({ success: false, message: "정보 불일치" });
});

app.get('/api/worship/list', (req, res) => res.json({ success: true, data: [...WORSHIP_LIST].reverse() }));
app.get('/api/bulletin/list', (req, res) => res.json({ success: true, data: [...BULLETIN_LIST].reverse() }));

// ... (기타 주보 업로드/삭제 로직 유지) ...

const buildPath = path.resolve(__dirname, 'dist');
app.use(express.static(buildPath));
app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));

app.listen(PORT, () => console.log(`🚀 Saehakjang Server FIXED & Running on ${PORT}`));