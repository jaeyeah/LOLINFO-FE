import { useOutletContext } from "react-router-dom";
import WithCk from "./WithCk";
import WithTournament from "./WithTournament";

export default function StreamerWith() {
  const { streamerId } = useOutletContext();
return (<>
<div className="mt-3 row">
    {/* 같이 CK 참여했던 스트리머 목록 */}
    <WithCk streamerId={streamerId} /> 
    {/* 같이 대회 참여했던 스트리머 목록 */}
    <WithTournament streamerId={streamerId} />
</div>
</>)
}