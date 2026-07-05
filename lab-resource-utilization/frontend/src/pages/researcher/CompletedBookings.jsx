import React, { useEffect, useState } from "react";
import { getMyBookings } from "../../services/bookingService";
const CompletedBookings = () => {
    const [search, setSearch] = useState("");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
        useEffect(() => {

        const fetchBookings = async () => {

            try {

                const data = await getMyBookings();

                setBookings(

                    data.filter(

                        booking =>

                            booking.status === "COMPLETED" ||

                            booking.status === "CANCELLED" ||

                            booking.status === "REJECTED" ||

                            booking.status === "NO_SHOW"

                    )

                );

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        };

        fetchBookings();

    }, []);
    const filteredBookings = bookings.filter(

        booking =>

            booking.equipmentName
                .toLowerCase()
                .includes(search.toLowerCase())

            ||

            booking.id
                .toString()
                .includes(search)

    );

    if (loading) {

        return (

            <div className="min-h-screen bg-[#0d0e12] flex justify-center items-center text-white">

                Loading Booking History...

            </div>

        );

    }

    return (
        <div className="min-h-screen bg-[#0d0e12] text-white px-8 py-8">

            <div className="max-w-7xl mx-auto">

                {/* Header */}

                <h1 className="text-3xl font-bold">
                    Booking History
                </h1>

                <p className="text-gray-400 mt-2">
                    View all your completed laboratory bookings.
                </p>

                {/* Summary Cards */}

                <div className="grid md:grid-cols-1 gap-6 mt-8">

                    <div className="bg-[#12131a] rounded-xl p-5">

                        <p className="text-gray-400 text-sm">

                            Booking History

                        </p>

                        <h2 className="text-3xl font-bold mt-2 text-purple-400">

                            {bookings.length}

                        </h2>

                    </div>

                </div>

                {/* Search */}

                <div className="mt-8">

                    <input
                        type="text"
                        placeholder="Search by Booking ID or Equipment..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#12131a] border border-white/10 rounded-lg px-4 py-3 outline-none"
                    />

                </div>

                {/* Booking History Table */}

                <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
                    <table className="min-w-full">

                        <thead className="bg-[#161821]">

                        <tr>

                            <th className="text-left p-4">Booking ID</th>
                            <th className="text-left p-4">Equipment</th>
                            <th className="text-left p-4">Purpose</th>
                            <th className="text-left p-4">Start Time</th>
                            <th className="text-left p-4">End Time</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Action</th>
                        </tr>

                        </thead>

                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center bg-[#12131a]">
                                        <h2 className="text-2xl font-semibold text-white">No Booking History</h2>
                                        <p className="text-gray-400 mt-3">You don't have any completed or closed bookings matching your search.</p>
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
                                        <td className="p-4">{booking.purpose}</td>
                                        <td className="p-4">{new Date(booking.startTime).toLocaleString()}</td>
                                        <td className="p-4">{new Date(booking.endTime).toLocaleString()}</td>
                                        <td className="p-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium
                                                    ${booking.status==="COMPLETED"
                                                        ?"bg-green-500/20 text-green-400"
                                                        :booking.status==="CANCELLED"
                                                            ?"bg-red-500/20 text-red-400"
                                                            :booking.status==="REJECTED"
                                                                ?"bg-gray-500/20 text-gray-300"
                                                                :"bg-yellow-500/20 text-yellow-400"
                                                    }`}
                                            >
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => setSelectedBooking(booking)}
                                                className="text-purple-400 hover:text-purple-300 transition font-medium"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            </div>

            {/* View Details Modal */}
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
                                    selectedBooking.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 
                                    selectedBooking.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                    selectedBooking.status === 'REJECTED' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/20' :
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompletedBookings;