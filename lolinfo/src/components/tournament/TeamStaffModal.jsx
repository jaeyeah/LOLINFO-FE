import { useCallback, useEffect, useState } from "react";
import axios from "../../utils/axios";
import { Link } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";


export default function TeamStaffModal({ teamId, teamName, show, onClose }) {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadStaffList = useCallback(async () => {
        if(!teamId) return;
        setLoading(true);

        try {
            const response = await axios.get(`/staff/team/${teamId}`);
            setStaffList(response.data);
        } catch (error) {
            console.error('Error fetching staff list:', error);
            setStaffList([]);
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        if(show) {
            loadStaffList();
        }
    }, [show]);
    if (!show) return null;

return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-light">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">
              {teamName} 감독/코치
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>

          </div>

          <div className="modal-body">
            {loading ? (
              <div className="text-center text-secondary py-3">
                불러오는 중...
              </div>
            ) : staffList.length === 0 ? (
              <div className="text-center text-secondary py-3">
                등록된 감독/코치가 없습니다.
              </div>
            ) : (
              <table className="table table-dark table-striped align-middle mb-0">
                <thead className="table-secondary text-dark text-center">
                  <tr>
                    <th>구분</th>
                    <th>이름</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {staffList.map((staff, index) => (
                    <tr key={`${staff.staffTeam}-${staff.staffStreamer}-${index}`}>
                      <td className={`${staff.staffRole === "감독" ? "text-warning" : "text-white"}`}>{staff.staffRole}</td>
                      <td>
                        <Link to={`/streamer/${staff.staffStreamer}`} className="ms-1 btn btn-link" rel="noopener noreferrer">
                            <img className="player-profile" src={buildProfileUrl(staff.streamerSoopId)} alt={staff.staffName}/>
                            <span className={`player-name ms-2 ${staff.staffRole === "감독" ? "text-warning" : "text-white"}`}>{staff.streamerName}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  )
;
};
