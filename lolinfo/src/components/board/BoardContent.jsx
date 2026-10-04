import { renderInlineWithLinks } from "./renderContentWithLinks";

export default function BoardContent({ content = "" }) {
    const lines = String(content ?? "").replace(/\r\n?/g, "\n").split("\n");
    const blocks = [];
    let paragraph = [];

    const flushParagraph = () => {
        if (paragraph.length === 0) return;

        blocks.push({ type: "paragraph", text: paragraph.join("\n") });
        paragraph = [];
    };

    for (const line of lines) {
        const heading = line.match(/^(#{2,3})\s+(.+)$/);
        const subtitle = line.match(/^\[([^\]]+)\]\s*$/);

        if (heading) {
            flushParagraph();
            blocks.push({
                type: heading[1].length === 2 ? "h2" : "h3",
                text: heading[2].trim(),
            });
        } else if (subtitle) {
            flushParagraph();
            blocks.push({ type: "subtitle", text: subtitle[1] });
        } else if (line.trim() === "") {
            flushParagraph();
        } else {
            paragraph.push(line);
        }
    }

    flushParagraph();

    return (
        <div className="board-content">
            {blocks.map((block, index) => {
                if (block.type === "subtitle") {
                    return <h2 className="board-content-subtitle" key={index}>{block.text}</h2>;
                }

                const text = renderInlineWithLinks(block.text, `block-${index}`);
                if (block.type === "h2") return <h2 key={index}>{text}</h2>;
                if (block.type === "h3") return <h3 key={index}>{text}</h3>;
                return <p key={index}>{text}</p>;
            })}
        </div>
    );
}
