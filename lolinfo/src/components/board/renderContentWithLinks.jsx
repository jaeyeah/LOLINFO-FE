import { Link } from "react-router-dom";

export const renderContentWithLinks = (text) => {
    if (!text) return text;

    const parts = [];
    // 따옴표와 HTML 구분자는 URL에 포함하지 않는다.
    const urlPattern = /https?:\/\/[^\s<>"'`“”‘’]+/gi;
    const closingBrackets = { ")": "(", "]": "[", "}": "{" };
    let lastIndex = 0;

    for (const match of text.matchAll(urlPattern)) {
        let href = match[0];

        // 문장 끝 부호는 제외하되 URL 안에서 짝이 맞는 괄호는 유지한다.
        while (href) {
            const trimmed = href.replace(/[.,!?;:。，！？；：…]+$/, "");
            if (trimmed !== href) {
                href = trimmed;
                continue;
            }
            const closing = href.at(-1);
            const opening = closingBrackets[closing];
            if (opening && href.split(closing).length > href.split(opening).length) {
                href = href.slice(0, -1);
                continue;
            }
            break;
        }

        let url;
        try {
            url = new URL(href);
        } catch {
            continue;
        }

        parts.push(text.slice(lastIndex, match.index));
        const isInternal = url.hostname === "sooplol.com" || url.hostname === "www.sooplol.com";

        parts.push(isInternal ? (
            <Link key={match.index} to={{ pathname: url.pathname, search: url.search, hash: url.hash }}>
                {href}
            </Link>
        ) : (
            <a key={match.index} href={href} target="_blank" rel="noopener noreferrer">
                {href}
            </a>
        ));
        lastIndex = match.index + href.length;
    }

    parts.push(text.slice(lastIndex));
    return parts;
};
