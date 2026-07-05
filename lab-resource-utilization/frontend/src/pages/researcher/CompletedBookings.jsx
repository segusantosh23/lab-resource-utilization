import React, { useEffect, useState } from "react";
import { getMyBookings } from "../../services/bookingService";
const CompletedBookings = () => {
    const [search, setSearch] = useState("");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
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

                {filteredBookings.length === 0 && (

                    <div className="mt-8 bg-[#12131a] rounded-xl p-8 text-center">

                        <h2 className="text-2xl font-semibold">
                            No Booking History
                        </h2>

                        <p className="text-gray-400 mt-3">
                            You don't have any completed or closed bookings.
                        </p>

                    </div>

                )}

                {/* Booking History Table */}

                {filteredBookings.length > 0 && (

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

                        {filteredBookings.map((booking) => (

                            <tr
                                key={booking.id}
                                className="border-t border-white/10 hover:bg-white/5"
                            >

                                <td className="p-4">
                                    {booking.id}
                                </td>

                                <td className="p-4">
                                    {booking.equipmentName}
                                </td>

                                <td className="p-4">
                                    {booking.purpose}
                                </td>

                                <td className="p-4">
                                    {new Date(booking.startTime).toLocaleString()}
                                </td>

                                <td className="p-4">
                                    {new Date(booking.endTime).toLocaleString()}
                                </td>

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

                    }`}>

                {booking.status}

                </span>

                                </td>



                                <td className="p-4">

                                    <button className="text-purple-400 hover:text-purple-300">
                                        View Details
                                    </button>

                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                </div>
                    )}

            </div>

        </div>
    );
};

export default CompletedBookings;