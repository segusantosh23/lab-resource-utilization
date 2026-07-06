import React, { useEffect, useMemo, useState } from "react";
import { getMyBookings } from "../../services/bookingService";

const UsageSummary = () => {

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchBookings = async () => {

            try {

                const data = await getMyBookings();

                setBookings(data);

            } catch (error) {

                console.error("Failed to load bookings:", error);

            } finally {

                setLoading(false);

            }

        };

        fetchBookings();

    }, []);

    const completedBookings = useMemo(() =>

            bookings.filter(
                booking => booking.status === "COMPLETED"
            )

        , [bookings]);

    const totalBookings = bookings.length;

    const completedCount = completedBookings.length;

    const totalHours = completedBookings.reduce((sum, booking) => {

        const start = new Date(booking.startTime);

        const end = new Date(booking.endTime);

        return sum + ((end - start) / (1000 * 60 * 60));

    }, 0);

    const averageHours =
        completedCount > 0
            ? (totalHours / completedCount).toFixed(1)
            : 0;

    const currentDate = new Date();

    const monthlyBookings = bookings.filter(booking => {

        const date = new Date(booking.startTime);

        return (

            date.getMonth() === currentDate.getMonth() &&

            date.getFullYear() === currentDate.getFullYear()

        );

    }).length;

    const weeklyBookings = bookings.filter(booking => {

        const date = new Date(booking.startTime);

        const diff =

            (currentDate - date) /

            (1000 * 60 * 60 * 24);

        return diff >= 0 && diff <= 7;

    }).length;

    const equipmentUsage = {};

    completedBookings.forEach(booking => {

        const hours =

            (new Date(booking.endTime) -

                new Date(booking.startTime))

            /

            (1000 * 60 * 60);

        if (!equipmentUsage[booking.equipmentName]) {

            equipmentUsage[booking.equipmentName] = {

                count: 0,

                hours: 0

            };

        }

        equipmentUsage[booking.equipmentName].count++;

        equipmentUsage[booking.equipmentName].hours += hours;

    });

    const usageRows = Object.entries(equipmentUsage).map(

        ([equipment, stats]) => ({

            equipment,

            count: stats.count,

            hours: stats.hours.toFixed(1)

        })

    );

    const mostUsed = usageRows.length > 0

        ? usageRows.reduce((a, b) =>

            a.count > b.count ? a : b

        )

        : null;

    if (loading) {

        return (

            <div className="min-h-screen bg-[#0d0e12] flex justify-center items-center text-white">

                Loading Usage Summary...

            </div>

        );

    }

    return (

        <div className="min-h-screen bg-[#0d0e12] text-white px-8 py-8">

            <div className="max-w-7xl mx-auto">

                <h1 className="text-3xl font-bold">
                    Usage Summary
                </h1>

                <p className="text-gray-400 mt-2">
                    View your laboratory equipment usage statistics.
                </p>

                {/* Summary Cards */}

                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">

                    <div className="bg-[#12131a] rounded-xl p-6">

                        <p className="text-gray-400">
                            Total Bookings
                        </p>

                        <h2 className="text-4xl font-bold mt-3">
                            {totalBookings}
                        </h2>

                    </div>

                    <div className="bg-[#12131a] rounded-xl p-6">

                        <p className="text-gray-400">
                            Bookings This Month
                        </p>

                        <h2 className="text-4xl font-bold mt-3 text-purple-400">
                            {monthlyBookings}
                        </h2>

                    </div>

                    <div className="bg-[#12131a] rounded-xl p-6">

                        <p className="text-gray-400">
                            Bookings This Week
                        </p>

                        <h2 className="text-4xl font-bold mt-3 text-indigo-400">
                            {weeklyBookings}
                        </h2>

                    </div>

                    <div className="bg-[#12131a] rounded-xl p-6">

                        <p className="text-gray-400">
                            Completed Bookings
                        </p>

                        <h2 className="text-4xl font-bold mt-3 text-green-400">
                            {completedCount}
                        </h2>

                    </div>

                </div>

                {/* Usage Statistics */}

                <div className="grid md:grid-cols-3 gap-6 mt-8">

                    <div className="bg-[#12131a] rounded-xl p-6">

                        <p className="text-gray-400">
                            Total Usage Hours
                        </p>

                        <h2 className="text-4xl font-bold mt-3 text-yellow-400">
                            {totalHours.toFixed(1)}
                        </h2>

                    </div>

                    <div className="bg-[#12131a] rounded-xl p-6">

                        <p className="text-gray-400">
                            Average Session
                        </p>

                        <h2 className="text-4xl font-bold mt-3 text-cyan-400">
                            {averageHours} hrs
                        </h2>

                    </div>

                    <div className="bg-[#12131a] rounded-xl p-6">

                        <p className="text-gray-400">
                            Most Used Equipment
                        </p>

                        <h2 className="text-xl font-semibold mt-3 text-purple-400">

                            {mostUsed
                                ? mostUsed.equipment
                                : "No Usage"}

                        </h2>

                        {mostUsed && (

                            <p className="text-gray-400 mt-2">

                                {mostUsed.count} completed bookings

                            </p>

                        )}

                    </div>

                </div>

                {/* Equipment Usage Table */}

                <div className="mt-10">

                    <h2 className="text-2xl font-bold mb-5">

                        Equipment Usage

                    </h2>

                    {usageRows.length === 0 ? (

                        <div className="bg-[#12131a] rounded-xl p-8 text-center">

                            <h3 className="text-xl">

                                No completed bookings yet.

                            </h3>

                            <p className="text-gray-400 mt-3">

                                Equipment usage statistics will appear here after your completed bookings.

                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto rounded-xl border border-white/10">

                            <table className="min-w-full">

                                <thead className="bg-[#161821]">

                                <tr>

                                    <th className="text-left p-4">
                                        Equipment
                                    </th>

                                    <th className="text-left p-4">
                                        Times Used
                                    </th>

                                    <th className="text-left p-4">
                                        Total Hours
                                    </th>

                                </tr>

                                </thead>

                                <tbody>

                                {usageRows.map((row, index) => (

                                    <tr
                                        key={index}
                                        className="border-t border-white/10 hover:bg-white/5"
                                    >

                                        <td className="p-4">
                                            {row.equipment}
                                        </td>

                                        <td className="p-4">
                                            {row.count}
                                        </td>

                                        <td className="p-4">
                                            {row.hours} hrs
                                        </td>

                                    </tr>

                                ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

};

export default UsageSummary;