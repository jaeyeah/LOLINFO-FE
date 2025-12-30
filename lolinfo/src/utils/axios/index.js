import axios  from "axios";


//axios setting
axios.defaults.baseURL = import.meta.env.VITE_AXIOS_URL;
axios.defaults.timeout = 10000;
