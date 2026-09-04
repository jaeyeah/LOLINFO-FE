export async function onRequest() {
    const response = await fetch(
        "https://lolinfo.onrender.com/sitemap.xml"
    );

    const xml = await response.text();

    return new Response(xml, {
        status: response.status,
        headers: {
            "Content-Type": "application/xml; charset=UTF-8",
        },
    });
}