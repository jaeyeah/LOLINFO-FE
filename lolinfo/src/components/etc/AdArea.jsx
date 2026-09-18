import { useEffect, useRef, useState } from "react";
import "./Ad.css";

const AD_HEIGHT = 90;
const DISCLOSURE = "쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

const createCoupangAdHtml = (width) => `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;overflow:hidden">
<script src="https://ads-partners.coupang.com/g.js"></script>
<script>new PartnersCoupang.G({"id":1031060,"template":"carousel","trackingCode":"AF6484702","width":"${width}","height":"90","tsource":""});</script>
</body></html>`;

function CoupangBanner({ width, title }) {
  const src = `data:text/html;charset=utf-8,${encodeURIComponent(createCoupangAdHtml(width))}`;

  return <div className="ad-area-coupang">
    <iframe src={src} width={width} height={AD_HEIGHT} title={title}
      scrolling="no" loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" />
    <p className="ad-area-disclosure">{DISCLOSURE}</p>
  </div>;
}

export default function AdArea({ variant = "default", className = "" }) {
  const bannerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const maxWidth = variant === "content" ? 1520 : 1100;

  useEffect(() => {
    if (variant !== "default" && variant !== "content") return;
    const element = bannerRef.current;
    if (!element) return;

    let resizeTimer;
    const measure = () => {
      const nextWidth = Math.min(maxWidth, Math.max(0, Math.floor(element.getBoundingClientRect().width)));
      setWidth((previous) => previous === nextWidth ? previous : nextWidth);
    };
    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 150);
    });
    observer.observe(element);
    return () => {
      clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, [variant, maxWidth]);

  if (variant !== "default" && variant !== "content") return null;

  return <div ref={bannerRef} className={`ad-area ad-area--${variant} ${className}`} aria-label="광고">
    {width > 0 && <CoupangBanner key={`${variant}-${width}`} width={width}
      title={variant === "default" ? "CK 목록 광고" : "스트리머 상세 광고"} />}
  </div>;
}
