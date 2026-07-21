import api from './api';

export const getUtilizationAnalytics = async (email) => {
    const response = await api.get(
        `/api/analytics/utilization?email=${email}`
    );
    return response.data;
};

export const getRealTimeTracking = async () => {
    const response = await api.get('/api/analytics/real-time-tracking');
    return response.data;
};

export const getEquipmentUtilizationRates = async () => {
    const response = await api.get('/api/analytics/equipment-rates');
    return response.data;
};

export const getDepartmentUtilizationRates = async () => {
    const response = await api.get('/api/analytics/department-rates');
    return response.data;
};

export const getInstitutionUtilizationRates = async () => {
    const response = await api.get('/api/analytics/institution-rates');
    return response.data;
};

export const getIdleEquipment = async () => {
    const response = await api.get('/api/analytics/idle-equipment');
    return response.data;
};

export const getUtilizationHeatmap = async () => {
    const response = await api.get('/api/analytics/heatmap');
    return response.data;
};

export const getUsagePatterns = async () => {
    const response = await api.get('/api/analytics/usage-patterns');
    return response.data;
};
