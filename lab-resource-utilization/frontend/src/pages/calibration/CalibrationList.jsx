import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import calibrationService from "../../services/calibrationService";
import DashboardCards from "../../components/DashboardCards";
import ConfirmationModal from "../../components/ConfirmationModal";

const CalibrationList = () => {
  const [calibrations, setCalibrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Delete Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedCalibrationId, setSelectedCalibrationId] =
    useState(null);

  // Group by equipment to get the latest calibration status for each equipment
  const latestCalibrations = useMemo(() => {
    const sorted = [...calibrations].sort(
      (a, b) => new Date(b.createdAt || b.calibrationDate) - new Date(a.createdAt || a.calibrationDate)
    );

    const map = new Map();
    for (const cal of sorted) {
      if (!map.has(cal.equipmentId)) {
        map.set(cal.equipmentId, cal);
      }
    }
    return Array.from(map.values());
  }, [calibrations]);

  // Dashboard Statistics based on current latest equipment calibration status
  const totalCount = latestCalibrations.length;
  const activeCount = latestCalibrations.filter((c) => c.status === "Active").length;
  const dueSoonCount = latestCalibrations.filter((c) => c.status === "Due Soon").length;
  const expiredCount = latestCalibrations.filter((c) => c.status === "Expired").length;
  const failedCount = latestCalibrations.filter((c) => c.status === "Failed").length;

  // Search & Filter for table display
  const groupedCalibrations = useMemo(() => {
    return latestCalibrations.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        item.equipmentName?.toLowerCase().includes(searchText) ||
        item.technicianName?.toLowerCase().includes(searchText) ||
        item.certificateNumber?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        item.result === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [latestCalibrations, search, statusFilter]);

  useEffect(() => {
    loadCalibrations();
  }, []);

  const loadCalibrations = async () => {
    try {
      const response = await calibrationService.getAllCalibrations();
      setCalibrations(response.data);
    } catch (error) {
      console.error("Error loading calibrations:", error);
      toast.error("Failed to load calibrations.");
    } finally {
      setLoading(false);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0e12] flex items-center justify-center">
        <h2 className="text-white text-xl">
          Loading...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Calibration Records
          </h1>

          <p className="text-gray-400 mt-2">
            Manage laboratory equipment calibrations
          </p>
        </div>

        <Link
          to="/calibrations/add"
          className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg transition font-semibold"
        >
          + Add Calibration
        </Link>
      </div>

      {/* Dashboard Cards */}
      <div className="mb-6">
        <DashboardCards
          total={totalCount}
          active={activeCount}
          dueSoon={dueSoonCount}
          expired={expiredCount}
          failed={failedCount}
        />
      </div>
            {/* Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search equipment, technician or certificate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#222533] text-white border border-gray-700 rounded-lg px-4 py-2 w-full md:w-96 focus:outline-none focus:border-blue-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#222533] text-white border border-gray-700 rounded-lg px-4 py-2 w-full md:w-44 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All</option>
          <option value="PASS">PASS</option>
          <option value="FAIL">FAIL</option>
        </select>
      </div>

      {/* Calibration Table */}
      <div className="bg-[#161821] rounded-xl overflow-hidden border border-white/10">
        <table className="w-full">
          <thead className="bg-[#1f2230]">
            <tr>
              <th className="p-4 text-left">Equipment</th>
              <th className="p-4 text-left">Calibration Date</th>
              <th className="p-4 text-left">Next Due</th>
              <th className="p-4 text-left">Certificate</th>
              <th className="p-4 text-left">Technician</th>
              <th className="p-4 text-left">Result</th>
              <th className="p-4 text-left">Avail / Total</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {groupedCalibrations.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="text-center text-gray-400 py-10"
                >
                  No calibration records found.
                </td>
              </tr>
            ) : (
              groupedCalibrations.map((calibration) => (
                <tr
                  key={calibration.id}
                  className="border-t border-white/10 hover:bg-[#202330]"
                >
                  <td className="p-4">
                    {calibration.equipmentName}
                  </td>

                  <td className="p-4">
                    {calibration.calibrationDate}
                  </td>

                  <td className="p-4">
                    {calibration.nextDueDate}
                  </td>

                  <td className="p-4">
                    {calibration.certificateNumber}
                  </td>

                  <td className="p-4">
                    {calibration.technicianName}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        calibration.result === "PASS"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {calibration.result}
                    </span>
                  </td>

                  {/* Avail / Total */}
                  <td className="p-4 text-sm">
                    {calibration.availableQuantity != null && calibration.quantity != null ? (
                      <span>
                        <span className={calibration.availableQuantity === 0 ? "text-red-400 font-medium" : "text-emerald-400 font-medium"}>
                          {calibration.availableQuantity}
                        </span>
                        <span className="text-gray-500"> / {calibration.quantity}</span>
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        calibration.status === "Active"
                          ? "bg-green-600 text-white"
                          : calibration.status === "Due Soon"
                          ? "bg-yellow-500 text-black"
                          : calibration.status === "Expired"
                          ? "bg-red-500 text-white"
                          : "bg-red-700 text-white"
                      }`}
                    >
                      {calibration.status}
                      {calibration.status === "Due Soon" && ` (${Math.ceil((new Date(calibration.nextDueDate) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))}d)`}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <Link
                        to={`/calibrations/history/${calibration.equipmentId}`}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm"
                      >
                        History
                      </Link>
                    </div>
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

export default CalibrationList;