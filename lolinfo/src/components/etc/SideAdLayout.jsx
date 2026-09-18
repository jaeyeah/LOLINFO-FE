import "./SideAdLayout.css";

const SIDE_AD_SRC = "https://ads-partners.coupang.com/widgets.html?id=1031071&template=carousel&trackingCode=AF6484702&subId=&width=160&height=900&tsource=";
const RIGHT_SIDE_AD_SRC = "https://ads-partners.coupang.com/widgets.html?id=1031124&template=carousel&trackingCode=AF6484702&subId=&width=160&height=900&tsource=";

function SideAd({ position }) {
    const adSrc = position === "오른쪽" ? RIGHT_SIDE_AD_SRC : SIDE_AD_SRC;

    return (
        <aside className="side-ad-layout-ad" aria-label={`${position} 광고`}>
            <iframe
                src={adSrc}
                width="160"
                height="900"
                frameBorder="0"
                scrolling="no"
                referrerPolicy="unsafe-url"
                title={`${position} 쿠팡 파트너스 광고`}
            />
            <p className="side-ad-layout-disclosure">
                쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
        </aside>
    );
}

export default function SideAdLayout({ children }) {
    return (
        <div className="side-ad-layout">
            <SideAd position="왼쪽" />
            <main className="side-ad-layout-content">{children}</main>
            <SideAd position="오른쪽" />
        </div>
    );
}
