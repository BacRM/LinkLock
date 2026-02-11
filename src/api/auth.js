import axios from "./index";
import { API_SERVER } from "config/constant";

class AuthApi {
  static Login = (data) => {
    try {
      return axios.post(`${API_SERVER}users/login`, data);
    } catch (error) {
      console.error("Login API call failed", error);
      throw error;
    }
  };

  static Register = (data) => {
    try {
      return axios.post(`${API_SERVER}users/register`, data);
    } catch (error) {
      console.error("Register API call failed", error);
      throw error;
    }
  };

  static RegisterAdmin = (data) => {
    try {
      return axios.post(`${API_SERVER}users/register`, { ...data, role: "admin" });
    } catch (error) {
      console.error("RegisterAdmin API call failed", error);
      throw error;
    }
  };

  static Authorize = (code) => {
    try {
      return axios.get(`${API_SERVER}sessions/oauth/github?code=${code}`);
    } catch (error) {
      console.error("Authorize API call failed", error);
      throw error;
    }
  };

  static Logout = (data) => {
    try {
      return axios.post(`${API_SERVER}users/logout`, data, {
        headers: { Authorization: `${data.token}` },
      });
    } catch (error) {
      console.error("Logout API call failed", error);
      throw error;
    }
  };
}

export default AuthApi;
