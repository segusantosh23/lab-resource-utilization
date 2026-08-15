import api from "./api";

export const createRequest = (data) => api.post("/api/maintenance", data);

export const getAllRequests = () => api.get("/api/maintenance");

export const getRequestById = (id) => api.get(`/api/maintenance/${id}`);

export const updateStatus = (id, status) =>
  api.put(`/api/maintenance/${id}/status`, { status });