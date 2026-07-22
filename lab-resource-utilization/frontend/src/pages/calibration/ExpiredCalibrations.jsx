import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import calibrationService from "../../services/calibrationService";

const ExpiredCalibrations = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExpiredCalibrations();
    }, []);

    const loadExpiredCalibrations = async () => {
        try {
            const response = await calibrationService.getExpiredCalibrations();
            setRecords(response.data);
        } catch (error) {
            console.error(error);
            alert("Unable to load expired calibrations.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d0e12] flex items-center justify-center">
                <h2 className="text-white text-xl">Loading...</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0e12] text-white px-8 py-8">

            <div className="flex justify-between items-center mb-8">

                <div>
                    <h1 className="text-3xl font-bold">
                        Expired Calibrations
                    </h1>

                    <p className="text-gray-400 mt-2">
                        Equipment requiring immediate recalibration
                    </p>
                </div>

                <Link
                    to="/calibrations"
                    className="bg-gray-700 hover:bg-gray-600 px-5 py-3 rounded-lg"
                >
                    Back
                </Link>

            </div>

            <div className="bg-[#161821] rounded-xl border border-white/10 overflow-hidden">

                <table className="w-full">

                    <thead className="bg-[#1f2230]">
                        <tr>
                            <th className="p-4 text-left">Equipment</th>
                            <th className="p-4 text-left">Calibration Date</th>
                            <th className="p-4 text-left">Next Due Date</th>
                            <th className="p-4 text-left">Certificate</th>
                            <th className="p-4 text-left">Technician</th>
                            <th className="p-4 text-left">Status</th>
                        </tr>
                    </thead>

                    <tbody>

                        {records.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="6"
                                    className="text-center py-10 text-gray-400"
                                >
                                    No expired calibrations found.
                                </td>
                            </tr>

                        ) : (

                            records.map((record) => (

                                <tr
                                    key={record.id}
                                    className="border-t border-white/10 hover:bg-[#202330]"
                                >

                                    <td className="p-4">
                                        {record.equipmentName}
                                    </td>

                                    <td className="p-4">
                                        {record.calibrationDate}
                                    </td>

                                    <td className="p-4">
                                        {record.nextDueDate}
                                    </td>

                                    <td className="p-4">
                                        {record.certificateNumber}
                                    </td>

                                    <td className="p-4">
                                        {record.technicianName}
                                    </td>

                                    <td className="p-4">
                                        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
                                            EXPIRED
                                        </span>
                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
};

export default ExpiredCalibrations;