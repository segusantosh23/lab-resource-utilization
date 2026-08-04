import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { getProfile } from "../../services/profileService";
import {
    generatePDFReport,
    generateExcelReport
} from "../../utils/reportGenerator";

const UsersReport = () => {
    const { user } = useContext(AuthContext);

    const [profile, setProfile] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [roleFilter, setRoleFilter] = useState("ALL");
    const [departmentFilter, setDepartmentFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            try {
                const [profileData, usersRes] = await Promise.all([
                    getProfile().catch(err => {
                        console.error(err);
                        return null;
                    }),
                    api.get("/users").catch(() => ({ data: [] }))
                ]);

                if (profileData) {
                    setProfile(profileData);
                }

                setUsersList(usersRes.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user]);

    const departments = [
        "ALL",
        ...new Set(usersList.map(u => u.department).filter(Boolean))
    ];

    const roles = [
        "ALL",
        "RESEARCHER",
        "LAB_TECHNICIAN",
        "LAB_MANAGER",
        "DEPARTMENT_HEAD",
        "INSTITUTION_ADMIN",
        "SYSTEM_ADMIN"
    ];

    const filteredUsers = useMemo(() => {
        return usersList.filter(u => {
            const searchOk =
                !search ||
                (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
                (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
                (u.universityId || "").toLowerCase().includes(search.toLowerCase()) ||
                String(u.id || "").includes(search);

            const roleOk = roleFilter === "ALL" || u.role === roleFilter;
            const deptOk = departmentFilter === "ALL" || u.department === departmentFilter;

            return searchOk && roleOk && deptOk;
        });
    }, [usersList, search, roleFilter, departmentFilter]);

    const summary = {
        "Total Users": usersList.length,
        "Researchers": usersList.filter(u => u.role === "RESEARCHER").length,
        "Lab Technicians": usersList.filter(u => u.role === "LAB_TECHNICIAN").length,
        "Admins & Managers": usersList.filter(u => u.role !== "RESEARCHER" && u.role !== "LAB_TECHNICIAN").length
    };

    const roleName = (user?.role || "USER").replace(/_/g, " ");
    const reportTitle = `${roleName} Users Report`;

    const handlePDF = () => {
        generatePDFReport({
            title: reportTitle,
            user: profile || user,
            summary,
            filters: {
                roleFilter,
                departmentFilter,
                search
            },
            columns: [
                "ID",
                "Name",
                "Email",
                "University ID",
                "Role",
                "Department",
                "Institution"
            ],
            rows: filteredUsers.map(u => [
                u.id,
                u.name,
                u.email,
                u.universityId || "-",
                u.role ? u.role.replace(/_/g, ' ') : "-",
                u.department || "-",
                u.institution || "-"
            ])
        });
    };

    const handleExcel = () => {
        generateExcelReport({
            title: reportTitle,
            user: profile || user,
            summary,
            filters: {
                roleFilter,
                departmentFilter,
                search
            },
            columns: [
                "ID",
                "Name",
                "Email",
                "University ID",
                "Role",
                "Department",
                "Institution"
            ],
            rows: filteredUsers.map(u => [
                u.id,
                u.name,
                u.email,
                u.universityId || "-",
                u.role ? u.role.replace(/_/g, ' ') : "-",
                u.department || "-",
                u.institution || "-"
            ])
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d0e12] flex justify-center items-center text-white">
                Loading Users Report...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0e12] text-white p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold">Users Report</h1>
                <p className="text-gray-400 mt-2">
                    Generate registered user account reports and role distributions.
                </p>

                {/* Summary */}
                <div className="grid md:grid-cols-4 gap-5 mt-8">
                    <div className="bg-[#15171f] rounded-xl p-5">
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <h2 className="text-3xl mt-2 font-bold text-purple-400">
                            {summary["Total Users"]}
                        </h2>
                    </div>
                    <div className="bg-[#15171f] rounded-xl p-5">
                        <p className="text-gray-400 text-sm">Researchers</p>
                        <h2 className="text-3xl mt-2 font-bold text-blue-400">
                            {summary["Researchers"]}
                        </h2>
                    </div>
                    <div className="bg-[#15171f] rounded-xl p-5">
                        <p className="text-gray-400 text-sm">Lab Technicians</p>
                        <h2 className="text-3xl mt-2 font-bold text-green-400">
                            {summary["Lab Technicians"]}
                        </h2>
                    </div>
                    <div className="bg-[#15171f] rounded-xl p-5">
                        <p className="text-gray-400 text-sm">Admins & Managers</p>
                        <h2 className="text-3xl mt-2 font-bold text-yellow-400">
                            {summary["Admins & Managers"]}
                        </h2>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-[#15171f] rounded-xl mt-8 p-6">
                    <div className="grid md:grid-cols-4 gap-5">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3 text-white border border-white/10"
                        >
                            {roles.map((r) => (
                                <option key={r} value={r}>
                                    {r === "ALL" ? "All Roles" : r.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3 text-white border border-white/10"
                        >
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                        <input
                            placeholder="Search by name, email, ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-[#0d0e12] rounded-lg p-3 text-white border border-white/10 md:col-span-2"
                        />
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={() => {
                                setRoleFilter("ALL");
                                setDepartmentFilter("ALL");
                                setSearch("");
                            }}
                            className="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition font-medium"
                        >
                            Clear Filters
                        </button>

                        <div className="flex gap-4">
                            <button
                                onClick={handlePDF}
                                className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold transition"
                            >
                                📄 Generate PDF
                            </button>
                            <button
                                onClick={handleExcel}
                                className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold transition"
                            >
                                📊 Export Excel
                            </button>
                        </div>
                    </div>

                    <div className="mt-10">
                        <h2 className="text-2xl font-bold">User Accounts Preview</h2>
                        <p className="text-gray-400 mt-2 mb-6">
                            Showing {filteredUsers.length} of {usersList.length} registered users
                        </p>

                        <div className="overflow-x-auto rounded-xl border border-white/10">
                            <table className="min-w-full">
                                <thead className="bg-[#1b1d26]">
                                    <tr>
                                        <th className="text-left p-4">ID</th>
                                        <th className="text-left p-4">Name</th>
                                        <th className="text-left p-4">Email</th>
                                        <th className="text-left p-4">University ID</th>
                                        <th className="text-left p-4">Role</th>
                                        <th className="text-left p-4">Department</th>
                                        <th className="text-left p-4">Institution</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center p-10 text-gray-400">
                                                No user accounts found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((record) => (
                                            <tr key={record.id} className="border-t border-white/10 hover:bg-white/5 transition">
                                                <td className="p-4">{record.id}</td>
                                                <td className="p-4 font-semibold">{record.name}</td>
                                                <td className="p-4">{record.email}</td>
                                                <td className="p-4">{record.universityId || "-"}</td>
                                                <td className="p-4">
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-purple-500/20 text-purple-300">
                                                        {record.role ? record.role.replace(/_/g, ' ') : "-"}
                                                    </span>
                                                </td>
                                                <td className="p-4">{record.department || "-"}</td>
                                                <td className="p-4">{record.institution || "-"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersReport;
