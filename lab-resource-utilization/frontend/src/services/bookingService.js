import api from "./api";

export const createBooking = async (bookingData) => {
    const response = await api.post("/bookings", bookingData);
    return response.data;
};

export const getMyBookings = async () => {
    const response = await api.get("/bookings/my");
    return response.data;
};

export const getAllBookings = async () => {
    const response = await api.get("/bookings");
    return response.data;
};

export const getBookingById = async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
};

export const updateBookingStatus = async (id, status) => {
    const response = await api.put(`/bookings/${id}/status`, null, { params: { status } });
    return response.data;
};