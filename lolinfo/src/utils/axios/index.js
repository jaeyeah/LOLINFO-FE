import axios from "axios";
import { accessTokenState, clearLoginState, refreshTokenState } from "../jotai";
import { getDefaultStore } from "jotai";

const store = getDefaultStore();

axios.defaults.baseURL = import.meta.env.VITE_AXIOS_URL;
axios.defaults.timeout = 10000;

// Request Interceptor
axios.interceptors.request.use((config) => {
    config.headers["Fronted-Url"] = window.location.href;

    if (config.url && !config.url.includes("/member/refresh")) {
        const accessToken = store.get(accessTokenState);
        if (accessToken && accessToken.length > 0) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
    }

    return config;
});

// Response Interceptor
axios.interceptors.response.use(
    (response) => {
        const newAccessToken = response.headers["access-token"];
        if (newAccessToken) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
            store.set(accessTokenState, newAccessToken);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const data = error.response?.data;

        if (originalRequest._retry) {
            store.set(clearLoginState);
            location.href = "/member/login";
            return Promise.reject(error);
        }

        if (data?.status === "401" && data?.message === "TOKEN_EXPIRED") {
            if (originalRequest.url && originalRequest.url.includes("/member/refresh")) {
                store.set(clearLoginState);
                location.href = "/member/login";
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const refreshToken = store.get(refreshTokenState);
                const response = await axios.post("/member/refresh", {
                    refreshToken: `Bearer ${refreshToken}`
                });

                const newAccessToken = response.data.accessToken;
                const newRefreshToken = response.data.refreshToken;

                axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                store.set(accessTokenState, newAccessToken);
                store.set(refreshTokenState, newRefreshToken);
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

                return axios(originalRequest);
            } catch (refreshError) {
                store.set(clearLoginState);
                location.href = "/member/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axios;