import "./SideAdLayout.css";
import { useState } from "react";

const SIDE_AD_SRC = "https://ads-partners.coupang.com/widgets.html?id=1031071&template=carousel&trackingCode=AF6484702&subId=&width=160&height=900&tsource=";
const RIGHT_SIDE_AD_SRC = "https://ads-partners.coupang.com/widgets.html?id=1031124&template=carousel&trackingCode=AF6484702&subId=&width=160&height=900&tsource=";
const AD_STATE_DURATION = 5 * 60 * 1000;

function SideAd({ position }) {
    const storageKey = `side-ad-${position}-state`;
    const [isOpen, setIsOpen] = useState(() => {
        try {
            const savedState = sessionStorage.getItem(storageKey);

            if (!savedState) {
                return true;
            }

            const { isOpen: savedIsOpen, savedAt } = JSON.parse(savedState);

            if (Date.now() - savedAt >= AD_STATE_DURATION) {
                sessionStorage.removeItem(storageKey);
                return true;
            }

            return savedIsOpen;
        } catch {
            return true;
        }
    });
    const adSrc = position === "오른쪽" ? RIGHT_SIDE_AD_SRC : SIDE_AD_SRC;
    const isLeft = position === "왼쪽";
    const arrow = isOpen === isLeft ? "←" : "→";

    const toggleAd = () => {
        setIsOpen((open) => {
            const nextIsOpen = !open;

            try {
                sessionStorage.setItem(
                    storageKey,
                    JSON.stringify({ isOpen: nextIsOpen, savedAt: Date.now() })
                );
            } catch {
            }

            return nextIsOpen;
        });
    };

    return (
        <aside className={`side-ad-layout-ad ${isOpen ? "is-open" : "is-collapsed"} ${isLeft ? "is-left" : "is-right"}`} aria-label={`${position} 광고`}>
            <button
                className="side-ad-layout-toggle"
                type="button"
                onClick={toggleAd}
                aria-label={`${position} 광고 ${isOpen ? "접기" : "펼치기"}`}
                title={`${position} 광고 ${isOpen ? "접기" : "펼치기"}`}
            >
                {arrow}
            </button>
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
