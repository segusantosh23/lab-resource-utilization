import api from "./api";

const calibrationService = {

    getAllCalibrations() {
        return api.get("/api/calibrations");
    },

    getCalibrationById(id) {
        return api.get(`/api/calibrations/${id}`);
    },

    addCalibration(data) {
        return api.post("/api/calibrations", data);
    },

    updateCalibration(id, data) {
        return api.put(`/api/calibrations/${id}`, data);
    },

    deleteCalibration(id) {
        return api.delete(`/api/calibrations/${id}`);
    },

    getCalibrationHistory(equipmentId) {
        return api.get(`/api/calibrations/equipment/${equipmentId}`);
    },

    getDueSoonCalibrations(days = 30) {
        return api.get(`/api/calibrations/due-soon?days=${days}`);
    },

    getExpiredCalibrations() {
        return api.get("/api/calibrations/expired");
    },

    // NEW METHODS
    getActiveCalibrations() {
        return api.get("/api/calibrations/active");
    },

    getFailedCalibrations() {
        return api.get("/api/calibrations/failed");
    },

    getSummary() {
        return api.get("/api/calibrations/summary");
    }

};

export default calibrationService;