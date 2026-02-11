/**
 * Keys Frontend API
 * Supports visibility filtering and sharing between companies
 */

import axios from "./index";
import { API_SERVER } from "config/constant";

class KeysApi {
  static getAll = (params = {}) => {
    try {
      return axios.get(`${API_SERVER}keys`, { params });
    } catch (error) {
      console.error("Error fetching keys:", error);
      throw error;
    }
  };

  // Get keys visible to a company (includes hierarchy and shares)
  static getVisibleKeys = (companyId) => {
    try {
      return axios.get(`${API_SERVER}keys/visible`, { params: { company_id: companyId } });
    } catch (error) {
      console.error("Error fetching visible keys:", error);
      throw error;
    }
  };

  static getById = (id) => {
    try {
      return axios.get(`${API_SERVER}keys/${id}`);
    } catch (error) {
      console.error("Error fetching key:", error);
      throw error;
    }
  };

  static create = (data) => {
    try {
      return axios.post(`${API_SERVER}keys`, data);
    } catch (error) {
      console.error("Error creating key:", error);
      throw error;
    }
  };

  static update = (id, data) => {
    try {
      return axios.put(`${API_SERVER}keys/${id}`, data);
    } catch (error) {
      console.error("Error updating key:", error);
      throw error;
    }
  };

  static updateStatus = (id, status) => {
    try {
      return axios.patch(`${API_SERVER}keys/${id}/status`, { status });
    } catch (error) {
      console.error("Error updating key status:", error);
      throw error;
    }
  };

  static delete = (id) => {
    try {
      return axios.delete(`${API_SERVER}keys/${id}`);
    } catch (error) {
      console.error("Error deleting key:", error);
      throw error;
    }
  };

  static getStats = (params = {}) => {
    try {
      return axios.get(`${API_SERVER}keys/stats/summary`, { params });
    } catch (error) {
      console.error("Error fetching key stats:", error);
      throw error;
    }
  };

  // ============ SHARING API ============

  // Share a key with another company
  static share = (keyId, shareData) => {
    try {
      return axios.post(`${API_SERVER}keys/${keyId}/share`, shareData);
    } catch (error) {
      console.error("Error sharing key:", error);
      throw error;
    }
  };

  // Unshare a key from a company
  static unshare = (keyId, companyId) => {
    try {
      return axios.delete(`${API_SERVER}keys/${keyId}/share/${companyId}`);
    } catch (error) {
      console.error("Error unsharing key:", error);
      throw error;
    }
  };

  // Get all shares for a key
  static getShares = (keyId) => {
    try {
      return axios.get(`${API_SERVER}keys/${keyId}/shares`);
    } catch (error) {
      console.error("Error fetching key shares:", error);
      throw error;
    }
  };

  // Get companies a key is shared with
  static getSharedWith = (keyId) => {
    try {
      return axios.get(`${API_SERVER}keys/${keyId}/shared-with`);
    } catch (error) {
      console.error("Error fetching shared companies:", error);
      throw error;
    }
  };

  // Get keys shared with a company
  static getSharedWithCompany = (companyId) => {
    try {
      return axios.get(`${API_SERVER}keys/shared-with/${companyId}`);
    } catch (error) {
      console.error("Error fetching keys shared with company:", error);
      throw error;
    }
  };
}

export default KeysApi;
