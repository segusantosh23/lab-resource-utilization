import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const WorkOrderDetails = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);

  // Fetch work order
  useEffect(() => {
    fetch(`http://localhost:8081/api/maintenance/${id}`)
      .then((res) => res.json())
      .then((data) => setRequest(data))
      .catch((err) => console.error(err));
  }, [id]);

  // Update status
  const updateStatus = async (status) => {
    const res = await fetch(
      `http://localhost:8081/api/maintenance/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    if (status === "Completed") {
      await res.text();
      window.location.replace("/maintenance");
      return;
    }

    const data = await res.json();
    setRequest(data);
  };

  if (!request) {
    return <div className="text-white p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex justify-center px-4 py-10 text-white">
      <div className="w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6">
          Work Order Details
        </h2>

        <div className="bg-[#0f172a] border border-gray-700 rounded-xl p-6 shadow-md space-y-5">

          <div>
            <p className="text-sm text-gray-400 mb-1">Equipment</p>
            <p className="text-lg font-medium">{request.equipment}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Status</p>
            <p className="text-yellow-400 font-medium">{request.status}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Technician</p>
            <p className="text-gray-300">
              {request.technician || "Not Assigned"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Request ID</p>
            <p className="text-gray-400 text-sm">{request.id}</p>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={() => updateStatus("In Progress")}
              className="w-full bg-yellow-500 hover:bg-yellow-600 py-3 rounded-lg font-medium"
            >
              Start Work
            </button>

            <button
              onClick={() => updateStatus("Completed")}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium"
            >
              Complete Work
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WorkOrderDetails;