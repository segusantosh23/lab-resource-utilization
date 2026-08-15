import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import calibrationService from "../../services/calibrationService";
import api from "../../services/api";

const WorkOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [calibrationRecord, setCalibrationRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(AuthContext);

  const isTechnician = user?.role === "LAB_TECHNICIAN";

  // Lock body scroll for this page
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Fetch work order
  useEffect(() => {
    api.get(`/api/maintenance/${id}`)
      .then(async (res) => {
        const data = res.data;
        setRequest(data);
        if (data.status === "Completed") {
          try {
            const calRes = await calibrationService.getAllCalibrations();
            const found = calRes.data.find(c => c.certificateNumber?.includes(`CERT-REQ-${id}-`));
            if (found) {
              setCalibrationRecord(found);
            }
          } catch (err) {
            console.error(err);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  // Update status
  const updateStatus = async (status) => {
    if (status === "Completed") {
      const generatedCert = `CERT-REQ-${request.id}-${Math.floor(1000 + Math.random() * 9000)}`;
      navigate("/calibrations/add", { 
        state: { 
          prefilledEquipment: request.equipment,
          prefilledCertificateNumber: generatedCert,
          prefilledTechnician: request.technician,
          maintenanceRequestId: request.id
        } 
      });
      return;
    }

    try {
      const res = await api.put(`/api/maintenance/${id}/status`, { status });
      setRequest(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!request) {
    return <div className="text-white p-6">Loading...</div>;
  }

  const isPending    = request.status === "Pending";
  const isInProgress = request.status === "In Progress";
  const isCompleted  = request.status === "Completed";

  const statusColor =
    isPending    ? "text-yellow-400" :
    isInProgress ? "text-blue-400"   :
    isCompleted  ? "text-green-400"  : "text-gray-400";

  return (
    <div className="page-no-scroll flex justify-center items-center px-4 text-white">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Work Order Details</h2>
          <button
            onClick={() => navigate("/maintenance")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] transition text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <div className="bg-[#0f172a] border border-gray-700 rounded-xl p-6 shadow-md space-y-6">

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Equipment</p>
              <p className="text-lg font-medium">{request.equipment}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Status</p>
              <p className={`font-medium ${statusColor}`}>{request.status}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Priority</p>
              <p className="font-medium text-white">{request.priority}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Quantity</p>
              <p className="font-medium text-white">{request.quantity}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Technician</p>
              <p className="text-gray-300">{request.technician || "Not Assigned"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Request ID</p>
              <p className="text-gray-400 text-sm">{request.id}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Description</p>
            <p className="text-gray-300 break-words bg-[#1e293b] p-3 rounded-lg border border-gray-600/50">
              {request.description}
            </p>
          </div>

          {isTechnician && !isCompleted && (
            <div className="pt-4 flex flex-col gap-3">
              {/* Start Work — only active when Pending */}
              <button
                onClick={() => updateStatus("In Progress")}
                disabled={!isPending}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  isPending
                    ? "bg-yellow-500 hover:bg-yellow-600 cursor-pointer"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                }`}
              >
                Start Work
              </button>

              {/* Complete Work — only active when In Progress */}
              <button
                onClick={() => updateStatus("Completed")}
                disabled={!isInProgress}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  isInProgress
                    ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                }`}
              >
                Complete Work
              </button>
            </div>
          )}

          {isCompleted && (
            <div className="pt-4 flex flex-col gap-3">
              {calibrationRecord ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-3 rounded-lg font-medium transition-all bg-blue-600 hover:bg-blue-700 cursor-pointer text-white shadow-lg shadow-blue-500/20"
                >
                  View Calibration Record
                </button>
              ) : isTechnician ? (
                <button
                  onClick={() => updateStatus("Completed")}
                  className="w-full py-3 rounded-lg font-medium transition-all bg-purple-600 hover:bg-purple-700 cursor-pointer text-white shadow-lg shadow-purple-500/20"
                >
                  Add Missing Calibration Record
                </button>
              ) : null}
            </div>
          )}

        </div>
      </div>
      
      {/* Details Modal */}
      {showModal && calibrationRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#161821] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">Calibration Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Certificate Number</p>
                  <p className="font-mono text-purple-400">{calibrationRecord.certificateNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Equipment ID</p>
                  <p>{calibrationRecord.equipmentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Calibration Date</p>
                  <p>{calibrationRecord.calibrationDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Next Due Date</p>
                  <p>{calibrationRecord.nextDueDate || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Technician</p>
                  <p>{calibrationRecord.technicianName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Result</p>
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${calibrationRecord.result === 'PASS' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {calibrationRecord.result}
                  </span>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-gray-400 mb-1">Remarks</p>
                <p className="bg-[#1f2230] p-3 rounded-lg text-sm border border-white/5">
                  {calibrationRecord.remarks || "No remarks provided."}
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors cursor-pointer"
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

export default WorkOrderDetails;