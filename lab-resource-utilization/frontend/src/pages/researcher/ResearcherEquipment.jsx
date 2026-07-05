import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const ResearcherEquipment = () => {

    const navigate = useNavigate();

    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {

        fetchEquipment();

    }, []);

    const fetchEquipment = async () => {

        try {

            const response = await api.get("/equipment");

            setEquipment(response.data);

        } catch (error) {

            console.error("Unable to load equipment.", error);

        } finally {

            setLoading(false);

        }

    };

    const filteredEquipment = equipment.filter(item => {

        const matchesSearch =

            item.name.toLowerCase().includes(search.toLowerCase()) ||

            item.category.toLowerCase().includes(search.toLowerCase()) ||

            (item.department || "").toLowerCase().includes(search.toLowerCase());

        const matchesStatus =

            statusFilter === "ALL" ||

            item.status === statusFilter;

        return matchesSearch && matchesStatus;

    });

    const totalEquipment = equipment.length;

    const available = equipment.filter(
        e => e.status === "AVAILABLE"
    ).length;

    const booked = equipment.filter(
        e => e.status === "BOOKED"
    ).length;

    const maintenance = equipment.filter(
        e => e.status === "UNDER_MAINTENANCE"
    ).length;

    if (loading) {

        return (

            <div className="min-h-screen bg-[#0d0e12] flex justify-center items-center text-white">

                Loading Equipment...

            </div>

        );

    }

    return (

        <div className="min-h-screen bg-[#0d0e12] text-white px-8 py-8">

            <div className="max-w-7xl mx-auto">

                {/* Header */}

                <h1 className="text-3xl font-bold">

                    Laboratory Equipment

                </h1>

                <p className="text-gray-400 mt-2">

                    Browse laboratory equipment currently available in the system.

                </p>

                {/* Summary Cards */}

                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">

                    <div className="bg-[#12131a] rounded-xl p-6">

                        <p className="text-gray-400">

                            Total Equipment

                        </p>

                        <h2 className="text-4xl font-bold mt-3">

                            {totalEquipment}

                        </h2>

                    </div>

                    <div className="bg-[#12131a] rounded-xl p-6">

                        <p className="text-gray-400">

                            Available

                        </p>

                        <h2 className="text-4xl font-bold mt-3 text-green-400">

                            {available}

                        </h2>

                    </div>

                    <div className="bg-[#12131a] rounded-xl p-6">

                        <p className="text-gray-400">

                            Booked

                        </p>

                        <h2 className="text-4xl font-bold mt-3 text-blue-400">

                            {booked}

                        </h2>

                    </div>

                    <div className="bg-[#12131a] rounded-xl p-6">

                        <p className="text-gray-400">

                            Under Maintenance

                        </p>

                        <h2 className="text-4xl font-bold mt-3 text-yellow-400">

                            {maintenance}

                        </h2>

                    </div>

                </div>

                {/* Search & Filter */}

                <div className="flex flex-col md:flex-row gap-4 mt-8">

                    <input

                        type="text"

                        placeholder="Search by equipment, category or department..."

                        value={search}

                        onChange={(e) => setSearch(e.target.value)}

                        className="flex-1 bg-[#12131a] border border-white/10 rounded-lg px-4 py-3 outline-none"

                    />

                    <select

                        value={statusFilter}

                        onChange={(e) => setStatusFilter(e.target.value)}

                        className="bg-[#12131a] border border-white/10 rounded-lg px-4 py-3"

                    >

                        <option value="ALL">All Status</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="BOOKED">Booked</option>
                        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                        <option value="OUT_OF_SERVICE">Out Of Service</option>
                        <option value="RETIRED">Retired</option>

                    </select>

                </div>

                {/* Empty State */}

                {filteredEquipment.length === 0 ? (

                    <div className="mt-10 bg-[#12131a] rounded-xl p-10 text-center">

                        <h2 className="text-2xl font-semibold">

                            No Equipment Found

                        </h2>

                        <p className="text-gray-400 mt-3">

                            No equipment matches your search or filter.

                        </p>

                    </div>

                ) : (

                    <div className="mt-10 overflow-x-auto rounded-xl border border-white/10">

                        <table className="min-w-full">

                            <thead className="bg-[#161821]">

                            <tr>

                                <th className="text-left p-4">Equipment</th>
                                <th className="text-left p-4">Category</th>
                                <th className="text-left p-4">Department</th>
                                <th className="text-left p-4">Manufacturer</th>
                                <th className="text-left p-4">Quantity</th>
                                <th className="text-left p-4">Status</th>

                            </tr>

                            </thead>

                            <tbody>

                            {filteredEquipment.map(item => (

                                <tr

                                    key={item.id}

                                    onClick={() => navigate(`/equipment/${item.id}`)}

                                    className="border-t border-white/10 hover:bg-white/5 cursor-pointer"

                                >

                                    <td className="p-4 font-medium">

                                        {item.name}

                                    </td>

                                    <td className="p-4">

                                        {item.category}

                                    </td>

                                    <td className="p-4">

                                        {item.department || "-"}

                                    </td>

                                    <td className="p-4">

                                        {item.manufacturer || "-"}

                                    </td>

                                    <td className="p-4">

                                        {item.quantity}

                                    </td>

                                    <td className="p-4">

                                <span

                                    className={`px-3 py-1 rounded-full text-sm font-medium

                                    ${
                                        item.status === "AVAILABLE"

                                            ? "bg-green-500/20 text-green-400"

                                            : item.status === "BOOKED"

                                                ? "bg-blue-500/20 text-blue-400"

                                                : item.status === "UNDER_MAINTENANCE"

                                                    ? "bg-yellow-500/20 text-yellow-400"

                                                    : item.status === "OUT_OF_SERVICE"

                                                        ? "bg-red-500/20 text-red-400"

                                                        : "bg-gray-500/20 text-gray-300"
                                    }`}

                                >

                                    {item.status
                                        .replace(/_/g, " ")
                                        .toLowerCase()
                                        .replace(/\b\w/g, c => c.toUpperCase())}

                                </span>

                                    </td>

                                </tr>

                            ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );

};

export default ResearcherEquipment;