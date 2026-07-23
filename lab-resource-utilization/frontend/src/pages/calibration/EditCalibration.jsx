import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import calibrationService from "../../services/calibrationService";
import { getAllEquipment } from "../../services/equipmentService";
import { toast } from "react-toastify";

const EditCalibration = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [equipmentList, setEquipmentList] = useState([]);

    const [formData, setFormData] = useState({
        equipmentId: "",
        calibrationDate: "",
        nextDueDate: "",
        certificateNumber: "",
        technicianName: "",
        result: "PASS",
        remarks: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const equipment = await getAllEquipment();
            setEquipmentList(equipment);

            const response = await calibrationService.getCalibrationById(id);

            setFormData({
                equipmentId: response.data.equipmentId,
                calibrationDate: response.data.calibrationDate,
                nextDueDate: response.data.nextDueDate,
                certificateNumber: response.data.certificateNumber,
                technicianName: response.data.technicianName,
                result: response.data.result,
                remarks: response.data.remarks || ""
            });
        } catch (error) {
            console.error(error);
            alert("Unable to load calibration.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await calibrationService.updateCalibration(id, formData);
            toast.success("Calibration updated successfully!");

navigate("/calibrations");
        } catch (error) {
            console.error(error);
            toast.error("Unable to update calibration.");
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

            <div className="max-w-3xl mx-auto bg-[#161821] border border-white/10 rounded-xl p-8">

                <h1 className="text-3xl font-bold mb-8">
                    Edit Calibration
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block mb-2">
                            Equipment
                        </label>

                        <select
                            name="equipmentId"
                            value={formData.equipmentId}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#222533] border border-gray-700 rounded-lg p-3"
                        >
                            <option value="">Select Equipment</option>

                            {equipmentList.map((equipment) => (
                                <option
                                    key={equipment.id}
                                    value={equipment.id}
                                >
                                    {equipment.name}
                                </option>
                            ))}

                        </select>
                    </div>

                    <div>
                        <label className="block mb-2">
                            Calibration Date
                        </label>

                        <input
                            type="date"
                            name="calibrationDate"
                            value={formData.calibrationDate}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#222533] border border-gray-700 rounded-lg p-3"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">
                            Next Due Date
                        </label>

                        <input
                            type="date"
                            name="nextDueDate"
                            value={formData.nextDueDate}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#222533] border border-gray-700 rounded-lg p-3"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">
                            Certificate Number
                        </label>

                        <input
                            type="text"
                            name="certificateNumber"
                            value={formData.certificateNumber}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#222533] border border-gray-700 rounded-lg p-3"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">
                            Technician Name
                        </label>

                        <input
                            type="text"
                            name="technicianName"
                            value={formData.technicianName}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#222533] border border-gray-700 rounded-lg p-3"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">
                            Result
                        </label>

                        <select
                            name="result"
                            value={formData.result}
                            onChange={handleChange}
                            className="w-full bg-[#222533] border border-gray-700 rounded-lg p-3"
                        >
                            <option value="PASS">PASS</option>
                            <option value="FAIL">FAIL</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2">
                            Remarks
                        </label>

                        <textarea
                            rows="4"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            className="w-full bg-[#222533] border border-gray-700 rounded-lg p-3"
                        />
                    </div>

                    <div className="flex gap-4">

                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold"
                        >
                            Update Calibration
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/calibrations")}
                            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default EditCalibration;