import axios from "axios";

const API = "http://localhost:8081/api/maintenance";

export const createRequest = (data) => axios.post(API, data);

export const getAllRequests = () => axios.get(API);

export const getRequestById = (id) => axios.get(`${API}/${id}`);

export const updateStatus = (id, status) =>
  axios.put(`${API}/${id}/status`, { status });