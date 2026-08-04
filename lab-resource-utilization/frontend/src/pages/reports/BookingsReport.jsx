import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { getProfile } from "../../services/profileService";
import {
    generatePDFReport,
    generateExcelReport
} from "../../utils/reportGenerator";

const formatDate = (val) => {
    if (!val) return "-";
    if (Array.isArray(val)) {
        const [y, m, d] = val;
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const BookingsReport = () => {
    const { user } = useContext(AuthContext);

    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [status, setStatus] = useState("ALL");
    const [equipment, setEquipment] = useState("ALL");
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            try {
                const [profileData, res] = await Promise.all([
                    getProfile().catch(err => {
                        console.error(err);
                        return null;
                    }),
                    api.get("/bookings")
                ]);

                if (profileData) {
                    setProfile(profileData);
                }

                setBookings(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user]);

    const equipments = [
        "ALL",
        ...new Set(bookings.map(b => b.equipmentName || b.equipment?.name).filter(Boolean))
    ];

    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            const eqName = b.equipmentName || b.equipment?.name || "";
            const userName = b.userName || b.user?.name || b.userEmail || "";
            const purposeStr = b.purpose || "";
            const idStr = String(b.id || "");

            const searchOk =
                !search ||
                eqName.toLowerCase().includes(search.toLowerCase()) ||
                userName.toLowerCase().includes(search.toLowerCase()) ||
                purposeStr.toLowerCase().includes(search.toLowerCase()) ||
                idStr.includes(search);

            const startTime = b.startTime ? new Date(Array.isArray(b.startTime) ? new Date(b.startTime[0], b.startTime[1]-1, b.startTime[2]) : b.startTime) : null;

            const fromOk = !fromDate || (startTime && startTime >= new Date(fromDate));
            const toOk = !toDate || (startTime && startTime <= new Date(toDate + "T23:59:59"));

            const statusOk = status === "ALL" || b.status === status;
            const equipmentOk = equipment === "ALL" || eqName === equipment;

            return searchOk && fromOk && toOk && statusOk && equipmentOk;
        });
    }, [bookings, search, fromDate, toDate, status, equipment]);

    const summary = {
        "Total Bookings": bookings.length,
        "Active / Approved": filteredBookings.filter(b => b.status === "APPROVED" || b.status === "CONFIRMED" || b.status === "IN_USE").length,
        "Completed": filteredBookings.filter(b => b.status === "COMPLETED").length,
        "Cancelled / Rejected": filteredBookings.filter(b => b.status === "CANCELLED" || b.status === "REJECTED").length
    };

    const roleName = (user?.role || "USER").replace(/_/g, " ");
    const reportTitle = `${roleName} Bookings Report`;

    const handlePDF = () => {
        generatePDFReport({
            title: reportTitle,
            user: profile || user,
            summary,
            filters: {
                fromDate,
                toDate,
                status,
                equipment,
                search
            },
            columns: [
                "Booking ID",
                "Equipment",
                "User",
                "Purpose",
                "Start Time",
                "End Time",
                "Status"
            ],
            rows: filteredBookings.map(b => [
                b.id,
                b.equipmentName || b.equipment?.name || "-",
                b.userName || b.user?.name || b.userEmail || "-",
                b.purpose || "-",
                formatDate(b.startTime),
                formatDate(b.endTime),
                b.status
            ])
        });
    };

    const handleExcel = () => {
        generateExcelReport({
            title: reportTitle,
            user: profile || user,
            summary,
            filters: {
                fromDate,
                toDate,
                status,
                equipment,
                search
            },
            columns: [
                "Booking ID",
                "Equipment",
                "User",
                "Purpose",
                "Start Time",
                "End Time",
                "Status"
            ],
            rows: filteredBookings.map(b => [
                b.id,
                b.equipmentName || b.equipment?.name || "-",
                b.userName || b.user?.name || b.userEmail || "-",
                b.purpose || "-",
                formatDate(b.startTime),
                formatDate(b.endTime),
                b.status
            ])
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d0e12] flex justify-center items-center text-white">
                Loading Bookings Report...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0e12] text-white p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold">Bookings Report</h1>
                <p className="text-gray-400 mt-2">
                    Generate booking reports in PDF or Excel format.
                </p>

                {/* Summary */}
                <div className="grid md:grid-cols-4 gap-5 mt-8">
                    <div className="bg-[#15171f] rounded-xl p-5">
                        <p className="text-gray-400 text-sm">Total Bookings</p>
                        <h2 className="text-3xl mt-2 font-bold text-purple-400">
                            {summary["Total Bookings"]}
                        </h2>
                    </div>
                    <div className="bg-[#15171f] rounded-xl p-5">
                        <p className="text-gray-400 text-sm">Active / Approved</p>
                        <h2 className="text-3xl mt-2 font-bold text-green-400">
                            {summary["Active / Approved"]}
                        </h2>
                    </div>
                    <div className="bg-[#15171f] rounded-xl p-5">
                        <p className="text-gray-400 text-sm">Completed</p>
                        <h2 className="text-3xl mt-2 font-bold text-blue-400">
                            {summary["Completed"]}
                        </h2>
                    </div>
                    <div className="bg-[#15171f] rounded-xl p-5">
                        <p className="text-gray-400 text-sm">Cancelled / Rejected</p>
                        <h2 className="text-3xl mt-2 font-bold text-red-400">
                            {summary["Cancelled / Rejected"]}
                        </h2>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-[#15171f] rounded-xl mt-8 p-6">
                    <div className="grid md:grid-cols-5 gap-5">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3 text-white border border-white/10"
                        />
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3 text-white border border-white/10"
                        />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3 text-white border border-white/10"
                        >
                            <option value="ALL">All Status</option>
                            <option value="APPROVED">Approved</option>
                            <option value="IN_USE">In Use</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <select
                            value={equipment}
                            onChange={(e) => setEquipment(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3 text-white border border-white/10"
                        >
                            {equipments.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                        <input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3 text-white border border-white/10"
                        />
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={() => {
                                setFromDate("");
                                setToDate("");
                                setStatus("ALL");
                                setEquipment("ALL");
                                setSearch("");
                            }}
                            className="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition font-medium"
                        >
                            Clear Filters
                        </button>

                        <div className="flex gap-4">
                            <button
                                onClick={handlePDF}
                                className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold transition"
                            >
                                📄 Generate PDF
                            </button>
                            <button
                                onClick={handleExcel}
                                className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold transition"
                            >
                                📊 Export Excel
                            </button>
                        </div>
                    </div>

                    <div className="mt-10">
                        <h2 className="text-2xl font-bold">Bookings History Preview</h2>
                        <p className="text-gray-400 mt-2 mb-6">
                            Showing {filteredBookings.length} of {bookings.length} booking records
                        </p>

                        <div className="overflow-x-auto rounded-xl border border-white/10">
                            <table className="min-w-full">
                                <thead className="bg-[#1b1d26]">
                                    <tr>
                                        <th className="text-left p-4">ID</th>
                                        <th className="text-left p-4">Equipment</th>
                                        <th className="text-left p-4">User</th>
                                        <th className="text-left p-4">Purpose</th>
                                        <th className="text-left p-4">Start Time</th>
                                        <th className="text-left p-4">End Time</th>
                                        <th className="text-left p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center p-10 text-gray-400">
                                                No booking records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredBookings.map((record) => (
                                            <tr key={record.id} className="border-t border-white/10 hover:bg-white/5 transition">
                                                <td className="p-4">{record.id}</td>
                                                <td className="p-4">{record.equipmentName || record.equipment?.name || "-"}</td>
                                                <td className="p-4">{record.userName || record.user?.name || record.userEmail || "-"}</td>
                                                <td className="p-4">{record.purpose || "-"}</td>
                                                <td className="p-4">{formatDate(record.startTime)}</td>
                                                <td className="p-4">{formatDate(record.endTime)}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        record.status === "APPROVED" || record.status === "CONFIRMED" || record.status === "IN_USE"
                                                            ? "bg-green-500/20 text-green-400"
                                                            : record.status === "COMPLETED"
                                                            ? "bg-blue-500/20 text-blue-400"
                                                            : "bg-red-500/20 text-red-400"
                                                    }`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingsReport;
