import fs from "fs";

const API_URL = "https://lolinfo.onrender.com";

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

for (const streamerNo of data.streamers) {
    const baseUrl = `https://sooplol.com/streamer/${streamerNo}`;

    urls.push(baseUrl);
    urls.push(`${baseUrl}/tournaments`);
    urls.push(`${baseUrl}/ck-records`);
    urls.push(`${baseUrl}/streamerWith`);
}

for (const tournamentId of data.tournaments) {
    urls.push(
        `https://sooplol.com/tournament/${tournamentId}`
    );
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