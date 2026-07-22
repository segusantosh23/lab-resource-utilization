import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import calibrationService from "../../services/calibrationService";
import { getAllEquipment } from "../../services/equipmentService";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const AddCalibration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledName = location.state?.prefilledEquipment;

  const { user } = useContext(AuthContext);
  const prefilledCert = location.state?.prefilledCertificateNumber || "";
  const prefilledTech = location.state?.prefilledTechnician || user?.name || "";

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    equipmentId: "",
    calibrationDate: "",
    nextDueDate: "",
    certificateNumber: prefilledCert,
    technicianName: prefilledTech,
    result: "",
    remarks: "",
  });

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const data = await getAllEquipment();
      setEquipment(data);
      if (prefilledName) {
        const found = data.find(eq => eq.name === prefilledName);
        if (found) {
          setFormData(prev => ({ ...prev, equipmentId: found.id }));
        }
      }
    } catch (err) {
      console.error(err);
      alert("Unable to load equipment.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...formData };
      if (payload.result === "FAIL") {
        payload.nextDueDate = null;
      }
      
      await calibrationService.addCalibration(payload);
      toast.success("Calibration added successfully!");

      const maintenanceReqId = location.state?.maintenanceRequestId;
      if (maintenanceReqId) {
        await fetch(
          `http://localhost:8081/api/maintenance/${maintenanceReqId}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "Completed" }),
          }
        );
      }

      navigate("/calibrations");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add calibration.");
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

      <div className="max-w-3xl mx-auto bg-[#161821] rounded-xl border border-white/10 p-8">

        <h1 className="text-3xl font-bold mb-8">
          Add Calibration
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block mb-2">Equipment</label>

            <select
              name="equipmentId"
              value={formData.equipmentId}
              onChange={handleChange}
              required
              className="w-full bg-[#222533] border border-gray-700 rounded-lg p-3"
            >
              <option value="">Select Equipment</option>

              {equipment.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}

            </select>
          </div>

          <div>
            <label className="block mb-2">Result</label>

            <select
              name="result"
              value={formData.result}
              onChange={handleChange}
              required
              className="w-full bg-[#222533] border border-gray-700 rounded-lg p-3"
            >
              <option value="">Select Result</option>
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Calibration Date</label>

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
            <label className="block mb-2">Next Due Date</label>

            <input
              type="date"
              name="nextDueDate"
              value={formData.result === "FAIL" ? "" : formData.nextDueDate}
              onChange={handleChange}
              disabled={formData.result === "FAIL"}
              required={formData.result !== "FAIL"}
              className={`w-full bg-[#222533] border border-gray-700 rounded-lg p-3 ${
                formData.result === "FAIL" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
          </div>

          <div>
            <label className="block mb-2">Certificate Number</label>

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
            <label className="block mb-2">Technician Name</label>

            <input
              type="text"
              name="technicianName"
              value={formData.technicianName}
              onChange={handleChange}
              readOnly
              required
              className="w-full bg-[#222533] border border-gray-700 rounded-lg p-3 text-gray-400 cursor-not-allowed"
            />
          </div>


          <div>
            <label className="block mb-2">Remarks</label>

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
              Save
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

export default AddCalibration;