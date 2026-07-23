import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";

/* ── Constants ───────────────────────────────────────────────── */
const ALL_STATUSES  = ["Pending", "In Progress", "Completed"];
const ALL_PRIORITIES = ["Low", "Medium", "High"];

const STATUS_STYLES = {
  "Pending":     "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  "In Progress": "bg-blue-500/15  text-blue-400  border-blue-500/30",
  "Completed":   "bg-green-500/15 text-green-400 border-green-500/30",
};

const PRIORITY_STYLES = {
  "Low":    "bg-green-500/15 text-green-400 border-green-500/30",
  "Medium": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  "High":   "bg-red-500/15   text-red-400   border-red-500/30",
};

/* ── Component ───────────────────────────────────────────────── */
const MaintenanceList = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [requests,       setRequests]       = useState([]);
  const [filtered,       setFiltered]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [equipmentList,  setEquipmentList]  = useState([]);

  /* filters */
  const [equipFilter,    setEquipFilter]    = useState("");
  const [statusFilter,   setStatusFilter]   = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [techFilter,     setTechFilter]     = useState("");
  const [sortOrder,      setSortOrder]      = useState("newest");

  /* ── Fetch maintenance ── */
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/maintenance");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load maintenance requests.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Fetch equipment list for dropdown ── */
  useEffect(() => {
    api.get("/equipment")
      .then(res => setEquipmentList(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Equipment fetch error:", err));
  }, []);

  useEffect(() => { fetchData(); }, [location.state?.refresh]);

  /* ── Client-side filter + sort ── */
  useEffect(() => {
    let result = [...requests];

    if (equipFilter) {
      result = result.filter(r =>
        r.equipment?.toLowerCase().includes(equipFilter.toLowerCase())
      );
    }

    if (statusFilter)   result = result.filter(r => r.status   === statusFilter);
    if (priorityFilter) result = result.filter(r => r.priority === priorityFilter);
    if (techFilter)     result = result.filter(r => (r.technician || "").toLowerCase().includes(techFilter.toLowerCase()));

    result.sort((a, b) => {
      if (sortOrder === "newest") return b.id - a.id;
      if (sortOrder === "oldest") return a.id - b.id;
      if (sortOrder === "priority") {
        const order = { High: 0, Medium: 1, Low: 2 };
        return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
      }
      return 0;
    });

    setFiltered(result);
  }, [requests, equipFilter, statusFilter, priorityFilter, techFilter, sortOrder]);

  const clearFilters = () => {
    setEquipFilter("");
    setStatusFilter("");
    setPriorityFilter("");
    setTechFilter("");
    setSortOrder("newest");
  };

  const hasActiveFilters = equipFilter || statusFilter || priorityFilter || techFilter || sortOrder !== "newest";

  /* ── Stats ── */
  const stats = ALL_STATUSES.map(s => ({
    label: s,
    count: requests.filter(r => r.status === s).length,
    style: STATUS_STYLES[s],
  })).filter(s => s.count > 0);

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance Requests</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Manage equipment maintenance and work orders
            </p>
          </div>
          <button
            onClick={() => navigate("/maintenance/request")}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-lg shadow-purple-900/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Request
          </button>
        </div>

        {/* ── Stat Badges ── */}
        {!loading && !error && stats.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {stats.map(s => (
              <button
                key={s.label}
                onClick={() => setStatusFilter(prev => prev === s.label ? "" : s.label)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all
                  ${s.style}
                  ${statusFilter === s.label ? "ring-2 ring-white/25 scale-105" : ""}`}
              >
                {s.label} · {s.count}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-500 self-center">
              {filtered.length} of {requests.length} records
            </span>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-end gap-3">

            {/* Equipment Dropdown */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs text-gray-500 mb-1">Equipment</label>
              <select
                value={equipFilter}
                onChange={e => setEquipFilter(e.target.value)}
                className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="">All Equipment</option>
                {equipmentList.map(eq => (
                  <option key={eq.id} value={eq.name}>{eq.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="">All Statuses</option>
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-gray-500 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="">All Priorities</option>
                {ALL_PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs text-gray-500 mb-1">Sort By</label>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority (High → Low)</option>
              </select>
            </div>

            {/* Technician */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs text-gray-500 mb-1">Technician</label>
              <select
                value={techFilter}
                onChange={e => setTechFilter(e.target.value)}
                className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="">All Technicians</option>
                {[...new Set(requests.map(r => r.technician).filter(Boolean))].sort().map(tech => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <div className="flex-shrink-0">
                <label className="block text-xs text-transparent mb-1">-</label>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-sm transition whitespace-nowrap"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── States ── */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-400">Loading requests…</span>
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-400">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-400 text-lg">No maintenance requests found</p>
            <p className="text-gray-600 text-sm mt-1">
              {hasActiveFilters ? "Try adjusting your filters" : "Create your first request to get started"}
            </p>
          </div>
        )}

        {/* ── Cards Grid ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((req) => (
              <div
                key={req.id}
                onClick={() => navigate(`/maintenance/${req.id}`)}
                className="cursor-pointer bg-[#0f172a] border border-gray-700/60 rounded-xl p-5
                           hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-900/10
                           transition-all duration-200 group"
              >
                {/* Card Top */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-semibold group-hover:text-purple-300 transition-colors line-clamp-1 pr-2">
                    {req.equipment || "—"}
                  </h3>
                  <span className="text-xs text-gray-500 shrink-0">#{req.id}</span>
                </div>

                {/* Description */}
                {req.description && (
                  <p className="text-xs text-gray-500 italic mb-3 line-clamp-2">
                    {req.description}
                  </p>
                )}

                {/* Badges row */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 text-xs rounded-full border font-medium
                    ${STATUS_STYLES[req.status] || "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}>
                    {req.status || "Unknown"}
                  </span>
                  {req.priority && (
                    <span className={`px-2.5 py-0.5 text-xs rounded-full border font-medium
                      ${PRIORITY_STYLES[req.priority] || "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}>
                      {req.priority}
                    </span>
                  )}
                </div>

                {/* Technician */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{req.technician || "Not Assigned"}</span>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-end">
                  <span className="text-xs text-gray-600 group-hover:text-purple-400 transition-colors">
                    View details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceList;