export async function onRequest(context) {

    const cache = caches.default;
    const cacheKey = new Request(context.request.url, {
        method: "GET"
    });

    // Cloudflare 캐시 확인
    let cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
        return cachedResponse;
    }

    // 캐시에 없으면 Render 호출
    const response = await fetch(
        "https://lolinfo.onrender.com/sitemap.xml"
    );

    if (!response.ok) {
        return new Response("Failed to load sitemap", {
            status: response.status
        });
    }

    const xml = await response.text();

    const sitemapResponse = new Response(xml, {
        status: 200,
        headers: {
            "Content-Type": "application/xml; charset=UTF-8",
            "Cache-Control": "public, max-age=86400"
        }
    });

    // 하루 캐시
    context.waitUntil(
        cache.put(cacheKey, sitemapResponse.clone())
    );

    return sitemapResponse;
}