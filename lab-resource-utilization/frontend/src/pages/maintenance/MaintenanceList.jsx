import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const MaintenanceList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = useState([]);

  // 🔌 Fetch function
  const fetchData = () => {
    fetch("http://localhost:8081/api/maintenance")
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch((err) => console.error(err));
  };

  // ✅ Initial load + refresh on navigation
  useEffect(() => {
    fetchData();
  }, [location.state?.refresh]);

  // 🎨 Status Color Styling
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-500/20 text-gray-400";
    if (status === "Pending") return "bg-yellow-500/20 text-yellow-400";
    if (status === "In Progress") return "bg-blue-500/20 text-blue-400";
    if (status === "Completed") return "bg-green-500/20 text-green-400";
  };

  const getPriorityColor = (priority) => {
    if (priority === "High") return "text-red-400";
    if (priority === "Medium") return "text-yellow-400";
    if (priority === "Low") return "text-green-400";
  };

  return (
    <div className="p-6 text-white">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Maintenance Requests</h2>
          <p className="text-gray-400 text-sm">
            Manage equipment maintenance and work orders
          </p>
        </div>

        <button
          onClick={() => navigate("/maintenance/request")}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
        >
          + Create Request
        </button>
      </div>

      {/* GRID CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {requests.map((req) => (
          <div
            key={req.id}
            onClick={() => navigate(`/maintenance/${req.id}`)}
            className="cursor-pointer bg-[#0f172a] border border-gray-700 rounded-xl p-5 
                       hover:border-purple-500 hover:shadow-lg transition 
                       h-[180px] flex flex-col justify-between"
          >
            {/* TOP */}
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{req.equipment}</h3>
              <span className="text-xs text-gray-400">ID: {req.id}</span>
            </div>

            {/* MIDDLE */}
            <div className="mt-2 space-y-1 text-sm">
              <div className="text-gray-400 text-xs italic truncate mb-1">
                {req.description || "No description provided"}
              </div>

              <div>
                Status:{" "}
                <span
                  className={`px-2 py-1 rounded text-xs ${getStatusColor(
                    req.status
                  )}`}
                >
                  {req.status || "Unknown"}
                </span>
              </div>

              <div>
                Priority:{" "}
                <span className={getPriorityColor(req.priority)}>
                  {req.priority}
                </span>
              </div>

              <div>
                Tech:{" "}
                <span className="text-gray-300">
                  {req.technician || "Not Assigned"}
                </span>
              </div>
            </div>

            {/* FOOTER */}
            <div className="text-right text-xs text-gray-500">
              Click to view details →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceList;