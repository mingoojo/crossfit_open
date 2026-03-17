import axios, { AxiosInstance } from "axios";


let url : string = "";

if (process.env.NEXT_PUBLIC_ENV === "dev") {
  url = process.env.NEXT_PUBLIC_DEV_URL || ""
} else {
  url = process.env.NEXT_PUBLIC_LOCAL_URL || ""
}


class ApiService {

  public publicApiAxios : AxiosInstance;
  public privateApiAxios : AxiosInstance;
  public googleMapApiAxios : AxiosInstance;

  private email = "";

  private alertShown = false;

  private refreshToken = "";

  setEmail(email : string) {
    this.email = email
  }

  setRefreshToken(refreshToken : string) {
    this.refreshToken = refreshToken
  }

  setAccessToken(accessToken : string) {
    this.privateApiAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }

  constructor() {

    this.publicApiAxios = axios.create({
      baseURL: "/",
      timeout: 5000,
    });

    this.privateApiAxios = axios.create({
      baseURL: "/",
      timeout: 5000,
      withCredentials: true,
    });

    this.googleMapApiAxios = axios.create({
      baseURL: "/",
      timeout: 5000,
      withCredentials: true,
    });

    // this.privateApiAxios.interceptors.request.use(
    //   function (config) {
    //     const accessToken = getDecodeLocalStorage({ key: "accessToken" })
    //     config.headers.Authorization = accessToken?.value !== "" ? `Bearer ${accessToken?.value}` : "";
    //     config.headers["Content-type"] = "application/json; charset=UTF-8";
    //     config.headers["Accept"] = "application/json";
    //     return config
    //   },
    //   function (error) {
    //     console.log(error)
    //     return Promise.reject(error);
    //   }
    // )

    // this.privateApiAxios.interceptors.response.use(
    //   async (response) => {
    //     return response;
    //   },
    //   async (error) => {

    //     console.log(error)

    //     const { id } = jwtDecode()

    //     if (error.response?.data === "A Invalid" || (error.response?.data === "ERR_T_500" && error.config.headers.Authorization === "")) {


    //       if (!exceptionAlertStore.getState().exceptionAlert) {
    //         exceptionAlertStore.getState().setExceptionAlert(true)
    //         await auth.LogOut(String(id));
    //         localStorage.clear();
    //         alert("잘못된 접근입니다.(Access Token is manipulated)")
    //         window.location.pathname = "/"
    //       }
    //     }

    //     if (error.response?.data === "A Expired") {
    //       try {
    //         const res = await auth.VerificationRefreshToken({ email: this.email, refreshToken: this.refreshToken })
    //         if (res === "ERR_T_100") {
    //           if (!exceptionAlertStore.getState().exceptionAlert) {
    //             exceptionAlertStore.getState().setExceptionAlert(true)
    //             await auth.LogOut(id);
    //             alert("잘못된 접근입니다.(Refresh Token is manipulated)")
    //             localStorage.clear()
    //             window.location.pathname = "/"
    //           }
    //         } else {
    //           setEncodeLocalStorage({ key: "accessToken", value: res })
    //           this.privateApiAxios.defaults.headers.common.Authorization = `Bearer ${res}`;

    //           //기존의 요청을 다시 요청한다.
    //           const originalRequest = error.config;
    //           originalRequest.headers.Authorization = `Bearer ${res}`;
    //           return this.privateApiAxios(originalRequest);
    //         }
    //       } catch (error) {
    //         // await LogOut();
    //       }
    //     }

    //     return error
    //   }
    // );
  }
}
const axiosConfig = new ApiService();

export default axiosConfig;
