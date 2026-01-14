import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const loginIdState = atomWithStorage("loginIdState", "", sessionStorage);
export const loginLevelState = atomWithStorage("loginLevelState", "", sessionStorage);
export const loginNicknameState = atomWithStorage("loginNicknameStoreage","", sessionStorage);
export const accessTokenState = atomWithStorage("accessTokenState", "", sessionStorage);
export const refreshTokenState= atomWithStorage("refreshTokenState", "", sessionStorage);

export const loginState = atom(get=>{
    const loginId = get(loginIdState);
    const loginLevel = get(loginLevelState);
    return loginId?.length>0 && loginLevel?.length>0;
});
export const adminState = atom(get=>{
    const loginId = get(loginIdState);
    const loginLevel = get(loginLevelState);
    return loginId?.length>0 && loginLevel==="관리자";
});

//로그인 관련 state 초기화 (쓰기함수)
export const clearLoginState = atom(
    null,
    (get, set)=>{
        set(loginIdState, "");
        set(loginLevelState, "");
        set(loginNicknameState, "");
        set(accessTokenState, "");
        set(refreshTokenState, "");
    }
)

//로그인 판정 확인용 데이터
export const loginCompleteState = atom(false);
