import api from './api';

export const getUtilizationAnalytics = async () => {
    const response = await api.get('/api/analytics/utilization');
    return response.data;
};
