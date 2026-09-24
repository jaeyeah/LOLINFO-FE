import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";


// sessionStorage의 문자열을 JSON으로 저장하고 복원
const tokenStorage = createJSONStorage(() => sessionStorage);
export const loginIdState = atomWithStorage("loginIdState", "", tokenStorage,{ getOnInit: true });
export const loginLevelState = atomWithStorage("loginLevelState", "", tokenStorage,{ getOnInit: true });
export const loginNicknameState = atomWithStorage("loginNicknameStoreage","", tokenStorage,{ getOnInit: true });
export const accessTokenState = atomWithStorage("accessTokenState", "", tokenStorage,{ getOnInit: true });
export const refreshTokenState= atomWithStorage("refreshTokenState", "", tokenStorage,{ getOnInit: true });




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
