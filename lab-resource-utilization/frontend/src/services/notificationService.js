import api from "./api";

export const getMyNotifications = async () => {
    const response = await api.get("/notifications/my");
    return response.data;
};

export const markAsRead = async (id) => {
    return await api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = async () => {
    return await api.put("/notifications/read-all");
};