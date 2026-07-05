import React, { useEffect, useState } from "react";
import { getMyBookings } from "../../services/bookingService";
const WaitlistBookings = () => {

    const [search, setSearch] = useState("");

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchBookings = async () => {

            try {

                const data = await getMyBookings();

                setBookings(
                    data.filter(
                        booking => booking.status === "PENDING_APPROVAL"
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

                Loading Waitlist...

            </div>

        );

    }

    return (
        <div className="min-h-screen bg-[#0d0e12] text-white px-8 py-8">

            <div className="max-w-7xl mx-auto">

                {/* Header */}

                <h1 className="text-3xl font-bold">
                    Waitlist Bookings
                </h1>

                <p className="text-gray-400 mt-2">
                    Track all your pending equipment requests.
                </p>

                {/* Summary Cards */}

                <div className="grid md:grid-cols-3 gap-6 mt-8">

                    <div className="bg-[#12131a] rounded-xl p-5">
                        <p className="text-gray-400 text-sm">Total Waitlist</p>
                        <h2 className="text-3xl font-bold mt-2">{bookings.length}</h2>
                    </div>

                    <div className="bg-[#12131a] rounded-xl p-5">

                        <p className="text-gray-400 text-sm">
                            Pending Approval
                        </p>

                        <h2 className="text-3xl font-bold mt-2 text-yellow-400">
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

                {bookings.length === 0 && (

                    <div className="mt-8 bg-[#12131a] rounded-xl p-8 text-center">

                        <h2 className="text-2xl font-semibold">
                            No Pending Bookings
                        </h2>

                        <p className="text-gray-400 mt-2">
                            You don't have any booking requests waiting for approval.
                        </p>

                    </div>

                )}

                {/* Table */}

                <div className="mt-8 overflow-hidden rounded-xl border border-white/10">

                    <table className="w-full">

                        <thead className="bg-[#161821]">

                        <tr>

                            <th>Booking ID</th>
                            <th>Equipment</th>
                            <th>Created</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Status</th>
                            {/*<th>Action</th>*/}

                        </tr>

                        </thead>

                        <tbody>

                        {filteredBookings.map((booking) => (

                            <tr
                                key={booking.id}
                                className="border-t border-white/10 hover:bg-white/5"
                            >

                                <td className="p-4">{booking.id}</td>

                                <td className="p-4">{booking.equipmentName}</td>

                                <td className="p-4">
                                    {new Date(booking.createdAt).toLocaleDateString()}
                                </td>

                                <td className="p-4">
                                    {new Date(booking.startTime).toLocaleString()}
                                </td>

                                <td className="p-4 font-semibold text-yellow-400">
                                    {new Date(booking.endTime).toLocaleString()}
                                </td>



                                <td className="p-4">

                    <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                      {booking.status}
                    </span>

                                </td>

                                {/*<td className="p-4">*/}

                                {/*    <button className="text-purple-400 hover:text-purple-300 mr-4">*/}
                                {/*        View*/}
                                {/*    </button>*/}

                                {/*    <button className="text-red-400 hover:text-red-300">*/}
                                {/*        Remove*/}
                                {/*    </button>*/}

                                {/*</td>*/}

                            </tr>

                        ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
};

export default WaitlistBookings;