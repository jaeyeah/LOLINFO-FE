export function buildProfileUrl(soopId) {
  if (!soopId) return "https://profile.img.sooplive.co.kr/LOGO/af";

  const prefix = soopId.substring(0, 2);

  return `https://profile.img.sooplive.co.kr/LOGO/${prefix}/${soopId}/${soopId}.jpg`;
}