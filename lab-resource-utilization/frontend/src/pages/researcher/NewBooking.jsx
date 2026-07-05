import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { createBooking } from "../../services/bookingService";
const NewBooking = () => {

    const [equipment, setEquipment] = useState([]);

    const [form, setForm] = useState({
        equipmentId: "",
        purpose: "",
        startTime: "",
        endTime: ""
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {

        const fetchEquipment = async () => {

            try {

                const response = await api.get("/equipment");

                const availableEquipment = response.data.filter(
                    item => item.status === "AVAILABLE"
                );

                setEquipment(availableEquipment);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        };

        fetchEquipment();

    }, []);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");
        setSubmitting(true);

        try {

            await createBooking(form);

            setMessage("Booking request submitted successfully. Waiting for approval.");

            setForm({
                equipmentId: "",
                purpose: "",
                startTime: "",
                endTime: ""
            });

            // Reload available equipment
            const response = await api.get("/equipment");

            setEquipment(
                response.data.filter(
                    item => item.status === "AVAILABLE"
                )
            );

        } catch (err) {

            if (err.response?.data?.message) {

                setError(err.response.data.message);

            } else {

                setError("Unable to submit booking.");

            }

        } finally {

            setSubmitting(false);

        }

    };

    if (loading) {

        return (
            <div className="min-h-screen bg-[#0d0e12] flex justify-center items-center text-white">
                Loading...
            </div>
        );

    }

    return (

        <div className="min-h-screen bg-[#0d0e12] text-white">

            <div className="max-w-4xl mx-auto py-10 px-6">

                <h1 className="text-3xl font-bold">
                    {error && (

                        <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">

                            {error}

                        </div>

                    )}
                    Create New Booking
                </h1>

                <p className="text-gray-400 mt-2">
                    Request laboratory equipment for your research.
                </p>

                {message && (

                    <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300">

                        {message}

                    </div>

                )}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-6"
                >

                    <div>

                        <label className="block mb-2">
                            Equipment
                        </label>

                        <select
                            name="equipmentId"
                            value={form.equipmentId}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#12131a] border border-white/10 rounded-lg p-3"
                        >

                            <option value="">
                                Select Equipment
                            </option>

                            {equipment.map((item) => (

                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.name}
                                </option>

                            ))}

                        </select>

                    </div>

                    {form.equipmentId && (

                        <div className="mt-5 bg-[#181a22] rounded-xl p-5 border border-white/10">

                            {equipment
                                .filter(e => e.id == form.equipmentId)
                                .map(e => (

                                    <div key={e.id}>

                                        <h3 className="text-xl font-semibold">
                                            {e.name}
                                        </h3>

                                        <div className="grid md:grid-cols-2 gap-4 mt-4">

                                            <p>
                                                <strong>Category:</strong> {e.category}
                                            </p>

                                            <p>
                                                <strong>Department:</strong> {e.department}
                                            </p>

                                            <p>
                                                <strong>Manufacturer:</strong> {e.manufacturer}
                                            </p>

                                            <p>
                                                <strong>Quantity:</strong> {e.quantity}
                                            </p>

                                            <p>
                                                <strong>Status:</strong> {e.status}
                                            </p>

                                        </div>

                                    </div>

                                ))}

                        </div>

                    )}

                    <div>

                        <label className="block mb-2">
                            Purpose
                        </label>

                        <textarea
                            name="purpose"
                            value={form.purpose}
                            onChange={handleChange}
                            required
                            rows="4"
                            className="w-full bg-[#12131a] border border-white/10 rounded-lg p-3"
                        />

                    </div>

                    <div className="grid md:grid-cols-2 gap-6">

                        <div>

                            <label className="block mb-2">
                                Start Time
                            </label>

                            <input
                                type="datetime-local"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#12131a] border border-white/10 rounded-lg p-3"
                            />

                        </div>

                        <div>

                            <label className="block mb-2">
                                End Time
                            </label>

                            <input
                                type="datetime-local"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#12131a] border border-white/10 rounded-lg p-3"
                            />

                        </div>

                    </div>

                    <button
                        disabled={submitting}
                        className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 transition"
                    >
                        {submitting ? "Submitting..." : "Submit Booking"}
                    </button>

                </form>

            </div>

        </div>

    );

};

export default NewBooking;