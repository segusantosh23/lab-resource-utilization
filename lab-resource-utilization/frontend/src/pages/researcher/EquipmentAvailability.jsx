import React, { useEffect, useState } from "react";
import api from "../../services/api";
const EquipmentAvailability = () => {

    const [search, setSearch] = useState("");

    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const fetchEquipment = async () => {

            try {

                const response = await api.get("/equipment");

                setEquipment(response.data);

            } catch (error) {

                console.error("Failed to load equipment", error);

            } finally {

                setLoading(false);

            }

        };

        fetchEquipment();

    }, []);

    const filtered = equipment.filter(
        (item) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.id.toLowerCase().includes(search.toLowerCase())
    );
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d0e12] flex items-center justify-center text-white">
                Loading equipment...
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-[#0d0e12] text-white px-8 py-8">

            <div className="max-w-7xl mx-auto">

                <h1 className="text-3xl font-bold">
                    Equipment Availability
                </h1>

                <p className="text-gray-400 mt-2">
                    Browse and check the current availability of laboratory equipment.
                </p>

                <input
                    type="text"
                    placeholder="Search equipment..."
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                    className="w-full mt-8 bg-[#12131a] border border-white/10 rounded-lg px-4 py-3"
                />

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">

                    {filtered.map((item)=>(

                        <div
                            key={item.id}
                            className="bg-[#12131a] rounded-2xl border border-white/10 p-6"
                        >

                            <h2 className="text-xl font-semibold">
                                {item.name}
                            </h2>

                            <p className="text-gray-400 mt-3">
                                {item.category}
                            </p>

                            <p className="text-gray-400">
                                {item.laboratory}
                            </p>

                            <span
                                className={`inline-block mt-5 px-3 py-1 rounded-full text-sm ${
                                    item.status==="Available"
                                        ? "bg-green-500/20 text-green-400"
                                        : item.status==="In Use"
                                            ? "bg-blue-500/20 text-blue-400"
                                            : "bg-yellow-500/20 text-yellow-400"
                                }`}
                            >
                {item.status}
              </span>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
};

export default EquipmentAvailability;