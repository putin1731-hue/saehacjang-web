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
    [행정부] 데이터 보관소 (영구 기록용 배열 구조)
───────────────────────────────────────── */

// 1. 성도 명단 (status: PENDING인 경우 관리자 승인 대기 명단에 노출됨)
let MEMBERS = [
    { id: 1, name: "황의종", phone: "01025530691", role: "admin", status: "ACTIVE", activeTeams: 0 },
    { id: 2, name: "이준혁", phone: "01051581731", role: "user", status: "ACTIVE", activeTeams: 1 },
    { id: 99, name: "신규테스트", phone: "01000000000", role: "user", status: "PENDING", activeTeams: 0 } // 테스트용 대기자
];

// 2. 중보기도 (isAnonymous 속성으로 익명 처리 대응)
let PRAYERS = [
  { id: 1, content: "새학장 교회의 부흥을 위해 기도합니다.", authorName: "황의종", authorPhone: "01025530691", isAnonymous: false, createdAt: new Date().toISOString() },
  { id: 2, content: "성경 필사 사역이 은혜롭게 진행되길 원합니다.", authorName: "이준혁", authorPhone: "01051581731", isAnonymous: true, createdAt: new Date().toISOString() }
];

// 3. 주일예배 영상 리스트 (WorshipVideo.jsx 연동)
let WORSHIP_LIST = [
    { id: 1, videoUrl: "https://www.youtube.com/embed/현장예배코드", sermonTitle: "주의 길을 예비하라", updatedAt: new Date().toISOString() }
];

// 4. 주간 주보 리스트 (Bulletin.jsx 연동)
let BULLETIN_LIST = [
    { id: 1, title: "제 2026-01호 주보", bulletinUrl: "", createdAt: new Date().toISOString() }
];

/* ─────────────────────────────────────────
    [기술부] 주보 업로드 엔진 (Multer)
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
    [관제 센터 지원 API] - 데이터 조회 및 승인
───────────────────────────────────────── */

// 1. 관리자용 전체 성도 명단 조회
app.get('/api/admin/users', (req, res) => {
    console.log("👤 [관제센터] 명단 요청 수신 - 현재 총원:", MEMBERS.length);
    res.json(MEMBERS || []); 
});

// 2. 기도 데이터 조회 (관리자/성도 공용)
app.get('/api/prayers', (req, res) => {
    console.log("🕊️ [관제센터] 기도 제목 데이터 요청");
    res.status(200).json({ success: true, data: PRAYERS || [] });
});

// 3. 신규 가입 승인 처리
app.post('/api/admin/update-user-status', (req, res) => {
    const { userId, status } = req.body;
    const user = MEMBERS.find(u => u.id === userId);
    if (user) {
        user.status = status;
        console.log(`✅ [승인처리] ${user.name} 성도님의 상태가 ${status}로 변경되었습니다.`);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }
});

/* ─────────────────────────────────────────
    [사역 업데이트 API] - 주보 및 예배 영상 신규 등록(+)
───────────────────────────────────────── */

// 예배 영상 리스트 조회 및 추가
app.get('/api/worship/list', (req, res) => {
    res.json({ success: true, data: [...WORSHIP_LIST].reverse() }); // 최신순
});

app.post('/api/admin/worship-update', (req, res) => {
    const { videoUrl, sermonTitle } = req.body;
    const newWorship = {
        id: WORSHIP_LIST.length + 1,
        videoUrl,
        sermonTitle,
        updatedAt: new Date().toISOString()
    };
    WORSHIP_LIST.push(newWorship);
    console.log("📺 [NEW] 신규 예배 영상 추가 완료:", sermonTitle);
    res.json({ success: true });
});

// 주보 리스트 조회 및 업로드
app.get('/api/bulletin/list', (req, res) => {
    res.json({ success: true, data: [...BULLETIN_LIST].reverse() }); // 최신순
});

app.post('/api/admin/upload-bulletin', upload.single('bulletin'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "파일 없음" });
    const fileUrl = `/uploads/bulletin/${req.file.filename}`;
    const newBulletin = {
        id: BULLETIN_LIST.length + 1,
        title: req.body.title || `${new Date().toLocaleDateString()} 주보`,
        bulletinUrl: fileUrl,
        createdAt: new Date().toISOString()
    };
    BULLETIN_LIST.push(newBulletin);
    console.log("📂 [NEW] 신규 주보 업로드 완료:", newBulletin.title);
    res.json({ success: true, fileUrl });
});

/* ─────────────────────────────────────────
    [기존 핵심 로직] 로그인 / 릴레이 / 성경 파일 (100% 호환)
───────────────────────────────────────── */
app.post('/api/login', (req, res) => {
    const { name, phone } = req.body;
    const cleanPhone = phone.replace(/-/g, ""); 
    const user = MEMBERS.find(m => m.name === name && m.phone === cleanPhone);
    user ? res.json({ success: true, user }) : res.status(401).json({ success: false, message: "명단 확인 불가" });
});

app.get('/api/relay/status', (req, res) => {
    const now = Date.now();
    const timeLeft = Math.max(0, relayStatus.deadline - now);
    res.json({ ...relayStatus, timeLeft });
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

/* ─────────────────────────────────────────
    [정적 파일 서비스] (최하단 유지)
───────────────────────────────────────── */
const buildPath = path.resolve(__dirname, 'dist');
app.use(express.static(buildPath));
app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));

cron.schedule('* * * * *', () => {
    if (Date.now() > relayStatus.deadline && !relayStatus.isConfirmed && relayStatus.type === "TEAM") {
        relayStatus.status = "VOID";
    }
});

app.listen(PORT, () => console.log(`🚀 Saehakjang Church Server Running with All Integrated Admin Features`));