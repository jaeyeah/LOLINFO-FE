// 티어표를 제공하는 대회는 이 목록에서만 관리합니다.
// API에 제공 여부 필드가 추가되면 이 설정을 해당 필드 기반으로 교체할 수 있습니다.
export const TIER_BOARD_TOURNAMENT_IDS = new Set(["115"]);

export const normalizeTournamentId = (tournamentId) =>
  String(tournamentId ?? "").trim();

export const isTierBoardAvailable = (tournamentId) =>
  TIER_BOARD_TOURNAMENT_IDS.has(normalizeTournamentId(tournamentId));
