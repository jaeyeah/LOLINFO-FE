import "./Ad.css";

export default function AdArea({ variant = "default", className = "" }) {
  return (
    <div className={`ad-area ad-area--${variant} ${className}`}>
      {/* AdSense 승인 후 광고 코드 삽입 */}
      {/* <span>광고 영역</span> */}
    </div>
  )
}