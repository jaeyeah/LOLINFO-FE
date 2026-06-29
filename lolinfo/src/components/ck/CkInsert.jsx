import axios from "axios";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";
import { useAtomValue } from "jotai";
import { loginState } from "../../utils/jotai";

const POSITIONS = ["TOP", "JUG", "MID", "AD", "SUP"];
const SIDES = ["red", "blue"];

export default function CkInsert() {
  const navigate = useNavigate();
  const isLogin = useAtomValue(loginState);
  const [checking, setChecking] = useState(false);

  // 전송용 State
  const [ck, setCk] = useState({
    ckDate: "",
    ckWinnerSide: "",
    ckMemo: "",
  });

  // 참여자 리스트 - 레드팀, 블루팀 각 5명씩 고정
  const [participants, setParticipants] = useState(
    SIDES.flatMap((side) =>
      POSITIONS.map((position) => ({
        ckSide: side,
        ckPosition: position,
        ckStreamer: "",
        streamerName: "",
        streamerSoopId: "",
      }))
    )
  );

  // 스트리머 검색 오류
  const [participantErrors, setParticipantErrors] = useState({});

  // 유효성 검사
  const [ckClass, setCkClass] = useState({
    ckDate: "",
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

  // 스트리머 검색
  const checkStreamer = useCallback(
    async (idx) => {
      const name = participants[idx]?.streamerName;
      if (!name) {
        setParticipantErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[idx];
          return newErrors;
        });
        return;
      }
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
        // 검색 성공 시 오류 제거
        setParticipantErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[idx];
          return newErrors;
        });
      } catch (err) {
        console.log("스트리머 검색 실패", err);
        // 검색 실패 시 오류 저장
        setParticipantErrors((prev) => ({
          ...prev,
          [idx]: "등록되지 않은 스트리머입니다",
        }));
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


  // 중복 스트리머 검사
  const getDuplicateStreamers = useMemo(() => {
    const streamerCounts = {};
    participants.forEach((p) => {
      if (p.ckStreamer) {
        streamerCounts[p.ckStreamer] = (streamerCounts[p.ckStreamer] || 0) + 1;
      }
    });
    return Object.keys(streamerCounts).filter((id) => streamerCounts[id] > 1);
  }, [participants]);

  const hasDuplicates = getDuplicateStreamers.length > 0;

  // 필수항목 검증
  const ckValid = useMemo(() => {
    if (ckClass.ckDate !== "is-valid") return false;
    if (participants.some((p) => !p.ckStreamer)) return false;
    if (hasDuplicates) return false;
    return true;
  }, [ckClass, participants, hasDuplicates]);

  // CK 등록
  const sendData = useCallback(async () => {
    if (checking) return;
    if (ckValid === false) return;
    try {
      const payload = {
        ckDate: ck.ckDate,
        ckWinner: ck.ckWinnerSide || null,
        ckMemo: ck.ckMemo,
        participants: participants.map((p) => ({
          ckSide: p.ckSide,
          ckPosition: p.ckPosition,
          ckStreamer: p.ckStreamer,
        })),
      };
      const response = await axios.post("/ck/", payload);
      navigate("/ck");
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

        {/* 승리팀 선택 */}
        <div className="row mt-2">
          <label className="col-sm-3 col-form-label">결과</label>
          <div className="col-sm-9">
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="ckWinnerSide"
                id="redWin"
                value="red"
                onChange={changeCkValue}
              />
              <label className="btn btn-outline-danger" htmlFor="redWin">
                레드팀 승리
              </label>

              <input
                type="radio"
                className="btn-check"
                name="ckWinnerSide"
                id="blueWin"
                value="blue"
                onChange={changeCkValue}
              />
              <label className="btn btn-outline-primary" htmlFor="blueWin">
                블루팀 승리
              </label>
            </div>
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

        
        {/* 팀 구성 */}
        <div className="row mt-4">
          {SIDES.map((side, sideIdx) => (
            <div key={side} className="col-lg-6 col-12">
              <div className="mb-3 mt-3">
                <h4 className="text-center">{side === "red" ? "레드" : "블루"}팀</h4>
              </div>

              {/* 해당 팀의 참여자들 */}
              {participants
                .filter((p) => p.ckSide === side)
                .map((participant, posIdx) => {
                  const globalIdx = participants.findIndex(
                    (p) => p.ckSide === side && p.ckPosition === participant.ckPosition
                  );
                  return (
                    <div key={`${side}-${posIdx}`} className="row mt-3 d-flex align-items-center">
                      {/* 포지션 라벨 */}
                      <div className="col-2 fw-bold text-center">
                        {participant.ckPosition}
                      </div>

                      {/* 스트리머 프로필 */}
                      <label className="col-2 col-form-label d-flex justify-content-center">
                        <img
                          className="player-profile"
                          src={buildProfileUrl(participant.streamerSoopId)}
                          alt={participant.streamerName}
                        />
                      </label>

                      {/* 스트리머 이름 */}
                      <div className="col-8">
                        <input
                          type="text"
                          className={`form-control ${participantErrors[globalIdx] ? "is-invalid" : ""}`}
                          name="streamerName"
                          value={participant.streamerName}
                          onChange={(e) => changeParticipantValue(globalIdx, e)}
                          onBlur={() => checkStreamer(globalIdx)}
                          placeholder={`${side==='red' ? '레드' : '블루'}팀 ${participant.ckPosition}`}
                        />
                        {participantErrors[globalIdx] && (
                          <div className="invalid-feedback d-block">
                            {participantErrors[globalIdx]}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>

        {/* 중복 스트리머 경고 */}
        {hasDuplicates && (
          <div className="alert alert-danger mt-3" role="alert">
            ⚠️ 같은 스트리머가 중복으로 등록되었습니다. 모든 스트리머를 다르게 등록해주세요.
          </div>
        )}

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

