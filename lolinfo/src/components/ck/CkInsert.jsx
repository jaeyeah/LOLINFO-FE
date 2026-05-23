import axios from "axios";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";
import { useAtomValue } from "jotai";
import { loginState } from "../../utils/jotai";

export default function CkInsert() {
  const navigate = useNavigate();
  const isLogin = useAtomValue(loginState);
  const [checking, setChecking] = useState(false);

  // 전송용 State
  const [ck, setCk] = useState({
    ckDate: "",
    ckWinner: "",
    ckMemo: "",
  });

  // 참여자 리스트
  const [participants, setParticipants] = useState([
    { ckSide: "레드", ckPosition: "", ckStreamer: "", streamerName: "", streamerSoopId: "" },
  ]);

  // 유효성 검사
  const [ckClass, setCkClass] = useState({
    ckDate: "",
    ckWinner: "",
  });

  // callback
  const changeCkValue = useCallback((e) => {
    const { name, value } = e.target;
    setCk((prev) => ({ ...prev, [name]: value }));
  }, []);

  const changeParticipantValue = useCallback((index, e) => {
    const { name, value } = e.target;
    setParticipants((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [name]: value } : p))
    );
  }, []);

  // 참여자 행 추가/삭제
  const addParticipantRow = useCallback(() => {
    setParticipants((prev) => [
      ...prev,
      { ckSide: "블루", ckPosition: "", ckStreamer: "", streamerName: "", streamerSoopId: "" },
    ]);
  }, []);

  const removeParticipantRow = useCallback((index) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // 스트리머 검색
  const checkStreamer = useCallback(
    async (idx) => {
      const name = participants[idx]?.streamerName;
      if (!name) return;
      try {
        setChecking(true);
        const { data } = await axios.get(`/team/check/${name}`);
        setParticipants((prev) =>
          prev.map((p, i) =>
            i === idx
              ? {
                  ...p,
                  ckStreamer: data.streamerNo,
                  streamerSoopId: data.streamerSoopId,
                }
              : p
          )
        );
      } catch (err) {
        console.log("스트리머 검색 실패", err);
      } finally {
        setChecking(false);
      }
    },
    [participants]
  );

  // 유효성 검사
  const checkCkDate = useCallback(() => {
    const valid = ck.ckDate.length > 0;
    setCkClass((prev) => ({ ...prev, ckDate: valid ? "is-valid" : "is-invalid" }));
  }, [ck]);

  const checkCkWinner = useCallback(() => {
    const valid = ck.ckWinner.length > 0;
    setCkClass((prev) => ({ ...prev, ckWinner: valid ? "is-valid" : "is-invalid" }));
  }, [ck]);

  // 필수항목 검증
  const ckValid = useMemo(() => {
    if (ckClass.ckDate !== "is-valid") return false;
    if (ckClass.ckWinner !== "is-valid") return false;
    if (participants.length === 0) return false;
    if (participants.some((p) => !p.ckStreamer)) return false;
    if (participants.some((p) => !p.ckPosition)) return false;
    return true;
  }, [ckClass, participants]);

  // CK 등록
  const sendData = useCallback(async () => {
    if (checking) return;
    if (ckValid === false) return;
    try {
      const payload = {
        ckDate: ck.ckDate,
        ckWinner: ck.ckWinner,
        ckMemo: ck.ckMemo,
        participants: participants.map((p) => ({
          ckSide: p.ckSide,
          ckPosition: p.ckPosition,
          ckStreamer: p.ckStreamer,
        })),
      };
      const response = await axios.post("/api/ck/", payload);
      console.log("CK 등록 성공", response);
      navigate("/"); // 메인페이지
    } catch (err) {
      console.log("CK 등록 실패");
      console.log("err.response.status", err.response?.status);
      console.log("err.response.data", err.response?.data);
    }
  }, [ck, ckValid, participants, checking, navigate]);

  return (
    <>
      <div className="insert-form d-f">
        <div className="row">
          <div className="col text-center">
            <h2>신규 CK 등록</h2>
            <hr />
          </div>
        </div>

        {/* CK 기본 정보 */}
        {/* 날짜 */}
        <div className="row mt-2">
          <label className="col-sm-3 col-form-label">날짜</label>
          <div className="col-sm-9">
            <input
              type="date"
              className={`form-control ${ckClass.ckDate}`}
              name="ckDate"
              value={ck.ckDate}
              onChange={changeCkValue}
              onBlur={checkCkDate}
            />
            <div className="valid-feedback"></div>
            <div className="invalid-feedback">날짜를 입력해주세요</div>
          </div>
        </div>

        {/* 우승팀 */}
        <div className="row mt-2">
          <label className="col-sm-3 col-form-label">우승팀</label>
          <div className="col-sm-9">
            <input
              type="text"
              className={`form-control ${ckClass.ckWinner}`}
              name="ckWinner"
              value={ck.ckWinner}
              onChange={changeCkValue}
              onBlur={checkCkWinner}
              placeholder="우승팀 이름"
            />
            <div className="valid-feedback"></div>
            <div className="invalid-feedback">우승팀을 입력해주세요</div>
          </div>
        </div>

        {/* 메모 */}
        <div className="row mt-2">
          <label className="col-sm-3 col-form-label">메모</label>
          <div className="col-sm-9">
            <input
              type="text"
              className="form-control"
              name="ckMemo"
              value={ck.ckMemo}
              onChange={changeCkValue}
              placeholder="추가 메모"
            />
          </div>
        </div>

        <hr />

        {/* 참여자 추가 */}
        <button type="button" className="btn btn-outline-primary mt-2" onClick={addParticipantRow}>
          + 참여자 추가
        </button>

        {/* 참여자 목록 */}
        {participants.map((participant, idx) => (
          <div key={idx} className="row mt-2 ms-1 d-flex align-items-center">
            {/* 팀 선택 */}
            <div className="col-2">
              <select
                className="form-control"
                name="ckSide"
                value={participant.ckSide}
                onChange={(e) => changeParticipantValue(idx, e)}
              >
                <option value="레드">레드</option>
                <option value="블루">블루</option>
              </select>
            </div>

            {/* 포지션 */}
            <div className="col-2">
              <select
                className="form-control"
                name="ckPosition"
                value={participant.ckPosition}
                onChange={(e) => changeParticipantValue(idx, e)}
              >
                <option value="">- 선택 -</option>
                <option value="TOP">TOP</option>
                <option value="JUG">JUG</option>
                <option value="MID">MID</option>
                <option value="AD">AD</option>
                <option value="SUP">SUP</option>
              </select>
            </div>

            {/* 스트리머 프로필 */}
            <label className="col-2 col-form-label d-flex justify-content-center">
              <img
                className="player-profile ms-3"
                src={buildProfileUrl(participant.streamerSoopId)}
                alt={participant.streamerName}
              />
            </label>

            {/* 스트리머 이름 */}
            <div className="col-3">
              <input
                type="text"
                className="form-control"
                name="streamerName"
                value={participant.streamerName}
                onChange={(e) => changeParticipantValue(idx, e)}
                onBlur={() => checkStreamer(idx)}
                placeholder="스트리머 이름"
              />
            </div>

            {/* 삭제 버튼 */}
            <button
              type="button"
              className="col-1 btn btn-danger"
              onClick={() => removeParticipantRow(idx)}
              disabled={participants.length === 1}
            >
              삭제
            </button>
          </div>
        ))}

        {/* 등록 버튼 */}
        {isLogin === true && (
          <div className="row mt-4">
            <div className="col">
              <button
                type="button"
                className="btn btn-lg btn-insert w-100"
                disabled={ckValid === false || checking}
                onClick={sendData}
              >
                <span>등록</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
