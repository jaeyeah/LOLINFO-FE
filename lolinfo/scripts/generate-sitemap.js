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
];

// 스트리머 기본 상세: 등록된 전체 스트리머
for (const streamerNo of data.streamers) {
    urls.push(`https://sooplol.com/streamer/${streamerNo}`);
}

// 대회 참가 기록이 있을 때만
for (const streamerNo of data.tournamentStreamers) {
    urls.push(`https://sooplol.com/streamer/${streamerNo}/tournaments`);
}

// CK 기록이 있을 때만
for (const streamerNo of data.ckStreamers) {
    urls.push(`https://sooplol.com/streamer/${streamerNo}/ck-records`);
}

// 대회 또는 CK 기록이 있으면 동료 전적 화면도 생성
const withStreamerNos = new Set([
    ...data.tournamentStreamers,
    ...data.ckStreamers,
]);

for (const streamerNo of withStreamerNos) {
    urls.push(`https://sooplol.com/streamer/${streamerNo}/streamerWith`);
}

for (const tournamentId of data.tournaments) {
    urls.push(`https://sooplol.com/tournament/${tournamentId}`);
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