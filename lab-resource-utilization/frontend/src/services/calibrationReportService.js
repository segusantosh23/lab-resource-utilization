import api from "./api";

export const getCalibrationReport = async () => {
    const res = await api.get("/calibrations");
    return res.data;
};