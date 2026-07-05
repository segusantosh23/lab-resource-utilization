import React, { useEffect, useState } from "react";
import { getMyBookings } from "../../services/bookingService";
import api from "../../services/api";

const UpcomingBookings = () => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {

        const fetchBookings = async () => {

            try {

                const data = await getMyBookings();
                // Filter out completed/cancelled to only show active "upcoming" ones, or keep all to let user filter
                const activeBookings = data.filter(
                    b => b.status === "CONFIRMED" || b.status === "PENDING_APPROVAL"
                );
                setBookings(activeBookings);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        };

        fetchBookings();

    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await api.put(`/bookings/${id}/status`, null, { params: { status: 'CANCELLED' } });
            setBookings(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            alert(error.response?.data?.message || "Failed to cancel booking.");
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
            booking.id.toString().includes(search);
        
        const matchesStatus = statusFilter === "All" || 
            (statusFilter === "Confirmed" && booking.status === "CONFIRMED") ||
            (statusFilter === "Pending" && booking.status === "PENDING_APPROVAL");

        return matchesSearch && matchesStatus;
    });
    if (loading) {

        return (

            <div className="min-h-screen bg-[#0d0e12] flex items-center justify-center text-white">

                Loading Upcoming Bookings...

            </div>

        );

    }

    return (
        <div className="min-h-screen bg-[#0d0e12] text-white px-8 py-8">

            <div className="max-w-7xl mx-auto">

                {/* Header */}

                <h1 className="text-3xl font-bold">
                    Upcoming Bookings
                </h1>

                <p className="text-gray-400 mt-2">
                    Manage all your upcoming equipment reservations.
                </p>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-[#12131a] rounded-xl p-5 border border-white/[0.05]">
                        <p className="text-gray-400 text-sm">Total Active</p>
                        <h2 className="text-3xl font-bold mt-2">{bookings.length}</h2>
                    </div>
                    <div className="bg-[#12131a] rounded-xl p-5 border border-white/[0.05]">
                        <p className="text-gray-400 text-sm">Confirmed</p>
                        <h2 className="text-3xl font-bold mt-2 text-green-400">
                            {bookings.filter(b => b.status === 'CONFIRMED').length}
                        </h2>
                    </div>
                    <div className="bg-[#12131a] rounded-xl p-5 border border-white/[0.05]">
                        <p className="text-gray-400 text-sm">Pending</p>
                        <h2 className="text-3xl font-bold mt-2 text-yellow-400">
                            {bookings.filter(b => b.status === 'PENDING_APPROVAL').length}
                        </h2>
                    </div>
                </div>

                {/* Search & Filter */}

                <div className="flex flex-col md:flex-row gap-4 mt-8">

                    <input
                        type="text"
                        placeholder="Search by Booking ID or Equipment..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-[#12131a] border border-white/10 rounded-lg px-4 py-3 outline-none"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#12131a] border border-white/10 rounded-lg px-4 py-3"
                    >
                        <option>All</option>
                        <option>Confirmed</option>
                        <option>Pending</option>
                    </select>

                </div>

                {/* Table */}
                <div className="mt-8 overflow-hidden rounded-xl border border-white/10">

                    <table className="w-full">

                        <thead className="bg-[#161821]">

                        <tr>

                            <th className="text-left p-4">Booking ID</th>
                            <th className="text-left p-4">Equipment</th>
                            <th className="text-left p-4">Date</th>
                            <th className="text-left p-4">Time</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Action</th>

                        </tr>

                        </thead>

                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center bg-[#12131a]">
                                        <h2 className="text-2xl font-semibold text-white">No Upcoming Bookings</h2>
                                        <p className="text-gray-400 mt-3">No bookings match your criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="border-t border-white/10 hover:bg-white/5"
                                    >
                                        <td className="p-4">{booking.id}</td>
                                        <td className="p-4">{booking.equipmentName}</td>
                                        <td className="p-4">{new Date(booking.startTime).toLocaleDateString()}</td>
                                        <td className="p-4">{new Date(booking.startTime).toLocaleTimeString()} - {" "}
                                            {new Date(booking.endTime).toLocaleTimeString()}</td>
                                        <td className="p-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    booking.status === "CONFIRMED"
                                                        ? "bg-green-500/20 text-green-400"
                                                        : "bg-yellow-500/20 text-yellow-400"
                                                }`}
                                            >
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => setSelectedBooking(booking)}
                                                className="text-purple-400 hover:text-purple-300 mr-4 font-medium transition"
                                            >
                                                View
                                            </button>
                                            <button 
                                                onClick={() => handleCancel(booking.id)}
                                                className="text-red-400 hover:text-red-300 font-medium transition"
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            </div>

            {/* View Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#12131a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold">Booking Details</h2>
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Booking ID</p>
                                <p className="font-medium">{selectedBooking.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Equipment</p>
                                <p className="font-medium text-purple-400">{selectedBooking.equipmentName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Purpose</p>
                                <p className="font-medium">{selectedBooking.purpose || 'No purpose specified'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Start</p>
                                    <p className="font-medium">{new Date(selectedBooking.startTime).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">End</p>
                                    <p className="font-medium">{new Date(selectedBooking.endTime).toLocaleString()}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</p>
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    selectedBooking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 
                                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                                }`}>
                                    {selectedBooking.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    handleCancel(selectedBooking.id);
                                    setSelectedBooking(null);
                                }}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition border border-red-500/10"
                            >
                                Cancel Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpcomingBookings;