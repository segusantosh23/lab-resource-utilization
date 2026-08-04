import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { getProfile } from "../../services/profileService";
import {
    getUtilizationAnalytics,
    getEquipmentUtilizationRates,
    getDepartmentUtilizationRates,
    getInstitutionUtilizationRates,
    getIdleEquipment,
    getRealTimeTracking,
    getUsagePatterns
} from "../../services/analyticsService";
import {
    generatePDFReport,
    generateExcelReport
} from "../../utils/reportGenerator";

const StatCard = ({ label, value, color = 'purple', icon, sub }) => {
    const colors = {
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
        indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    };
    return (
        <div className={`bg-[#15171f] border rounded-xl p-5 flex flex-col gap-2 ${colors[color].split(' ')[2]}`}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[color]}`}>{icon}</span>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
    );
};

const UtilizationReport = () => {
    const { user } = useContext(AuthContext);

    const [profile, setProfile] = useState(null);
    const [allEquipment, setAllEquipment] = useState([]);
    const [bookingsList, setBookingsList] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [realTimeData, setRealTimeData] = useState([]);
    const [equipmentRates, setEquipmentRates] = useState([]);
    const [deptRates, setDeptRates] = useState([]);
    const [instRates, setInstRates] = useState([]);
    const [idleEquip, setIdleEquip] = useState([]);
    const [usagePatterns, setUsagePatterns] = useState(null);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            try {
                const [
                    profileData,
                    eqRes,
                    bkRes,
                    analyticsData,
                    rtData,
                    eqRates,
                    dRates,
                    iRates,
                    idle,
                    uPatterns
                ] = await Promise.all([
                    getProfile().catch(() => null),
                    api.get("/equipment").catch(() => ({ data: [] })),
                    api.get("/bookings").catch(() => ({ data: [] })),
                    getUtilizationAnalytics(user.email).catch(() => null),
                    getRealTimeTracking(user.email).catch(() => []),
                    getEquipmentUtilizationRates(user.email).catch(() => []),
                    getDepartmentUtilizationRates(user.email).catch(() => []),
                    getInstitutionUtilizationRates(user.email).catch(() => []),
                    getIdleEquipment(user.email).catch(() => []),
                    getUsagePatterns(user.email).catch(() => null)
                ]);

                if (profileData) setProfile(profileData);
                setAllEquipment(eqRes.data || []);
                setBookingsList(bkRes.data || []);
                setAnalytics(analyticsData);
                setRealTimeData(rtData || []);
                setEquipmentRates(eqRates || []);
                setDeptRates(dRates || []);
                setInstRates(iRates || []);
                setIdleEquip(idle || []);
                setUsagePatterns(uPatterns);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user]);

    const categories = [
        "ALL",
        ...new Set(allEquipment.map(e => e.category).filter(Boolean))
    ];

    // Build complete equipment inventory list with booking counts
    const fullEquipmentMetrics = useMemo(() => {
        return allEquipment.map(item => {
            const eqBookings = bookingsList.filter(
                b => (b.equipmentName || b.equipment?.name) === item.name || b.equipmentId === item.id
            );
            return {
                ...item,
                bookingCount: eqBookings.length
            };
        });
    }, [allEquipment, bookingsList]);

    const filteredEquipmentList = useMemo(() => {
        return fullEquipmentMetrics.filter(item => {
            const searchOk =
                !search ||
                (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
                (item.category || "").toLowerCase().includes(search.toLowerCase()) ||
                (item.department || "").toLowerCase().includes(search.toLowerCase()) ||
                String(item.id || "").includes(search);

            const statusOk = statusFilter === "ALL" || item.status === statusFilter;
            const catOk = categoryFilter === "ALL" || item.category === categoryFilter;

            return searchOk && statusOk && catOk;
        });
    }, [fullEquipmentMetrics, search, statusFilter, categoryFilter]);

    const roleName = (user?.role || "USER").replace(/_/g, " ");
    const reportTitle = `${roleName} Utilization Report`;

    const summary = {
        "Overall Utilization": analytics ? `${analytics.utilizationPercentage}%` : "0%",
        "Completion Rate": analytics ? `${analytics.completionRate}%` : "0%",
        "Total Equipment Items": allEquipment.length,
        "Total Bookings": analytics ? analytics.totalBookings : bookingsList.length,
        "In Use Now": realTimeData.length,
        "Idle Equipment Items": idleEquip.length,
        "Shared Usage Bookings": usagePatterns ? usagePatterns.sharedBookingsCount : 0
    };

    const handlePDF = () => {
        generatePDFReport({
            title: reportTitle,
            user: profile || user,
            summary,
            filters: {
                fromDate: "All",
                toDate: "All",
                status: statusFilter,
                equipment: categoryFilter,
                search: search || "-"
            },
            sections: [
                {
                    title: "Equipment Inventory & Usage Overview",
                    columns: ["ID", "Equipment Name", "Category", "Department", "Quantity", "Total Bookings", "Status"],
                    rows: filteredEquipmentList.map(e => [
                        e.id,
                        e.name,
                        e.category || "-",
                        e.department || "-",
                        e.quantity || 1,
                        e.bookingCount,
                        e.status || "AVAILABLE"
                    ])
                },
                {
                    title: "Equipment Utilization Rates (30 Days)",
                    columns: ["Equipment Name", "Category", "Utilization Rate (%)"],
                    rows: equipmentRates.length > 0
                        ? equipmentRates.map(eq => [eq.equipmentName, eq.category || "-", `${eq.utilizationRate}%`])
                        : filteredEquipmentList.map(eq => [eq.name, eq.category || "-", "0.0%"])
                },
                {
                    title: "Department Utilization Rates",
                    columns: ["Department", "Target Rate (%)", "Utilization Rate (%)"],
                    rows: deptRates.map(d => [d.groupName, `${d.targetRate}%`, `${d.utilizationRate}%`])
                },
                {
                    title: "Institution Utilization Rates",
                    columns: ["Institution", "Target Rate (%)", "Utilization Rate (%)"],
                    rows: instRates.map(inst => [inst.groupName, `${inst.targetRate}%`, `${inst.utilizationRate}%`])
                },
                {
                    title: "Idle Equipment Alerts (>= 14 Days)",
                    columns: ["Equipment Name", "Category", "Days Idle"],
                    rows: idleEquip.map(item => [
                        item.equipmentName,
                        item.category || "-",
                        item.daysIdle >= 999 ? "Never Used" : `${item.daysIdle} days`
                    ])
                },
                {
                    title: "Real-Time Active In-Use Equipment",
                    columns: ["Equipment Name", "Category", "Current User", "End Time"],
                    rows: realTimeData.map(item => [
                        item.equipmentName,
                        item.category || "-",
                        item.currentUserName || "-",
                        new Date(item.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                    ])
                }
            ]
        });
    };

    const handleExcel = () => {
        generateExcelReport({
            title: reportTitle,
            user: profile || user,
            summary,
            filters: {
                fromDate: "All",
                toDate: "All",
                status: statusFilter,
                equipment: categoryFilter,
                search: search || "-"
            },
            sections: [
                {
                    title: "Equipment Inventory & Usage Overview",
                    columns: ["ID", "Equipment Name", "Category", "Department", "Quantity", "Total Bookings", "Status"],
                    rows: filteredEquipmentList.map(e => [
                        e.id,
                        e.name,
                        e.category || "-",
                        e.department || "-",
                        e.quantity || 1,
                        e.bookingCount,
                        e.status || "AVAILABLE"
                    ])
                },
                {
                    title: "Equipment Utilization Rates (30 Days)",
                    columns: ["Equipment Name", "Category", "Utilization Rate (%)"],
                    rows: equipmentRates.length > 0
                        ? equipmentRates.map(eq => [eq.equipmentName, eq.category || "-", `${eq.utilizationRate}%`])
                        : filteredEquipmentList.map(eq => [eq.name, eq.category || "-", "0.0%"])
                },
                {
                    title: "Department Utilization Rates",
                    columns: ["Department", "Target Rate (%)", "Utilization Rate (%)"],
                    rows: deptRates.map(d => [d.groupName, `${d.targetRate}%`, `${d.utilizationRate}%`])
                },
                {
                    title: "Institution Utilization Rates",
                    columns: ["Institution", "Target Rate (%)", "Utilization Rate (%)"],
                    rows: instRates.map(inst => [inst.groupName, `${inst.targetRate}%`, `${inst.utilizationRate}%`])
                },
                {
                    title: "Idle Equipment Alerts",
                    columns: ["Equipment Name", "Category", "Days Idle"],
                    rows: idleEquip.map(item => [
                        item.equipmentName,
                        item.category || "-",
                        item.daysIdle >= 999 ? "Never Used" : `${item.daysIdle} days`
                    ])
                },
                {
                    title: "Real-Time Active In-Use Equipment",
                    columns: ["Equipment Name", "Category", "Current User", "End Time"],
                    rows: realTimeData.map(item => [
                        item.equipmentName,
                        item.category || "-",
                        item.currentUserName || "-",
                        new Date(item.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                    ])
                }
            ]
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d0e12] flex justify-center items-center text-white">
                Loading Utilization Report...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0e12] text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold">{reportTitle}</h1>
                        <p className="text-gray-400 mt-2">
                            Comprehensive resource utilization analytics computed from live booking data.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handlePDF}
                            className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
                        >
                            📄 Export PDF
                        </button>
                        <button
                            onClick={handleExcel}
                            className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
                        >
                            📊 Export Excel
                        </button>
                    </div>
                </div>

                {/* ── Summary Stats Grid ── */}
                <div className="grid md:grid-cols-4 gap-5 mt-8">
                    <StatCard
                        label="Overall Utilization"
                        value={`${analytics?.utilizationPercentage || 0}%`}
                        color="indigo"
                        icon="📊"
                    />
                    <StatCard
                        label="Completion Rate"
                        value={`${analytics?.completionRate || 0}%`}
                        color="emerald"
                        icon="✅"
                    />
                    <StatCard
                        label="Total Equipment"
                        value={allEquipment.length}
                        color="purple"
                        icon="📦"
                    />
                    <StatCard
                        label="Under Maintenance"
                        value={allEquipment.filter(e => e.status === "UNDER_MAINTENANCE").length}
                        color="amber"
                        icon="🔧"
                    />
                </div>

                {/* ── Equipment & Booking Status Overview ── */}
                <div className="grid md:grid-cols-4 gap-4 mt-4">
                    <StatCard label="Available" value={allEquipment.filter(e => e.status === "AVAILABLE").length} color="emerald" icon="✅" />
                    <StatCard label="Booked" value={allEquipment.filter(e => e.status === "BOOKED").length} color="blue" icon="📅" />
                    <StatCard label="Out of Service" value={allEquipment.filter(e => e.status === "OUT_OF_SERVICE").length} color="red" icon="🚫" />
                    <StatCard label="In Use Now" value={realTimeData.length} color="indigo" icon="▶️" />
                </div>

                {/* ── Filters Section ── */}
                <div className="bg-[#15171f] rounded-xl mt-8 p-6">
                    <div className="grid md:grid-cols-4 gap-5">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3 text-white border border-white/10"
                        >
                            <option value="ALL">All Status</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="BOOKED">Booked</option>
                            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                            <option value="OUT_OF_SERVICE">Out of Service</option>
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3 text-white border border-white/10"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <input
                            placeholder="Search equipment..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3 text-white border border-white/10 md:col-span-2"
                        />
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={() => {
                                setStatusFilter("ALL");
                                setCategoryFilter("ALL");
                                setSearch("");
                            }}
                            className="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition font-medium"
                        >
                            Clear Filters
                        </button>
                    </div>

                    {/* ── All Equipment Items Table ── */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-white">All Equipment Inventory List</h2>
                        <p className="text-gray-400 mt-2 mb-6">
                            Showing {filteredEquipmentList.length} of {allEquipment.length} total equipment items
                        </p>

                        <div className="overflow-x-auto rounded-xl border border-white/10">
                            <table className="min-w-full">
                                <thead className="bg-[#1b1d26]">
                                    <tr>
                                        <th className="text-left p-4">ID</th>
                                        <th className="text-left p-4">Equipment Name</th>
                                        <th className="text-left p-4">Category</th>
                                        <th className="text-left p-4">Department</th>
                                        <th className="text-left p-4">Quantity</th>
                                        <th className="text-left p-4">Total Bookings</th>
                                        <th className="text-left p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEquipmentList.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center p-10 text-gray-400">
                                                No equipment items found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEquipmentList.map((record) => (
                                            <tr key={record.id} className="border-t border-white/10 hover:bg-white/5 transition">
                                                <td className="p-4">{record.id}</td>
                                                <td className="p-4 font-semibold text-white">{record.name}</td>
                                                <td className="p-4">{record.category || "-"}</td>
                                                <td className="p-4">{record.department || "-"}</td>
                                                <td className="p-4">{record.quantity || 1}</td>
                                                <td className="p-4 font-bold text-purple-400">{record.bookingCount}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        record.status === "AVAILABLE"
                                                            ? "bg-green-500/20 text-green-400"
                                                            : record.status === "UNDER_MAINTENANCE"
                                                            ? "bg-yellow-500/20 text-yellow-400"
                                                            : record.status === "BOOKED"
                                                            ? "bg-blue-500/20 text-blue-400"
                                                            : "bg-red-500/20 text-red-400"
                                                    }`}>
                                                        {record.status || "AVAILABLE"}
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

                {/* ── Utilization Analytics Rates Section ── */}
                <div className="grid lg:grid-cols-2 gap-8 mt-10">
                    {/* Equipment Utilization Rates */}
                    <div className="bg-[#15171f] border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 text-purple-400">Equipment Utilization Rates (30 Days)</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#1b1d26]">
                                    <tr>
                                        <th className="p-3">Equipment</th>
                                        <th className="p-3">Category</th>
                                        <th className="p-3 text-right">Utilization</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {(equipmentRates.length > 0 ? equipmentRates : filteredEquipmentList).length === 0 ? (
                                        <tr><td colSpan="3" className="p-4 text-center text-gray-400">No equipment rates available</td></tr>
                                    ) : (
                                        (equipmentRates.length > 0 ? equipmentRates : filteredEquipmentList).map(eq => (
                                            <tr key={eq.equipmentId || eq.id} className="hover:bg-white/5">
                                                <td className="p-3 font-semibold">{eq.equipmentName || eq.name}</td>
                                                <td className="p-3 text-gray-400 text-xs">{eq.category || "-"}</td>
                                                <td className="p-3 text-right font-bold text-indigo-400">
                                                    {eq.utilizationRate !== undefined ? `${eq.utilizationRate}%` : '0.0%'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Department Utilization Rates */}
                    <div className="bg-[#15171f] border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 text-emerald-400">Department Utilization Rates</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#1b1d26]">
                                    <tr>
                                        <th className="p-3">Department</th>
                                        <th className="p-3">Target Rate</th>
                                        <th className="p-3 text-right">Actual Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {deptRates.length === 0 ? (
                                        <tr><td colSpan="3" className="p-4 text-center text-gray-400">No department rates available</td></tr>
                                    ) : (
                                        deptRates.map((d, i) => (
                                            <tr key={i} className="hover:bg-white/5">
                                                <td className="p-3 font-semibold">{d.groupName}</td>
                                                <td className="p-3 text-gray-400 text-xs">{d.targetRate}%</td>
                                                <td className="p-3 text-right font-bold text-emerald-400">{d.utilizationRate}%</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── Idle Equipment & Real-Time Tracking ── */}
                <div className="grid lg:grid-cols-2 gap-8 mt-8">
                    {/* Idle Equipment Alerts */}
                    <div className="bg-[#15171f] border border-red-500/20 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 text-red-400">Idle Equipment Alerts (&ge; 14 Days)</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#1b1d26]">
                                    <tr>
                                        <th className="p-3">Equipment</th>
                                        <th className="p-3">Category</th>
                                        <th className="p-3 text-right">Idle Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {idleEquip.length === 0 ? (
                                        <tr><td colSpan="3" className="p-4 text-center text-gray-400">No idle equipment detected.</td></tr>
                                    ) : (
                                        idleEquip.map(item => (
                                            <tr key={item.equipmentId} className="hover:bg-white/5">
                                                <td className="p-3 font-semibold">{item.equipmentName}</td>
                                                <td className="p-3 text-gray-400 text-xs">{item.category || "-"}</td>
                                                <td className="p-3 text-right font-bold text-red-400">
                                                    {item.daysIdle >= 999 ? "Never Used" : `${item.daysIdle} days`}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Institution Utilization Rates */}
                    <div className="bg-[#15171f] border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 text-blue-400">Institution Utilization Rates</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#1b1d26]">
                                    <tr>
                                        <th className="p-3">Institution</th>
                                        <th className="p-3">Target Rate</th>
                                        <th className="p-3 text-right">Actual Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {instRates.length === 0 ? (
                                        <tr><td colSpan="3" className="p-4 text-center text-gray-400">No institution rates available</td></tr>
                                    ) : (
                                        instRates.map((inst, i) => (
                                            <tr key={i} className="hover:bg-white/5">
                                                <td className="p-3 font-semibold">{inst.groupName}</td>
                                                <td className="p-3 text-gray-400 text-xs">{inst.targetRate}%</td>
                                                <td className="p-3 text-right font-bold text-blue-400">{inst.utilizationRate}%</td>
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

export default UtilizationReport;
