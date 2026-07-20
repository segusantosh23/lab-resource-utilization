import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const MaintenanceRequestForm = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    equipment: "",
    description: "",
    priority: "Low",
    technician: "",
  });

  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(0);
  const [technicians, setTechnicians] = useState([]);

  const options = ["Low", "Medium", "High"];

  // Close priority dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load Technicians
  useEffect(() => {
    fetch("http://localhost:8081/api/maintenance/technicians", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setTechnicians(data))
      .catch((err) => console.error("Error fetching technicians:", err));
  }, []);

  const validate = () => {
    let newErrors = {};

    if (!form.equipment)
      newErrors.equipment = "Equipment is required";

    if (!form.description.trim())
      newErrors.description = "Description is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    await fetch("http://localhost:8081/api/maintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(form),
    });

    navigate("/maintenance", {
      state: { refresh: true },
    });
  };

  const isValid =
    form.equipment &&
    form.description &&
    form.technician;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="w-full max-w-lg px-4">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Submit Maintenance Request
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0f172a] p-6 rounded-xl border border-gray-700 space-y-5 shadow-lg"
        >
          {/* Equipment */}
          <div>
            <label className="block mb-2 text-sm">Equipment</label>
            <input
              type="text"
              placeholder="Enter Equipment Name"
              className="w-full p-3 bg-[#0f172a] text-white border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none"
              value={form.equipment}
              onChange={(e) =>
                setForm({ ...form, equipment: e.target.value })
              }
            />
            {errors.equipment && (
              <p className="text-red-400 text-xs mt-1">
                {errors.equipment}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm">Description</label>
            <textarea
              rows="4"
              placeholder="Describe the issue"
              className="w-full p-3 bg-[#0f172a] text-white border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => {
                setOpen(!open);
                setHoverIndex(0);
              }}
              className="w-full p-3 rounded-lg border border-gray-600 bg-[#0f172a] text-white text-left"
            >
              {form.priority}
            </button>

            {open && (
              <ul className="absolute w-full mt-1 bg-[#0f172a] border border-gray-700 rounded-lg shadow-lg z-10">
                {options.map((item, index) => (
                  <li
                    key={item}
                    onMouseEnter={() => setHoverIndex(index)}
                    onClick={() => {
                      setForm({
                        ...form,
                        priority: item,
                      });
                      setOpen(false);
                    }}
                    className={`px-4 py-2 cursor-pointer ${
                      hoverIndex === index
                        ? "bg-purple-700"
                        : ""
                    }`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Technician */}
          <div>
            <label className="block mb-2 text-sm">
              Assign Technician
            </label>

            <select
              className="w-full p-3 bg-[#0f172a] text-white border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none"
              value={form.technician}
              onChange={(e) =>
                setForm({
                  ...form,
                  technician: e.target.value,
                })
              }
            >
              <option value="">Select Technician</option>

              {technicians.map((tech) => (
                <option key={tech.id} value={tech.name}>
                  {tech.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-3 rounded-lg font-medium ${
              isValid
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceRequestForm;