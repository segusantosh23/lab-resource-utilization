import React, { useEffect, useMemo, useState } from "react";
import { getProfile } from "../../services/profileService";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

import {
    generatePDFReport,
    generateExcelReport
} from "../../utils/reportGenerator";
import { getMyBookings } from "../../services/bookingService";

const ResearcherReports = () => {
    const [profile, setProfile] = useState(null);
    const [bookings,setBookings]=useState([]);
    const [loading,setLoading]=useState(true);

    const [fromDate,setFromDate]=useState("");
    const [toDate,setToDate]=useState("");
    const { user } = useContext(AuthContext);

    const [status,setStatus]=useState("ALL");
    const [equipment,setEquipment]=useState("ALL");
    const [search,setSearch]=useState("");



    useEffect(() => {

        const load = async () => {

            try{

                // Load bookings
                const bookingData = await getMyBookings();
                setBookings(bookingData);

                // Load logged-in user's complete profile
                const profileData = await getProfile();
                setProfile(profileData);

            }

            catch(error){

                console.error(error);

            }

            finally{

                setLoading(false);

            }

        };

        load();

    },[]);



    const equipments=[

        "ALL",

        ...new Set(bookings.map(b=>b.equipmentName))

    ];



    const filteredBookings=useMemo(()=>{

        return bookings.filter(b=>{

            const bookingDate=new Date(b.startTime);

            const fromOk=!fromDate || bookingDate>=new Date(fromDate);

            const toOk=!toDate || bookingDate<=new Date(toDate+"T23:59:59");

            const statusOk=status==="ALL" || b.status===status;

            const equipmentOk=equipment==="ALL" || b.equipmentName===equipment;

            const searchOk=

                b.equipmentName.toLowerCase().includes(search.toLowerCase()) ||

                b.id.toString().includes(search) ||

                (b.purpose||"").toLowerCase().includes(search.toLowerCase());

            return fromOk && toOk && statusOk && equipmentOk && searchOk;

        });

    },[bookings,fromDate,toDate,status,equipment,search]);


    const reportData = {

        title: "Researcher Booking Report",

        user: {

            name: profile?.name,

            email: profile?.email,

            role: profile?.role,

            department: profile?.department,

            institution: profile?.institution

        },

        filters: {

            fromDate,

            toDate,

            status,

            equipment,

            search

        },

        summary: {

            "Total Bookings": filteredBookings.length,

            "Completed":
            filteredBookings.filter(b => b.status === "COMPLETED").length,

            "Cancelled":
            filteredBookings.filter(b => b.status === "CANCELLED").length,

            "Rejected":
            filteredBookings.filter(b => b.status === "REJECTED").length,

            "No Show":
            filteredBookings.filter(b => b.status === "NO_SHOW").length

        },

        columns: [

            "Booking ID",

            "Equipment",

            "Purpose",

            "Start Time",

            "End Time",

            "Status"

        ],

        rows: filteredBookings.map(b => [

            b.id,

            b.equipmentName,

            b.purpose || "-",

            new Date(b.startTime).toLocaleString(),

            new Date(b.endTime).toLocaleString(),

            b.status

        ])

    };


    // const reportData = {
    //     title: "Researcher Booking Report",
    //
    //     user: {
    //         name: user?.name,
    //         email: user?.email,
    //         role: "Researcher",
    //         department: user?.department,
    //         institution: user?.institution
    //     },
    //
    //     filters: {
    //         fromDate,
    //         toDate,
    //         status,
    //         equipment,
    //         search
    //     },
    //
    //     summary: {
    //         total: filteredBookings.length,
    //         completed: filteredBookings.filter(b => b.status === "COMPLETED").length,
    //         cancelled: filteredBookings.filter(b => b.status === "CANCELLED").length,
    //         rejected: filteredBookings.filter(b => b.status === "REJECTED").length,
    //         noShow: filteredBookings.filter(b => b.status === "NO_SHOW").length
    //     },
    //
    //     columns: [
    //         "Booking ID",
    //         "Equipment",
    //         "Purpose",
    //         "Start Time",
    //         "End Time",
    //         "Status"
    //     ],
    //
    //     rows: filteredBookings.map(b => [
    //         b.id,
    //         b.equipmentName,
    //         b.purpose || "-",
    //         new Date(b.startTime).toLocaleString(),
    //         new Date(b.endTime).toLocaleString(),
    //         b.status
    //     ])
    // };



    const generatePDF = () => {

        generatePDFReport(reportData);

    };



    const generateExcel = () => {

        generateExcelReport(reportData);

    };



    if(loading){

        return(

            <div className="min-h-screen bg-[#0d0e12] text-white flex justify-center items-center">

                Loading...

            </div>

        );

    }



    return(

        <div className="min-h-screen bg-[#0d0e12] text-white p-8">

            <div className="max-w-7xl mx-auto">

                <h1 className="text-4xl font-bold">

                    Booking Reports

                </h1>

                <p className="text-gray-400 mt-2">

                    Generate booking history reports in PDF or Excel format.

                </p>



                {/* Summary */}

                <div className="grid md:grid-cols-4 gap-5 mt-8">

                    <div className="bg-[#15171f] rounded-xl p-5">

                        <p>Total Bookings</p>

                        <h2 className="text-3xl mt-2 font-bold text-purple-400">

                            {bookings.length}

                        </h2>

                    </div>



                    <div className="bg-[#15171f] rounded-xl p-5">

                        <p>Completed</p>

                        <h2 className="text-3xl mt-2 font-bold text-green-400">

                            {bookings.filter(b=>b.status==="COMPLETED").length}

                        </h2>

                    </div>



                    <div className="bg-[#15171f] rounded-xl p-5">

                        <p>Cancelled</p>

                        <h2 className="text-3xl mt-2 font-bold text-red-400">

                            {bookings.filter(b=>b.status==="CANCELLED").length}

                        </h2>

                    </div>



                    <div className="bg-[#15171f] rounded-xl p-5">

                        <p>Rejected</p>

                        <h2 className="text-3xl mt-2 font-bold text-yellow-400">

                            {bookings.filter(b=>b.status==="REJECTED").length}

                        </h2>

                    </div>

                </div>



                {/* Filters */}

                <div className="bg-[#15171f] rounded-xl mt-8 p-6">

                    <div className="grid md:grid-cols-5 gap-5">

                        <input

                            type="date"

                            value={fromDate}

                            onChange={e=>setFromDate(e.target.value)}

                            className="bg-[#0d0e12] rounded-lg p-3"

                        />



                        <input

                            type="date"

                            value={toDate}

                            onChange={e=>setToDate(e.target.value)}

                            className="bg-[#0d0e12] rounded-lg p-3"

                        />



                        <select

                            value={status}

                            onChange={e=>setStatus(e.target.value)}

                            className="bg-[#0d0e12] rounded-lg p-3"

                        >

                            <option value="ALL">All Status</option>

                            <option>COMPLETED</option>

                            <option>CANCELLED</option>

                            <option>REJECTED</option>

                            <option>NO_SHOW</option>

                        </select>



                        <select

                            value={equipment}

                            onChange={e=>setEquipment(e.target.value)}

                            className="bg-[#0d0e12] rounded-lg p-3"

                        >

                            {equipments.map(e=>

                                <option key={e}>{e}</option>

                            )}

                        </select>



                        <input

                            placeholder="Search..."

                            value={search}

                            onChange={e=>setSearch(e.target.value)}

                            className="bg-[#0d0e12] rounded-lg p-3"

                        />

                    </div>



                    {/* Export Buttons */}

                    <div className="flex justify-end gap-4 mt-6">

                        <button
                            onClick={() => generatePDFReport(reportData)}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold transition"
                        >
                            📄 Generate PDF
                        </button>

                        <button
                            onClick={() => generateExcelReport(reportData)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold transition"
                        >
                            📊 Export Excel
                        </button>

                    </div>

                    {/* Booking Preview */}

                    <div className="mt-10">

                        <div className="flex items-center justify-between mb-5">

                            <div>

                                <h2 className="text-2xl font-bold">

                                    Booking History Preview

                                </h2>

                                <p className="text-gray-400 mt-1">

                                    Showing <span className="text-purple-400 font-semibold">
                    {filteredBookings.length}
                </span> of{" "}
                                    <span className="text-purple-400 font-semibold">
                    {bookings.length}
                </span>{" "}
                                    bookings

                                </p>

                            </div>

                        </div>

                        <div className="overflow-x-auto rounded-xl border border-white/10">

                            <table className="min-w-full">

                                <thead className="bg-[#1b1d26]">

                                <tr>

                                    <th className="text-left p-4">Booking ID</th>

                                    <th className="text-left p-4">Equipment</th>

                                    <th className="text-left p-4">Purpose</th>

                                    <th className="text-left p-4">Start Time</th>

                                    <th className="text-left p-4">End Time</th>

                                    <th className="text-left p-4">Status</th>

                                </tr>

                                </thead>

                                <tbody>

                                {filteredBookings.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="text-center text-gray-400 p-10"
                                        >
                                            No bookings found for the selected filters.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredBookings.map((booking) => (

                                        <tr
                                            key={booking.id}
                                            className="border-t border-white/10 hover:bg-white/5 transition"
                                        >

                                            <td className="p-4">{booking.id}</td>

                                            <td className="p-4">{booking.equipmentName}</td>

                                            <td className="p-4">{booking.purpose || "-"}</td>

                                            <td className="p-4">

                                                {new Date(booking.startTime).toLocaleString()}

                                            </td>

                                            <td className="p-4">

                                                {new Date(booking.endTime).toLocaleString()}

                                            </td>

                                            <td className="p-4">

                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium
                                ${
                                    booking.status === "COMPLETED"
                                        ? "bg-green-500/20 text-green-400"
                                        : booking.status === "CANCELLED"
                                            ? "bg-red-500/20 text-red-400"
                                            : booking.status === "REJECTED"
                                                ? "bg-gray-500/20 text-gray-300"
                                                : "bg-yellow-500/20 text-yellow-400"
                                }`}
                            >
                                {booking.status}
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

export default ResearcherReports;