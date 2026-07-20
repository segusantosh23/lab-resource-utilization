import React, { useEffect, useState } from "react";
import calibrationService from "../../services/calibrationService";

const DueSoonCalibrations = () => {
    const [records, setRecords] = useState([]);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        try {
            const response = await calibrationService.getDueSoonCalibrations(days);
            setRecords(response.data);
        } catch (error) {
            console.error(error);
            alert("Unable to load due calibrations.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);

        try {
            const response = await calibrationService.getDueSoonCalibrations(days);
            setRecords(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d0e12] flex justify-center items-center">
                <h2 className="text-white text-xl">Loading...</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0e12] text-white px-8 py-8">

            <div className="flex justify-between items-center mb-8">

                <div>
                    <h1 className="text-3xl font-bold">
                        Due Soon Calibrations
                    </h1>

                    <p className="text-gray-400 mt-2">
                        Equipment requiring calibration soon
                    </p>
                </div>

                <div className="flex gap-3">

                    <input
                        type="number"
                        min="1"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        className="bg-[#222533] border border-gray-700 rounded-lg px-4 py-2 w-28"
                    />

                    <button
                        onClick={handleSearch}
                        className="bg-purple-600 hover:bg-purple-700 px-5 rounded-lg"
                    >
                        Search
                    </button>

                </div>

            </div>

            <div className="bg-[#161821] rounded-xl border border-white/10 overflow-hidden">

                <table className="w-full">

                    <thead className="bg-[#1f2230]">

                        <tr>
                            <th className="p-4 text-left">Equipment</th>
                            <th className="p-4 text-left">Calibration Date</th>
                            <th className="p-4 text-left">Next Due Date</th>
                            <th className="p-4 text-left">Technician</th>
                            <th className="p-4 text-left">Result</th>
                        </tr>

                    </thead>

                    <tbody>

                        {records.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="5"
                                    className="text-center py-10 text-gray-400"
                                >
                                    No due calibrations found.
                                </td>
                            </tr>

                        ) : (

                            records.map((item) => (

                                <tr
                                    key={item.id}
                                    className="border-t border-white/10 hover:bg-[#202330]"
                                >

                                    <td className="p-4">{item.equipmentName}</td>

                                    <td className="p-4">{item.calibrationDate}</td>

                                    <td className="p-4">{item.nextDueDate}</td>

                                    <td className="p-4">{item.technicianName}</td>

                                    <td className="p-4">

                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                item.result === "PASS"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"
                                            }`}
                                        >
                                            {item.result}
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

export default DueSoonCalibrations;