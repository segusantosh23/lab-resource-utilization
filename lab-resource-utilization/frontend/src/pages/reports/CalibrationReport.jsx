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
    return d.toLocaleDateString();
};

const CalibrationReport = () => {

    const { user } = useContext(AuthContext);

    const [profile, setProfile] = useState(null);
    const [records, setRecords] = useState([]);
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
                    api.get("/api/calibrations")
                ]);

                if (profileData) {
                    setProfile(profileData);
                }

                const recordsToShow = user.role === "LAB_TECHNICIAN"
                    ? (res.data || []).filter(calibration => calibration.technicianName === user.name)
                    : (res.data || []);

                setRecords(recordsToShow);

            }

            catch(err){

                console.error(err);

            }

            finally{

                setLoading(false);

            }

        };

        load();

    },[user]);
    const equipments = [

        "ALL",

        ...new Set(records.map(r => r.equipmentName))

    ];

    const filteredRecords = useMemo(() => {

        return records.filter(r => {

            const equipmentOk =

                equipment === "ALL" ||

                r.equipmentName === equipment;

            const statusOk =

                status === "ALL" ||

                r.status === status;

            const searchOk =

                r.equipmentName
                    .toLowerCase()
                    .includes(search.toLowerCase())

                ||

                (r.certificateNumber || "")
                    .toLowerCase()
                    .includes(search.toLowerCase())

                ||

                (r.remarks || "")
                    .toLowerCase()
                    .includes(search.toLowerCase())

                ||

                r.id.toString().includes(search);

            const calibrationDate = new Date(r.calibrationDate);

            const fromOk =

                !fromDate ||

                calibrationDate >= new Date(fromDate);

            const toOk =

                !toDate ||

                calibrationDate <= new Date(toDate + "T23:59:59");

            return (

                equipmentOk &&

                statusOk &&

                searchOk &&

                fromOk &&

                toOk

            );

        });

    }, [

        records,
        equipment,
        status,
        search,
        fromDate,
        toDate

    ]);

    const summary = {

        "Total Records":

        records.length,

        "Passed":

        records.filter(r => r.result === "PASS").length,

        "Failed":

        records.filter(r => r.result === "FAIL").length,

        "Due Soon":

        records.filter(r => r.status === "DUE_SOON").length

    };

    const roleName = (user?.role || "USER").replace(/_/g, " ");
    const reportTitle = `${roleName} Calibration Report`;

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

                "Calibration ID",

                "Equipment",

                "Calibration Date",

                "Next Due",

                "Certificate",

                "Result"

            ],

            rows: filteredRecords.map(r => [

                r.id,

                r.equipmentName,

                formatDate(r.calibrationDate),

                formatDate(r.nextDueDate),

                r.certificateNumber,

                r.result

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
                "Calibration ID",
                "Equipment",
                "Calibration Date",
                "Next Due Date",
                "Certificate Number",
                "Result"
            ],

            rows: filteredRecords.map(r => [

                r.id,

                r.equipmentName,

                formatDate(r.calibrationDate),

                formatDate(r.nextDueDate),

                r.certificateNumber,

                r.result

            ])

        });

    };



    if(loading){

        return(

            <div className="min-h-screen bg-[#0d0e12] flex justify-center items-center text-white">

                Loading Calibration Report...

            </div>

        );

    }

    return (

        <div className="min-h-screen bg-[#0d0e12] text-white p-8">

            <div className="max-w-7xl mx-auto">

                <h1 className="text-4xl font-bold">

                    Calibration Reports

                </h1>

                <p className="text-gray-400 mt-2">

                    Generate calibration reports in PDF or Excel format.

                </p>

                {/* ================= Summary ================= */}

                <div className="grid md:grid-cols-4 gap-5 mt-8">

                    <div className="bg-[#15171f] rounded-xl p-5">

                        <p>Total Records</p>

                        <h2 className="text-3xl mt-2 font-bold text-purple-400">

                            {summary["Total Records"]}

                        </h2>

                    </div>

                    <div className="bg-[#15171f] rounded-xl p-5">

                        <p>Passed</p>

                        <h2 className="text-3xl mt-2 font-bold text-green-400">

                            {summary["Passed"]}

                        </h2>

                    </div>

                    <div className="bg-[#15171f] rounded-xl p-5">

                        <p>Failed</p>

                        <h2 className="text-3xl mt-2 font-bold text-red-400">

                            {summary["Failed"]}

                        </h2>

                    </div>

                    <div className="bg-[#15171f] rounded-xl p-5">

                        <p>Due Soon</p>

                        <h2 className="text-3xl mt-2 font-bold text-yellow-400">

                            {summary["Due Soon"]}

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

                            <option value="COMPLETED">Completed</option>

                            <option value="DUE_SOON">Due Soon</option>

                            <option value="OVERDUE">Overdue</option>

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

                    <div className="flex justify-between items-center mt-6">

                        <button

                            onClick={()=>{

                                setFromDate("");
                                setToDate("");
                                setStatus("ALL");
                                setEquipment("ALL");
                                setSearch("");

                            }}

                            className="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20"

                        >

                            Clear Filters

                        </button>

                        <div className="flex gap-4">

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

                    </div>

                    <div className="mt-10">

                        <h2 className="text-2xl font-bold">

                            Calibration History Preview

                        </h2>

                        <p className="text-gray-400 mt-2 mb-5">

                            Showing {filteredRecords.length} of {records.length} calibration records

                        </p>

                        <div className="overflow-x-auto rounded-xl border border-white/10">

                            <table className="min-w-full">

                                <thead className="bg-[#1b1d26]">

                                <tr>

                                    <th className="text-left p-4">ID</th>

                                    <th className="text-left p-4">Equipment</th>

                                    <th className="text-left p-4">Calibration Date</th>

                                    <th className="text-left p-4">Next Due</th>

                                    <th className="text-left p-4">Certificate</th>

                                    <th className="text-left p-4">Result</th>

                                </tr>

                                </thead>

                                <tbody>

                                {filteredRecords.length===0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="text-center p-10 text-gray-400"
                                        >

                                            No calibration records found.

                                        </td>

                                    </tr>

                                ):(filteredRecords.map(record=>(

                                    <tr

                                        key={record.id}

                                        className="border-t border-white/10 hover:bg-white/5"

                                    >

                                        <td className="p-4">

                                            {record.id}

                                        </td>

                                        <td className="p-4">

                                            {record.equipmentName}

                                        </td>

                                        <td className="p-4">

                                            {formatDate(record.calibrationDate)}

                                        </td>

                                        <td className="p-4">

                                            {formatDate(record.nextDueDate)}

                                        </td>

                                        <td className="p-4">

                                            {record.certificateNumber}

                                        </td>

                                        <td className="p-4">

                                            <span

                                                className={`px-3 py-1 rounded-full text-sm
                                            
                                            ${
                                                    record.result==="PASS"
                                            
                                                        ?"bg-green-500/20 text-green-400"
                                            
                                                        :"bg-red-500/20 text-red-400"
                                            
                                                }
                                            
                                            `}

                                            >

                                            {record.result}

                                            </span>

                                        </td>

                                    </tr>

                                )))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default CalibrationReport;