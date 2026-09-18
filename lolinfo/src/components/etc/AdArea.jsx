import { useEffect, useRef, useState } from "react";
import "./Ad.css";

const createCoupangAdHtml = (width) => `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;overflow:hidden">
<script src="https://ads-partners.coupang.com/g.js"></script>
<script>new PartnersCoupang.G({"id":1031060,"template":"carousel","trackingCode":"AF6484702","width":"${width}","height":"90","tsource":""});</script>
</body></html>`;

export default function AdArea({ variant = "default", className = "" }) {
  const bannerRef = useRef(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (variant !== "content") return;

    const element = bannerRef.current;
    const observer = new ResizeObserver(([entry]) => {
      setContentWidth(Math.min(1520, Math.floor(entry.contentRect.width)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [variant]);

  if (variant === "default") {
    return <div className={`ad-area ad-area--default ${className}`} aria-label="광고">
      <iframe srcDoc={createCoupangAdHtml(970)} width="970" height="90" title="CK 목록 광고"
        scrolling="no" loading="lazy" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" />
    </div>;
  }

  if (variant !== "content") return null;

  return <div ref={bannerRef} className={`ad-area ad-area--${variant} ${className}`} aria-label="광고">
    {contentWidth > 0 && <iframe srcDoc={createCoupangAdHtml(contentWidth)} width={contentWidth} height="90"
      title="스트리머 상세 광고" scrolling="no" loading="lazy"
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" />}
  </div>;
}
