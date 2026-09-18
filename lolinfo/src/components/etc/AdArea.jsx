import { useEffect, useRef } from "react";
import "./Ad.css";

export default function AdArea({ variant = "default", className = "" }) {
  const bannerRef = useRef(null);

  useEffect(() => {
    if (variant !== "content") return;

    let disposed = false;
    let scriptElement;

    const initializeBanner = () => {
      if (disposed || !bannerRef.current || typeof window.HawkEyes !== "function") return;
      if (bannerRef.current.dataset.initialized === "true") return;

      new window.HawkEyes({
        type: "banner",
        responsive: "Y",
        platform: "W",
        scriptCode: "1069954",
        frameCode: "75",
        width: "970",
        height: "90",
        settings: { cntsr: "2", cntad: "1" },
      });
      bannerRef.current.dataset.initialized = "true";
    };

    const existingScript = document.querySelector("script[data-mobon-hawk-eyes]");
    if (existingScript) {
      existingScript.addEventListener("load", initializeBanner);
      initializeBanner();
    } else {
      scriptElement = document.createElement("script");
      scriptElement.src = "//img.mobon.net/js/common/HawkEyesMaker.js";
      scriptElement.async = true;
      scriptElement.dataset.mobonHawkEyes = "true";
      scriptElement.addEventListener("load", initializeBanner);
      document.body.appendChild(scriptElement);
    }

    return () => {
      disposed = true;
      existingScript?.removeEventListener("load", initializeBanner);
      scriptElement?.removeEventListener("load", initializeBanner);
    };
  }, [variant]);

  if (variant !== "content") return null;

  return <div ref={bannerRef} className={`ad-area ad-area--${variant} ${className}`} aria-label="광고" />;
}
