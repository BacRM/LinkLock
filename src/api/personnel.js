/**
 * Personnel Frontend API
 */

import axios from "./index";
import { API_SERVER } from "config/constant";

class PersonnelApi {
  static getAll = (params = {}) => {
    try {
      return axios.get(`${API_SERVER}personnel`, { params });
    } catch (error) {
      console.error("Error fetching personnel:", error);
      throw error;
    }
  };

  static getById = (id) => {
    try {
      return axios.get(`${API_SERVER}personnel/${id}`);
    } catch (error) {
      console.error("Error fetching personnel:", error);
      throw error;
    }
  };

  static create = (data) => {
    try {
      return axios.post(`${API_SERVER}personnel`, data);
    } catch (error) {
      console.error("Error creating personnel:", error);
      throw error;
    }
  };

  static update = (id, data) => {
    try {
      return axios.put(`${API_SERVER}personnel/${id}`, data);
    } catch (error) {
      console.error("Error updating personnel:", error);
      throw error;
    }
  };

  static delete = (id) => {
    try {
      return axios.delete(`${API_SERVER}personnel/${id}`);
    } catch (error) {
      console.error("Error deleting personnel:", error);
      throw error;
    }
  };

  static login = (data) => {
    try {
      return axios.post(`${API_SERVER}personnel/login`, data);
    } catch (error) {
      console.error("Error during personnel login:", error);
      throw error;
    }
  };
}

export default PersonnelApi;
