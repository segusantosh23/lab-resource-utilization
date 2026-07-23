import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import calibrationService from "../../services/calibrationService";

const CalibrationHistory = () => {
  const { equipmentId } = useParams();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await calibrationService.getCalibrationHistory(equipmentId);
      setHistory(response.data);
    } catch (error) {
      console.error(error);
      alert("Unable to load calibration history.");
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
            Calibration History
          </h1>

          <p className="text-gray-400 mt-2">
            Equipment ID : {equipmentId}
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

              <th className="p-4 text-left">Calibration Date</th>
              <th className="p-4 text-left">Next Due</th>
              <th className="p-4 text-left">Certificate</th>
              <th className="p-4 text-left">Technician</th>
              <th className="p-4 text-left">Result</th>
              <th className="p-4 text-left">Remarks</th>
              <th className="p-4 text-center">Actions</th>

            </tr>

          </thead>

          <tbody>

            {history.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="text-center text-gray-400 py-10"
                >
                  No calibration history found.
                </td>

              </tr>

            ) : (

              history.map((record) => (

                <tr
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="border-t border-white/10 hover:bg-[#202330] cursor-pointer transition-colors"
                >

                  <td className="p-4">
                    {record.calibrationDate}
                  </td>

                  <td className="p-4">
                    {record.nextDueDate}
                  </td>

                  <td className="p-4">
                    <span className="font-mono text-purple-400">
                      {record.certificateNumber}
                    </span>
                  </td>

                  <td className="p-4">
                    {record.technicianName}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        record.result === "PASS"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {record.result}
                    </span>

                  </td>

                  <td className="p-4">
                    {record.remarks || "-"}
                  </td>
                  
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <Link
                        to={`/calibrations/edit/${record.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded-md text-sm"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#161821] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">Calibration Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Certificate Number</p>
                  <p className="font-mono text-purple-400">{selectedRecord.certificateNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Equipment ID</p>
                  <p>{equipmentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Calibration Date</p>
                  <p>{selectedRecord.calibrationDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Next Due Date</p>
                  <p>{selectedRecord.nextDueDate || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Technician</p>
                  <p>{selectedRecord.technicianName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Result</p>
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${selectedRecord.result === 'PASS' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {selectedRecord.result}
                  </span>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-gray-400 mb-1">Remarks</p>
                <p className="bg-[#1f2230] p-3 rounded-lg text-sm border border-white/5">
                  {selectedRecord.remarks || "No remarks provided."}
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setSelectedRecord(null)}
                className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CalibrationHistory;