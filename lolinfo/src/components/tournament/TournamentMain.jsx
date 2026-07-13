import axios from "../../utils/axios";
import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { buildProfileUrl } from "../../utils/profileUrl";
import TeamStaffModal from "./TeamStaffModal";
import ScrimList from "./ScrimList";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useAtomValue } from "jotai";
import { adminState, loginIdState, loginState } from "../../utils/jotai";
import "./Tournament.css";
import "./Scrim.css";
import Swal from "sweetalert2";
import { FaRegStar, FaStar } from "react-icons/fa6";

export default function TournamentMain() {
  const { tournament, tournamentId, isAdmin } = useOutletContext();
  const isLogin = useAtomValue(loginState);
  const loginId = useAtomValue(loginIdState);

  const [team, setTeam] = useState([]);
  const [scrimRecordList, setScrimRecordList] = useState([]);
  const [showScrimModal, setShowScrimModal] = useState(false);
  const [scrimRefreshKey, setScrimRefreshKey] = useState(0);
  const [scrimRecordError, setScrimRecordError] = useState(null);
  const [selectedScrimTeam, setSelectedScrimTeam] = useState(null);
  const [vsRecordList, setVsRecordList] = useState([]);
  const [vsRecordLoading, setVsRecordLoading] = useState(false);
  const [scrimForm, setScrimForm] = useState({
    scrimTournament: Number(tournamentId),
    scrimRedTeam: "",
    scrimBlueTeam: "",
    scrimRedScore: 0,
    scrimBlueScore: 0,
    scrimDate: new Date().toISOString().split("T")[0],
    scrimHour: 0,
    scrimMatchType: "스크림",
  });
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const loadTeamData = useCallback(async () => {
    if (!tournamentId) return;
    try {
      const { data } = await axios.get(`/team/tournament/${tournamentId}`);
      setTeam(data);
    } catch (err) {
      console.error("팀 로딩 오류", err);
    }
  }, [tournamentId]);

  const loadScrimRecordList = useCallback(async () => {
    if (!tournamentId) return;
    try {
      setScrimRecordError(null);
      const { data } = await axios.get(`/scrim/record/${tournamentId}`);
      setScrimRecordList(data);
    } catch (err) {
      console.error("팀별 스크림 승률 로딩 오류", err);
      setScrimRecordError("팀별 스크림 승률을 불러오지 못했습니다.");
    }
  }, [tournamentId]);

  useEffect(() => {
    if (!tournamentId) return;
    loadTeamData();
    loadScrimRecordList();
  }, [tournamentId, loadTeamData, loadScrimRecordList]);

  const openStaffModal = useCallback((team) => {
    setSelectedTeam(team);
    setStaffModalOpen(true);
  }, []);

  const closeStaffModal = useCallback(() => {
    setStaffModalOpen(false);
    setSelectedTeam(null);
  }, []);

  const deleteStaff = useCallback(
    async (staffStreamer, staffTeam) => {
      try {
        await axios.delete(`/staff/`, {
          data: { staffStreamer, staffTeam },
        });
        await loadTeamData();
      } catch (err) {
        console.error("감독/코치 삭제 실패", err);
      }
    },
    [loadTeamData]
  );

  const deleteTeam = useCallback(
    async (teamId) => {
      try {
        await axios.delete(`/team/${teamId}`);
        await loadTeamData();
      } catch (err) {
        console.error("팀 삭제 실패", err);
      }
    },
    [loadTeamData]
  );

  const openScrimModal = useCallback(() => {
    if (!isLogin) return;
    setScrimForm({
      scrimTournament: Number(tournamentId),
      scrimRedTeam: "",
      scrimBlueTeam: "",
      scrimRedScore: 0,
      scrimBlueScore: 0,
      scrimDate: new Date().toISOString().split("T")[0],
      scrimHour: 0,
      scrimMatchType: "스크림",
    });
    setShowScrimModal(true);
  }, [isLogin, tournamentId]);

  const closeScrimModal = useCallback(() => {
    setShowScrimModal(false);
  }, []);

  const openVsRecordModal = async (team) => {
    try {
      setSelectedScrimTeam(team);
      setVsRecordList([]);
      setVsRecordLoading(true);
      setSelectedScrimTeam(team);
      setShowScrimModal(false);
      setVsRecordLoading(true);
      setSelectedScrimTeam(team);
      setShowScrimModal(false);
      setShowScrimModal(false);
      setShowScrimModal(false);
      setShowScrimModal(false);
    } catch (error) {
      console.error("오류", error);
    }
  };
}
