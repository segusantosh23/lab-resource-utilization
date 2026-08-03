import React from "react";
import { useNavigate } from "react-router-dom";

const ReportsHome = () => {

    const navigate = useNavigate();

    return (

        <div className="min-h-screen bg-[#0d0e12] text-white p-10">

            <div className="max-w-6xl mx-auto">

                <h1 className="text-4xl font-bold">

                    Lab Technician Reports

                </h1>

                <p className="text-gray-400 mt-3">

                    Generate downloadable reports for Maintenance and Calibration activities.

                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-12">

                    {/* Maintenance */}

                    <div className="bg-[#15171f] rounded-2xl p-8 border border-white/10 hover:border-purple-500 transition">

                        <div className="text-5xl">

                            🔧

                        </div>

                        <h2 className="text-2xl font-bold mt-5">

                            Maintenance Report

                        </h2>

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

                    {/* Calibration */}

                    <div className="bg-[#15171f] rounded-2xl p-8 border border-white/10 hover:border-purple-500 transition">

                        <div className="text-5xl">

                            ⚙️

                        </div>

                        <h2 className="text-2xl font-bold mt-5">

                            Calibration Report

                        </h2>

                        <p className="text-gray-400 mt-3">

                            Generate calibration history, due dates and completed calibration reports.

                        </p>

                        <button

                            onClick={() => navigate("/reports/calibration")}

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

export default ReportsHome;