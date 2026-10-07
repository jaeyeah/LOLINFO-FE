import fs from "fs";

const API_URL = "https://sooplol.onrender.com";

const response = await fetch(`${API_URL}/api/sitemap/data`);

if (!response.ok) {
    throw new Error(`sitemap data load failed: ${response.status}`);
}

const data = await response.json();

const urls = [
    "https://sooplol.com/",
    "https://sooplol.com/streamer",
    "https://sooplol.com/ck",
    "https://sooplol.com/tournament",
    "https://sooplol.com/board",
    "https://sooplol.com/board/news",
    "https://sooplol.com/board/story",
    
    "https://sooplol.com/ranking/ck",
    "https://sooplol.com/ranking/myeolmang",
    "https://sooplol.com/stat",
    "https://sooplol.com/balance",
    
    "https://sooplol.com/devhistory",
    "https://sooplol.com/about",
    "https://sooplol.com/privacy",
    "https://sooplol.com/terms",
];

// 스트리머 기본 상세: 등록된 전체 스트리머
for (const streamerNo of data.streamers) {
    urls.push(`https://sooplol.com/streamer/${streamerNo}`);
}

// 대회 참가 기록이 있을 때만
// for (const streamerNo of data.tournamentStreamers) {
//     urls.push(`https://sooplol.com/streamer/${streamerNo}/tournaments`);
// }

// CK 기록이 있을 때만
// for (const streamerNo of data.ckStreamers) {
//     urls.push(`https://sooplol.com/streamer/${streamerNo}/ck-records`);
// }

// 대회 또는 CK 기록이 있으면 동료 전적 화면도 생성
// const withStreamerNos = new Set([
//     ...data.tournamentStreamers,
//     ...data.ckStreamers,
// ]);

// for (const streamerNo of withStreamerNos) {
//     urls.push(`https://sooplol.com/streamer/${streamerNo}/streamerWith`);
// }

for (const tournamentId of data.tournaments) {
    urls.push(`https://sooplol.com/tournament/${tournamentId}`);
}

// 공개 콘텐츠만 포함한다. 비로그인 상세 조회가 성공하는 글만 수록한다.
const boardResponse = await fetch(`${API_URL}/api/board/`);
if (!boardResponse.ok) throw new Error(`board sitemap load failed: ${boardResponse.status}`);
const boardData = await boardResponse.json();
const boards = Array.isArray(boardData) ? boardData : boardData?.list || [];
for (const board of boards) {
    if (!["정보", "blog"].includes(board.boardCategory) || !/^[1-9]\d*$/.test(String(board.boardId))) continue;
    const detailResponse = await fetch(`${API_URL}/api/board/${board.boardId}`);
    if ([401, 403, 404].includes(detailResponse.status)) continue;
    if (!detailResponse.ok) throw new Error(`board detail sitemap load failed: ${detailResponse.status}`);
    const detail = await detailResponse.json();
    if (String(detail?.boardId) === String(board.boardId) && detail.boardTitle && detail.boardContent) {
        urls.push(`https://sooplol.com/board/${board.boardId}`);
    }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        (url) => `  <url>
    <loc>${url}</loc>
  </url>`
    )
    .join("\n")}
</urlset>
`;

fs.writeFileSync("./public/sitemap.xml", xml, "utf8");

console.log(`sitemap.xml generated: ${urls.length} URLs`);