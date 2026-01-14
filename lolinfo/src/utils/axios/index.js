import axios  from "axios";

// store 가져오기
const store = getDefaultStore();

//axios setting
axios.defaults.baseURL = import.meta.env.VITE_AXIOS_URL;
axios.defaults.timeout = 10000;

//axios interceptor
axios.interceptors.request.use((config)=>{ //config는 axios 설정
    config.headers["Fronted-Url"] = window.location.href;

    //Jotai Store에서 토큰 꺼내기
    const accessToken = store.get(accessTokenState);

    //토큰이 있으면 헤더에 심어주기
    if (accessToken && accessToken.length > 0) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
});

// - 서버의 응답 헤더에 "Access-Token"이 있으면 axios 헤더와 jotai의 AccessTokenState를 교체
    axios.interceptors.response.use((response) => {
            console.log("request success");
            const newAccessToken = response.headers["access-token"];//response의 header를 조사 (* 소문자로 작성)
            if(newAccessToken) {//newAccessToken?.length > 0
                axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                //setAccessToken(newAccessToken);//jotai 갱신 코드 (컴포넌트 내부에서 사용하는 코드)
                store.set(accessTokenState, newAccessToken); // jotai 갱신코드(컴포넌트 외부에서 사용하는 코드)
            }
            return response;
    }, async (error) => {
        console.log("request fail");
        try {
          const data = error.response?.data;
          if(data?.status === "401" && data?.message === "TOKEN_EXPIRED") {//토큰이 만료된 경우
            //토큰 갱신 요청(axios)
            const refreshToken = store.get(refreshTokenState);  // 컴포넌트 외부에서 쓰는 코드
            const response = await axios.post("/account/refresh", { refreshToken : `Bearer ${refreshToken}` });
            //response안에는 반드시 다시 발급된 accessToken과 refreshToken이 있어야 함
            axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.accessToken}`;
            store.set(accessTokenState, response.data.accessToken);
            store.set(refreshTokenState, response.data.refreshToken);

            //재요청
            console.log("axios재요청")
            const originalRequest = error.config; // 원래 하려고 했던 요청 정보
            originalRequest.headers["Authorization"] = `Bearer ${response.data.accessToken}`;
            return axios(originalRequest);//원래 하려던 요청을 다시 진행
          }
        }
        catch(ex) {//refresh token마저 사용이 불가능한 상황
          console.log("request catch");
          store.set(clearLoginState); //모든 jotai state 초기화
          location.href = "/member/login";
        }
        return Promise.reject(error);//에러 발생 처리
    });