import React from "react";
import { useNavigate } from "react-router-dom";

const SystemAdminReportsHome = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0d0e12] text-white p-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold">System Administrator Reports</h1>
                <p className="text-gray-400 mt-3">
                    Generate global system reports for Bookings, Maintenance, Calibration, and Utilization metrics.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-12">
                    {/* Bookings Report */}
                    <div className="bg-[#15171f] rounded-2xl p-8 border border-white/10 hover:border-purple-500 transition flex flex-col justify-between">
                        <div>
                            <div className="text-5xl">📅</div>
                            <h2 className="text-2xl font-bold mt-5">Bookings Report</h2>
                            <p className="text-gray-400 mt-3">
                                Comprehensive system-wide booking statistics, active reservations, and status distribution.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/reports/bookings")}
                            className="mt-8 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold w-full"
                        >
                            Open Report
                        </button>
                    </div>

                    {/* Maintenance Report */}
                    <div className="bg-[#15171f] rounded-2xl p-8 border border-white/10 hover:border-purple-500 transition flex flex-col justify-between">
                        <div>
                            <div className="text-5xl">🔧</div>
                            <h2 className="text-2xl font-bold mt-5">Maintenance Report</h2>
                            <p className="text-gray-400 mt-3">
                                Global maintenance work orders, technician assignments, repair timelines, and audit logs.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/reports/maintenance")}
                            className="mt-8 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold w-full"
                        >
                            Open Report
                        </button>
                    </div>

                    {/* Calibration Report */}
                    <div className="bg-[#15171f] rounded-2xl p-8 border border-white/10 hover:border-purple-500 transition flex flex-col justify-between">
                        <div>
                            <div className="text-5xl">⚙️</div>
                            <h2 className="text-2xl font-bold mt-5">Calibration Report</h2>
                            <p className="text-gray-400 mt-3">
                                System-wide calibration records, expiration dates, certificates, and compliance reports.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/reports/calibration")}
                            className="mt-8 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold w-full"
                        >
                            Open Report
                        </button>
                    </div>

                    {/* Utilization Report */}
                    <div className="bg-[#15171f] rounded-2xl p-8 border border-white/10 hover:border-purple-500 transition flex flex-col justify-between">
                        <div>
                            <div className="text-5xl">📊</div>
                            <h2 className="text-2xl font-bold mt-5">Utilization Report</h2>
                            <p className="text-gray-400 mt-3">
                                System-wide lab resource utilization metrics, capacity tracking, and usage analytics.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/reports/utilization")}
                            className="mt-8 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold w-full"
                        >
                            Open Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemAdminReportsHome;
