/**
 * Companies Frontend API
 * Supports hierarchy (parent/child) for Agence/Conciergerie relations
 */

import axios from "./index";
import { API_SERVER } from "config/constant";

class CompaniesApi {
  static getAll = (params = {}) => {
    try {
      return axios.get(`${API_SERVER}companies`, { params });
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw error;
    }
  };

  // Get companies by type (conciergerie or agence_imobiliere)
  static getByType = (type) => {
    try {
      return axios.get(`${API_SERVER}companies`, { params: { type } });
    } catch (error) {
      console.error("Error fetching companies by type:", error);
      throw error;
    }
  };

  // Get child companies (for hierarchy)
  static getChildren = (parentId) => {
    try {
      return axios.get(`${API_SERVER}companies/${parentId}/children`);
    } catch (error) {
      console.error("Error fetching child companies:", error);
      throw error;
    }
  };

  // Get parent companies (agencies that can have conciergeries)
  static getParentCompanies = () => {
    try {
      return axios.get(`${API_SERVER}companies/parents`);
    } catch (error) {
      console.error("Error fetching parent companies:", error);
      throw error;
    }
  };

  static getById = (id) => {
    try {
      return axios.get(`${API_SERVER}companies/${id}`);
    } catch (error) {
      console.error("Error fetching company:", error);
      throw error;
    }
  };

  static create = (data) => {
    try {
      return axios.post(`${API_SERVER}companies`, data);
    } catch (error) {
      console.error("Error creating company:", error);
      throw error;
    }
  };

  static update = (id, data) => {
    try {
      return axios.put(`${API_SERVER}companies/${id}`, data);
    } catch (error) {
      console.error("Error updating company:", error);
      throw error;
    }
  };

  static delete = (id) => {
    try {
      return axios.delete(`${API_SERVER}companies/${id}`);
    } catch (error) {
      console.error("Error deleting company:", error);
      throw error;
    }
  };

  // Get hierarchy tree
  static getHierarchy = () => {
    try {
      return axios.get(`${API_SERVER}companies/hierarchy`);
    } catch (error) {
      console.error("Error fetching hierarchy:", error);
      throw error;
    }
  };
}

export default CompaniesApi;
