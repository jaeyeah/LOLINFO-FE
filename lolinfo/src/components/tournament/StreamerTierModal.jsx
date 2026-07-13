import axios from "../../utils/axios";
import { useCallback, useEffect, useState } from "react";
import { buildProfileUrl } from "../../utils/profileUrl";
import Swal from "sweetalert2";
import "./StreamerTier.css";

const POSITIONS = ["TOP", "JUG", "MID", "AD", "SUP"];
const POSITION_LABELS = {
  TOP: "탑",
  JUG: "정글",
  MID: "미드",
  AD: "원딜",
  SUP: "서폿",
};
const TIER_GRADES = [
  "Transcended","God","Legendary","Unique",
  "SSR","SR","R",
  "S+","S","S-",
  "A+","A","A-",
  "B+","B","B-",
  "C+","C","C-",
  "D+","D","D-",
  "E+","E","E-",
  "F+", "F", "F-",
  "미정",
];

export default function StreamerTierModal({ show, tournamentId, onClose, onSuccess }) {
  const [tierForm, setTierForm] = useState({
    tournamentNo: Number(tournamentId),
    streamerNo: "",
    tierPosition: "TOP",
    tierName: "미정",
  });
  const [streamerKeyword, setStreamerKeyword] = useState("");
  const [streamerSearchList, setStreamerSearchList] = useState([]);
  const [selectedStreamer, setSelectedStreamer] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    setTierForm({
      tournamentNo: Number(tournamentId),
      streamerNo: "",
      tierPosition: "TOP",
      tierName: "미정",
    });
    setStreamerKeyword("");
    setStreamerSearchList([]);
    setSelectedStreamer(null);
    setSearchError(null);
    setSubmitting(false);
  }, [tournamentId, show]);

  useEffect(() => {
  if (selectedStreamer) {
    setStreamerSearchList([]);
    setSearchError(null);
    return;
  }

  const keyword = streamerKeyword.trim();

  if (!keyword) {
    setStreamerSearchList([]);
    setSearchError(null);
    return;
  }

  const timer = setTimeout(async () => {
    try {
      setSearching(true);
      setSearchError(null);

      const { data } = await axios.get("/streamer/autoSearch", {
        params: { keyword },
      });

      setStreamerSearchList(data || []);
    } catch (err) {
      console.error("스트리머 검색 오류", err);
      setSearchError("스트리머 검색 중 오류가 발생했습니다.");
    } finally {
      setSearching(false);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [streamerKeyword, selectedStreamer]);

  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setStreamerKeyword(value);
    if (selectedStreamer) {
      setSelectedStreamer(null);
      setTierForm((prev) => ({ ...prev, streamerNo: "" }));
    }
  }, [selectedStreamer]);

  const handleSelectStreamer = useCallback((streamer) => {
    setSelectedStreamer(streamer);
    setStreamerKeyword(streamer.streamerName);
    setTierForm((prev) => ({ ...prev, streamerNo: streamer.streamerNo }));
    setStreamerSearchList([]);
  }, []);

  const handleTierFormChange = useCallback((event) => {
    const { name, value } = event.target;
    setTierForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedStreamer || !tierForm.streamerNo) {
      Swal.fire("선택 오류", "스트리머를 선택해주세요.", "warning");
      return;
    }
    if (!tierForm.tierPosition) {
      Swal.fire("선택 오류", "포지션을 선택해주세요.", "warning");
      return;
    }
    if (!tierForm.tierName) {
      Swal.fire("선택 오류", "티어를 선택해주세요.", "warning");
      return;
    }
    if (!tournamentId) {
      Swal.fire("오류", "대회 정보가 없습니다.", "error");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post("/streamer/tier", {
        tournamentNo: Number(tournamentId),
        streamerNo: Number(tierForm.streamerNo),
        tierPosition: tierForm.tierPosition,
        tierName: tierForm.tierName,
      });
      Swal.fire("등록 완료", "스트리머 티어가 등록되었습니다.", "success");
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error("티어 등록 실패", err);
      const message = err.response?.data?.message || err.response?.data || err.message;
      if (message && String(message).includes("중복")) {
        Swal.fire("등록 실패", "이미 해당 대회의 같은 포지션 티어가 등록된 스트리머입니다.", "error");
      } else {
        Swal.fire("등록 실패", message || "스트리머 티어 등록 중 오류가 발생했습니다.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  }, [selectedStreamer, tierForm, tournamentId, onClose, onSuccess]);



  if (!show) return null;

return (
  <>
    <div
      className="modal fade show d-block tier-modal"
      tabIndex="-1"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered tier-modal-dialog"
        role="document"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-content tier-modal-content p-0">
          <div className="modal-header">
            <h5 className="modal-title text-white">
              스트리머 티어 등록
            </h5>

            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>

          <div className="modal-body">
            <div className="row mb-3">
              <label className="col-sm-4 col-form-label text-white">
                스트리머 검색
              </label>

              <div className="col-sm-8 position-relative">
                <input
                  type="text"
                  className="form-control"
                  value={streamerKeyword}
                  placeholder="스트리머 이름을 입력하세요"
                  onChange={handleSearchChange}
                />

                {searching && (
                  <div className="text-white small mt-1">검색 중...</div>
                )}

                {searchError && (
                  <div className="text-danger small mt-1">
                    {searchError}
                  </div>
                )}

                {streamerSearchList.length > 0 && (
                  <div className="autocomplete-box">
                    {streamerSearchList.map((streamer) => (
                      <button
                        type="button"
                        key={streamer.streamerNo}
                        className="autocomplete-item"
                        onClick={() => handleSelectStreamer(streamer)}
                      >
                        {streamer.streamerName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedStreamer && (
              <div className="row mb-3 align-items-center">
                <div className="col-auto">
                  <img
                    src={buildProfileUrl(selectedStreamer.streamerSoopId)}
                    alt={selectedStreamer.streamerName}
                    className="player-profile"
                    style={{ width: 40, height: 40 }}
                  />
                </div>

                <div className="col">
                  <div className="fw-bold text-white">
                    {selectedStreamer.streamerName}
                  </div>
                  <div className="text-secondary">
                    No.{selectedStreamer.streamerNo}
                  </div>
                </div>

                <div className="col-auto">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-light"
                    onClick={() => {
                      setSelectedStreamer(null);
                      setStreamerKeyword("");
                      setTierForm((prev) => ({
                        ...prev,
                        streamerNo: "",
                      }));
                    }}
                  >
                    해제
                  </button>
                </div>
              </div>
            )}

            <div className="row mb-3">
              <label className="col-sm-4 col-form-label text-white">
                포지션
              </label>

              <div className="col-sm-8">
                <select
                  name="tierPosition"
                  value={tierForm.tierPosition}
                  onChange={handleTierFormChange}
                  className="form-select"
                >
                  {POSITIONS.map((position) => (
                    <option key={position} value={position}>
                      {POSITION_LABELS[position]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-4 col-form-label text-white">
                티어
              </label>

              <div className="col-sm-8">
                <select
                  name="tierName"
                  value={tierForm.tierName}
                  onChange={handleTierFormChange}
                  className="form-select"
                >
                  {TIER_GRADES.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              취소
            </button>

            <button
              type="button"
              className="btn btn-insert"
              onClick={handleSubmit}
              disabled={submitting || !selectedStreamer}
            >
              {submitting ? "등록 중..." : "등록"}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div className="modal-backdrop fade show" />
  </>
);
};