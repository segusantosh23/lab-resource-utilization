import React from "react";
import { useNavigate } from "react-router-dom";

const DepartmentHeadReportsHome = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0d0e12] text-white p-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold">Department Head Reports</h1>
                <p className="text-gray-400 mt-3">
                    Generate department-wide reports for Bookings and Equipment Utilization.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-12">
                    {/* Bookings Report */}
                    <div className="bg-[#15171f] rounded-2xl p-8 border border-white/10 hover:border-purple-500 transition">
                        <div className="text-5xl">📅</div>
                        <h2 className="text-2xl font-bold mt-5">Bookings Report</h2>
                        <p className="text-gray-400 mt-3">
                            Monitor department booking reservations, user scheduling, and export report files in PDF or Excel.
                        </p>
                        <button
                            onClick={() => navigate("/reports/bookings")}
                            className="mt-8 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold"
                        >
                            Open Report
                        </button>
                    </div>

                    {/* Utilization Report */}
                    <div className="bg-[#15171f] rounded-2xl p-8 border border-white/10 hover:border-purple-500 transition">
                        <div className="text-5xl">📊</div>
                        <h2 className="text-2xl font-bold mt-5">Utilization Report</h2>
                        <p className="text-gray-400 mt-3">
                            Track department resource utilization rates, peak hours, and equipment workload metrics.
                        </p>
                        <button
                            onClick={() => navigate("/reports/utilization")}
                            className="mt-8 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold"
                        >
                            Open Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentHeadReportsHome;
