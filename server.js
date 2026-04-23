import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000; 

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

/* ─────────────────────────────────────────
    [행정부] 데이터 보관소 (DB 대용)
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
    [기술부] 파일 업로드 설정 (주보용)
───────────────────────────────────────── */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/bulletin/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `bulletin_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

/* ─────────────────────────────────────────
    [API] 📖 성경 말씀 (보안 및 경로 최적화 버전)
───────────────────────────────────────── */
app.get('/api/bible/:fileName', (req, res) => {
    const { fileName } = req.params;
    
    // 🚀 [핵심 수정] Render 서버에서 가장 안전한 절대 경로 탐색
    const bibleDir = path.resolve(process.cwd(), 'data', 'bible');
    
    // 서버 로그 확인용 (Render 대시보드 Logs 탭에서 보임)
    console.log(`🔍 말씀 요청: ${fileName} | 탐색 위치: ${bibleDir}`);

    // 1. 폴더 존재 여부 확인
    if (!fs.existsSync(bibleDir)) {
        console.error("❌ 폴더 없음: data/bible 폴더를 찾을 수 없습니다.");
        return res.status(404).json({ success: false, message: "서버 데이터 폴더 실종" });
    }

    // 2. 파일 목록 읽기 및 대소문자 무시 검색
    try {
        const files = fs.readdirSync(bibleDir);
        const actualFile = files.find(f => f.toLowerCase() === fileName.toLowerCase());

        if (actualFile) {
            const finalPath = path.join(bibleDir, actualFile);
            return res.sendFile(finalPath);
        } else {
            console.error(`❌ 파일 없음: ${fileName} (대소문자 포함 검색 실패)`);
            return res.status(404).json({ success: false, message: "파일을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error("❌ 서버 내부 오류:", error);
        return res.status(500).json({ success: false });
    }
});

/* ─────────────────────────────────────────
    [API] 유저 관리 & 로그인
───────────────────────────────────────── */
app.post('/api/login', (req, res) => {
    const { name, phone } = req.body;
    const cleanPhone = phone.replace(/-/g, ""); 
    const user = MEMBERS.find(m => m.name === name && m.phone === cleanPhone);
    if (user && user.status === "ACTIVE") res.json({ success: true, user });
    else res.status(401).json({ success: false, message: "접근 권한이 없습니다." });
});

app.post('/api/signup', (req, res) => {
    const { name, phone } = req.body;
    const cleanPhone = phone.replace(/-/g, "");
    if (MEMBERS.find(m => m.phone === cleanPhone)) return res.status(400).json({ success: false });
    const newUser = { id: Date.now(), name, phone: cleanPhone, role: "user", status: "ACTIVE", activeTeams: 0 };
    MEMBERS.push(newUser);
    res.json({ success: true, user: newUser });
});

app.get('/api/admin/users', (req, res) => res.json([...MEMBERS].reverse()));

/* ─────────────────────────────────────────
    [API] 예배 & 주보 관리 (기존 기능 유지)
───────────────────────────────────────── */
app.get('/api/worship/list', (req, res) => res.json({ success: true, data: WORSHIP_LIST }));

app.post('/api/admin/worship', (req, res) => {
    const { videoUrl, sermonTitle } = req.body;
    const newWorship = { id: Date.now(), videoUrl, sermonTitle, updatedAt: new Date().toISOString() };
    WORSHIP_LIST = [newWorship, ...WORSHIP_LIST].slice(0, 5);
    res.json({ success: true, data: newWorship });
});

app.get('/api/bulletin/list', (req, res) => res.json({ success: true, data: BULLETIN_LIST }));

app.post('/api/admin/bulletin', upload.single('bulletin'), (req, res) => {
    const { title } = req.body;
    const bulletinUrl = req.file ? `/uploads/bulletin/${req.file.filename}` : "";
    const newBulletin = { id: Date.now(), title, bulletinUrl, createdAt: new Date().toISOString() };
    BULLETIN_LIST = [newBulletin, ...BULLETIN_LIST];
    res.json({ success: true, data: newBulletin });
});

app.delete('/api/admin/bulletin/:id', (req, res) => {
    BULLETIN_LIST = BULLETIN_LIST.filter(b => String(b.id) !== String(req.params.id));
    res.json({ success: true });
});

/* ─────────────────────────────────────────
    [API] 릴레이 필사 & 중보기도
───────────────────────────────────────── */
app.get('/api/relay/status', (req, res) => res.json(relayStatus));

app.post('/api/relay/update-verse', (req, res) => {
    const { bookName, chapterNum, verseNum } = req.body;
    if (bookName) relayStatus.currentBookName = bookName;
    if (chapterNum) relayStatus.currentChapterNum = chapterNum;
    if (verseNum) relayStatus.currentVerseNum = verseNum;
    relayStatus.totalVerseCount += 1;
    res.json({ success: true, currentStatus: relayStatus });
});

app.get('/api/prayers', (req, res) => res.json({ success: true, data: [...PRAYERS].reverse() }));

app.post('/api/prayers', (req, res) => {
    const { content, authorName, isAnonymous, category } = req.body;
    const newPrayer = { id: Date.now(), content, authorName: isAnonymous ? "익명" : authorName, category, createdAt: new Date().toISOString() };
    PRAYERS.push(newPrayer);
    res.json({ success: true, data: newPrayer });
});

/* ─────────────────────────────────────────
    [기술부] 배포 설정
───────────────────────────────────────── */
const buildPath = path.resolve(__dirname, 'dist');
app.use(express.static(buildPath));
app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));

app.listen(PORT, () => console.log(`🚀 Saehacjang Full-Stack Server Running on ${PORT}`));