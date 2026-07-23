import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const MaintenanceRequestForm = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    equipment: "",
    description: "",
    priority: "Low",
    technician: "",
    quantity: "",
  });

  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(0);
  const [technicians, setTechnicians] = useState([]);

  const options = ["Low", "Medium", "High"];

  // Lock body scroll for this page
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

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

  // Basic validation
  const isValid =
    form.equipment &&
    form.description &&
    form.technician &&
    form.quantity > 0 &&
    (selectedEquipment ? form.quantity <= selectedEquipment.quantity : true);

  return (
    <div className="page-no-scroll flex items-center justify-center bg-[#020617] text-white">
      <div className="w-full max-w-[600px] px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-left whitespace-nowrap">
            Submit Maintenance Request
          </h2>
          
          <button
            onClick={() => navigate("/maintenance")}
            className="w-[88px] flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] transition text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0f172a] p-5 rounded-xl border border-gray-700 space-y-4 shadow-lg"
        >
          {/* Equipment Dropdown */}
          <EquipmentDropdown
            value={form.equipment}
            onChange={(val, eq) => {
              setForm({ ...form, equipment: val, quantity: "" });
              setSelectedEquipment(eq);
            }}
            error={errors.equipment}
          />

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm">Description</label>
            <textarea
              rows="3"
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

          <div className="flex gap-4">
            {/* Priority */}
            <div className="relative flex-1" ref={dropdownRef}>
            <label className="block mb-2 text-sm">Priority</label>
            <button
              type="button"
              onClick={() => {
                setOpen(!open);
                setHoverIndex(0);
              }}
              className="w-full p-3 rounded-lg border border-gray-600 bg-[#0f172a] text-white text-left flex items-center justify-between"
            >
              <span>{form.priority}</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
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

            {/* Quantity */}
            <div className="flex-1">
              <label className="block mb-2 text-sm">
                Quantity
                {selectedEquipment && (
                  <span className="ml-2 text-gray-400 text-xs">(Max: {selectedEquipment.quantity})</span>
                )}
              </label>
              <input
                type="number"
                min="1"
                max={selectedEquipment ? selectedEquipment.quantity : ""}
                className="w-full p-3 rounded-lg border border-gray-600 bg-[#0f172a] text-white focus:border-purple-500 focus:outline-none"
                value={form.quantity}
                onChange={(e) => {
                  let rawVal = e.target.value;
                  if (rawVal === "") {
                    setForm({ ...form, quantity: "" });
                    return;
                  }
                  let val = parseInt(rawVal);
                  if (isNaN(val)) return;
                  const maxQty = selectedEquipment ? selectedEquipment.quantity : Infinity;
                  
                  setForm({
                    ...form,
                    quantity: Math.min(Math.max(1, val), maxQty),
                  });
                }}
              />
            </div>
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

/* ── Equipment Dropdown Component ── */
const EquipmentDropdown = ({ value, onChange, error }) => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [search, setSearch] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Fetch equipment from API
  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      try {
        const res = await api.get("/equipment");
        const data = res.data;
        setEquipmentList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching equipment:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const isExactMatch = equipmentList.some(eq => (eq.name || "") === search);

  const filtered = equipmentList.filter((eq) => {
    if (eq.status !== "AVAILABLE") return false;
    if (isExactMatch) return true;
    return (eq.name || "").toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = (eq) => {
    const name = eq.name || "";
    setSearch(name);
    onChange(name, eq);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef}>
      <label className="block mb-2 text-sm">Equipment</label>
      <div className="relative">
        <input
          type="text"
          placeholder="Search or select equipment..."
          className="w-full p-3 bg-[#0f172a] text-white border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none pr-10"
          value={search}
          onChange={(e) => {
            const val = e.target.value;
            setSearch(val);
            const foundEq = equipmentList.find(eq => (eq.name || "").toLowerCase() === val.toLowerCase());
            onChange(val, foundEq || null);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {/* Chevron icon */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown list */}
        {isOpen && (
          <ul className="absolute z-20 w-full mt-1 bg-[#1e293b] border border-gray-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
            {loading ? (
              <li className="px-4 py-3 text-gray-400 text-sm">Loading equipment...</li>
            ) : filtered.length === 0 ? (
              <li className="px-4 py-3 text-gray-400 text-sm">No equipment found</li>
            ) : (
              filtered.map((eq, idx) => {
                const name = eq.name || eq.equipmentName || "";
                return (
                  <li
                    key={eq.id || idx}
                    onClick={() => handleSelect(eq)}
                    className="px-4 py-2.5 cursor-pointer text-sm hover:bg-purple-700 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                    {name}
                    {eq.status && (
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                        eq.status === "AVAILABLE"
                          ? "bg-green-900 text-green-300"
                          : "bg-yellow-900 text-yellow-300"
                      }`}>
                        {eq.status}
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default MaintenanceRequestForm;