import api from './api';

export const getUtilizationAnalytics = async (email) => {
    const response = await api.get(
        `/api/analytics/utilization?email=${email}`
    );
    return response.data;
};


export const getRealTimeTracking = async (email) => {
    const response = await api.get(
        `/api/analytics/real-time-tracking?email=${email}`
    );
    return response.data;
};


export const getEquipmentUtilizationRates = async (email) => {
    const response = await api.get(
        `/api/analytics/equipment-rates?email=${email}`
    );
    return response.data;
};


export const getDepartmentUtilizationRates = async (email) => {
    const response = await api.get(
        `/api/analytics/department-rates?email=${email}`
    );
    return response.data;
};


export const getInstitutionUtilizationRates = async (email) => {
    const response = await api.get(
        `/api/analytics/institution-rates?email=${email}`
    );
    return response.data;
};


export const getIdleEquipment = async (email) => {
    const response = await api.get(
        `/api/analytics/idle-equipment?email=${email}`
    );
    return response.data;
};


export const getUtilizationHeatmap = async (email) => {
    const response = await api.get(
        `/api/analytics/heatmap?email=${email}`
    );
    return response.data;
};


export const getUsagePatterns = async (email) => {
    const response = await api.get(
        `/api/analytics/usage-patterns?email=${email}`
    );
    return response.data;
};