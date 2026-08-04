import React from "react";
import { useNavigate } from "react-router-dom";

const LabManagerReportsHome = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0d0e12] text-white p-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold">Lab Manager Reports</h1>
                <p className="text-gray-400 mt-3">
                    Generate comprehensive reports for Bookings, Maintenance, Calibration, and Utilization.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-12">
                    {/* Bookings Report */}
                    <div className="bg-[#15171f] rounded-2xl p-8 border border-white/10 hover:border-purple-500 transition">
                        <div className="text-5xl">📅</div>
                        <h2 className="text-2xl font-bold mt-5">Bookings Report</h2>
                        <p className="text-gray-400 mt-3">
                            View reservation activity, user bookings, time slots, and export records in PDF or Excel.
                        </p>
                        <button
                            onClick={() => navigate("/reports/bookings")}
                            className="mt-8 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold"
                        >
                            Open Report
                        </button>
                    </div>

                    {/* Maintenance Report */}
                    <div className="bg-[#15171f] rounded-2xl p-8 border border-white/10 hover:border-purple-500 transition">
                        <div className="text-5xl">🔧</div>
                        <h2 className="text-2xl font-bold mt-5">Maintenance Report</h2>
                        <p className="text-gray-400 mt-3">
                            View maintenance requests, work orders, completed repairs and export reports in PDF or Excel.
                        </p>
                        <button
                            onClick={() => navigate("/reports/maintenance")}
                            className="mt-8 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold"
                        >
                            Open Report
                        </button>
                    </div>

                    {/* Calibration Report */}
                    <div className="bg-[#15171f] rounded-2xl p-8 border border-white/10 hover:border-purple-500 transition">
                        <div className="text-5xl">⚙️</div>
                        <h2 className="text-2xl font-bold mt-5">Calibration Report</h2>
                        <p className="text-gray-400 mt-3">
                            Generate calibration history, due dates, certificates and completed calibration reports.
                        </p>
                        <button
                            onClick={() => navigate("/reports/calibration")}
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
                            Analyze equipment usage rates, active hours, peak demand items, and export analytics.
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

export default LabManagerReportsHome;
