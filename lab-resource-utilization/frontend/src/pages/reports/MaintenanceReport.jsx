import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

import {
    generatePDFReport,
    generateExcelReport
} from "../../utils/reportGenerator";

const MaintenanceReport = () => {

    const { user } = useContext(AuthContext);

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [status, setStatus] = useState("ALL");
    const [equipment, setEquipment] = useState("ALL");
    const [search, setSearch] = useState("");

    useEffect(() => {

        if (!user) return;

        const load = async () => {

            try {

                const res = await api.get(
                    `/api/maintenance/technician/${user.name}`
                );

                setRecords(res.data);

            }

            catch (err) {

                console.error(err);

            }

            finally {

                setLoading(false);

            }

        };

        load();

    }, [user]);

    const equipments = [

        "ALL",

        ...new Set(records.map(r => r.equipment))

    ];

    const filteredRecords = useMemo(() => {

        return records.filter(r => {

            const searchOk =

                r.equipment.toLowerCase().includes(search.toLowerCase()) ||

                (r.description || "")
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||

                r.id.toString().includes(search);

            const equipmentOk =

                equipment === "ALL" ||

                r.equipment === equipment;

            const statusOk =

                status === "ALL" ||

                r.status === status;

            // Date filtering (skip until backend has createdAt)
            const createdDate = r.createdAt
                ? new Date(r.createdAt)
                : null;

            const fromOk =
                !fromDate ||
                (createdDate && createdDate >= new Date(fromDate));

            const toOk =
                !toDate ||
                (createdDate && createdDate <= new Date(toDate + "T23:59:59"));

            return (

                searchOk &&
                equipmentOk &&
                statusOk &&
                fromOk &&
                toOk

            );

        });

    }, [

        records,
        search,
        equipment,
        status,
        fromDate,
        toDate

    ]);

    const summary = {

        "Total Requests": filteredRecords.length,

        "Pending":
        filteredRecords.filter(r => r.status === "Pending").length,

        "In Progress":
        filteredRecords.filter(r => r.status === "In Progress").length,

        "Completed":
        filteredRecords.filter(r => r.status === "Completed").length

    };


    const handlePDF = () => {

        generatePDFReport({

            title: "Lab Technician Maintenance Report",

            user,

            summary,

            filters: {

                fromDate,
                toDate,
                status,
                equipment,
                search

            },

            columns: [
                "Request ID",
                "Equipment",
                "Description",
                "Priority",
                "Created",
                "Completed",
                "Status"
            ],

            rows: filteredRecords.map(r => [

                r.id,

                r.equipment,

                r.description,

                r.priority,

                r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString()
                    : "-",

                r.completedAt
                    ? new Date(r.completedAt).toLocaleDateString()
                    : "-",

                r.status

            ])

        });

    };
    const handleExcel = () => {

        generateExcelReport({

            title: "Lab Technician Maintenance Report",

            user,

            summary,

            filters: {

                fromDate,
                toDate,
                status,
                equipment,
                search

            },
            columns: [
                "Request ID",
                "Equipment",
                "Description",
                "Priority",
                "Created",
                "Completed",
                "Status"
            ],

            rows: filteredRecords.map(r => [

                r.id,

                r.equipment,

                r.description,

                r.priority,

                r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString()
                    : "-",

                r.completedAt
                    ? new Date(r.completedAt).toLocaleDateString()
                    : "-",

                r.status

            ])

        });

    };





    if (loading) {

        return (

            <div className="min-h-screen bg-[#0d0e12] flex justify-center items-center text-white">

                Loading Maintenance Report...

            </div>

        );

    }

    return (

        <div className="min-h-screen bg-[#0d0e12] text-white p-8">

            <div className="max-w-7xl mx-auto">

                <h1 className="text-4xl font-bold">
                    Maintenance Reports
                </h1>

                <p className="text-gray-400 mt-2">
                    Generate maintenance reports in PDF or Excel format.
                </p>

                {/* ================= Summary Cards ================= */}

                <div className="grid md:grid-cols-4 gap-5 mt-8">

                    <div className="bg-[#15171f] rounded-xl p-5">

                        <p>Total Requests</p>

                        <h2 className="text-3xl mt-2 font-bold text-purple-400">
                            {summary["Total Requests"]}
                        </h2>

                    </div>

                    <div className="bg-[#15171f] rounded-xl p-5">

                        <p>Pending</p>

                        <h2 className="text-3xl mt-2 font-bold text-yellow-400">
                            {summary["Pending"]}
                        </h2>

                    </div>

                    <div className="bg-[#15171f] rounded-xl p-5">

                        <p>In Progress</p>

                        <h2 className="text-3xl mt-2 font-bold text-blue-400">
                            {summary["In Progress"]}
                        </h2>

                    </div>

                    <div className="bg-[#15171f] rounded-xl p-5">

                        <p>Completed</p>

                        <h2 className="text-3xl mt-2 font-bold text-green-400">
                            {summary["Completed"]}
                        </h2>

                    </div>

                </div>

                {/* ================= Filters ================= */}

                <div className="bg-[#15171f] rounded-xl mt-8 p-6">

                    <div className="grid md:grid-cols-5 gap-5">

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e)=>setFromDate(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3"
                        />

                        <input
                            type="date"
                            value={toDate}
                            onChange={(e)=>setToDate(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3"
                        />

                        <select
                            value={status}
                            onChange={(e)=>setStatus(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3"
                        >

                            <option value="ALL">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>

                        </select>

                        <select
                            value={equipment}
                            onChange={(e)=>setEquipment(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3"
                        >

                            {equipments.map(item=>(

                                <option key={item}>
                                    {item}
                                </option>

                            ))}

                        </select>

                        <input
                            placeholder="Search..."
                            value={search}
                            onChange={(e)=>setSearch(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3"
                        />

                    </div>

                    <div className="flex justify-end mt-5">

                        <button

                            onClick={() => {

                                setFromDate("");
                                setToDate("");
                                setStatus("ALL");
                                setEquipment("ALL");
                                setSearch("");

                            }}

                            className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"

                        >

                            Clear Filters

                        </button>

                    </div>

                    <div className="flex justify-end gap-5 mt-6">

                        <button

                            onClick={handlePDF}

                            className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold"

                        >

                            📄 Generate PDF

                        </button>

                        <button

                            onClick={handleExcel}

                            className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold"

                        >

                            📊 Export Excel

                        </button>

                    </div>

                    {/* ================= Preview Table ================= */}

                    <div className="mt-10">

                        <h2 className="text-2xl font-bold">
                            Maintenance History Preview
                        </h2>

                        <p className="text-gray-400 mt-2 mb-6">
                            Showing {filteredRecords.length} of {records.length} maintenance requests
                        </p>

                        <div className="overflow-x-auto rounded-xl border border-white/10">

                            <table className="min-w-full">

                                <thead className="bg-[#1b1d26]">

                                <tr>

                                    <th className="text-left p-4">Request ID</th>

                                    <th className="text-left p-4">Equipment</th>

                                    <th className="text-left p-4">Description</th>

                                    <th className="text-left p-4">Priority</th>

                                    <th className="text-left p-4">Quantity</th>

                                    <th className="text-left p-4">Status</th>

                                    <th className="p-4">Created Date</th>

                                    <th className="p-4">Completed Date</th>

                                </tr>

                                </thead>

                                <tbody>

                                {filteredRecords.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="text-center p-10 text-gray-400"
                                        >

                                            No maintenance records found.

                                        </td>

                                    </tr>

                                ) : (

                                    filteredRecords.map((record) => (

                                        <tr
                                            key={record.id}
                                            className="border-t border-white/10 hover:bg-white/5 transition"
                                        >

                                            <td className="p-4">
                                                {record.id}
                                            </td>

                                            <td className="p-4">
                                                {record.equipment}
                                            </td>

                                            <td className="p-4">
                                                {record.description}
                                            </td>

                                            <td className="p-4">

                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium

                                    ${
                                        
                                        record.priority === "HIGH"
                                            ? "bg-red-500/20 text-red-400"

                                            : record.priority === "MEDIUM"
                                                ? "bg-yellow-500/20 text-yellow-400"

                                                : "bg-green-500/20 text-green-400"
                                    }

                                    `}
                                >

                                    {record.priority}

                                </span>

                                            </td>

                                            <td className="p-4">
                                                {record.quantity}
                                            </td>

                                            <td className="p-4">

                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium

                                    ${
                                        record.status === "Completed"
                                            ? "bg-green-500/20 text-green-400"

                                            : record.status === "In Progress"
                                                ? "bg-blue-500/20 text-blue-400"

                                                : "bg-yellow-500/20 text-yellow-400"
                                    }

                                    `}
                                >

                                    {record.status}

                                </span>

                                            </td>

                                            <td className="p-4">
                                                {record.createdAt
                                                    ? new Date(record.createdAt).toLocaleDateString()
                                                    : "-"}
                                            </td>

                                            <td className="p-4">
                                                {record.completedAt
                                                    ? new Date(record.completedAt).toLocaleDateString()
                                                    : "-"}
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

export default MaintenanceReport;