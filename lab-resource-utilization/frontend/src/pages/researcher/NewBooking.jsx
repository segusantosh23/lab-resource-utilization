import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { createBooking } from "../../services/bookingService";
import { useSearchParams, useNavigate } from "react-router-dom";

const NewBooking = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialEquipmentId = searchParams.get("equipmentId") || "";

    const [equipment, setEquipment] = useState([]);

    const [form, setForm] = useState({
        equipmentId: initialEquipmentId,
        purpose: "",
        quantity: 1,
        startTime: "",
        endTime: ""
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showWaitlistOption, setShowWaitlistOption] = useState(false);

    useEffect(() => {

        const fetchEquipment = async () => {

            try {

                const response = await api.get("/equipment");

                const validEquipment = response.data.filter(
                    item => item.status !== "RETIRED" && item.status !== "OUT_OF_SERVICE"
                );
                setEquipment(validEquipment);

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
        setShowWaitlistOption(false);
        setSubmitting(true);

        try {

            await createBooking(form);

            setMessage("Booking request submitted successfully. Waiting for approval.");

            setForm({
                equipmentId: "",
                purpose: "",
                quantity: 1,
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
            const errorMsg = err.response?.data?.message || "Unable to submit booking.";
            setError(errorMsg);
            
            // If booking fails due to availability, show waitlist option
            if (errorMsg.includes("not available") || errorMsg.includes("Insufficient equipment quantity")) {
                setShowWaitlistOption(true);
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

    const handleJoinWaitlist = async () => {
        setSubmitting(true);
        setError("");
        setMessage("");
        try {
            await api.post("/waitlist", {
                equipmentId: form.equipmentId,
                startTime: form.startTime,
                endTime: form.endTime,
                quantity: form.quantity,
                purpose: form.purpose
            });
            setMessage("Successfully joined the waitlist! We will notify you when it's available.");
            setShowWaitlistOption(false);
            setForm({
                equipmentId: "",
                purpose: "",
                quantity: 1,
                startTime: "",
                endTime: ""
            });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to join waitlist.");
        } finally {
            setSubmitting(false);
        }
    };

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

                    <div>

                        <label className="block mb-2">
                            Quantity
                        </label>

                        <input
                            type="number"
                            name="quantity"
                            value={form.equipmentId ? form.quantity : ''}
                            onChange={handleChange}
                            min="1"
                            disabled={!form.equipmentId}
                            max={equipment.find(e => e.id == form.equipmentId)?.quantity || 1}
                            required
                            className="w-full bg-[#12131a] border border-white/10 rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed"
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

                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 transition"
                        >
                            {submitting ? "Submitting..." : "Submit Booking"}
                        </button>

                        {showWaitlistOption && (
                            <button
                                type="button"
                                onClick={handleJoinWaitlist}
                                disabled={submitting}
                                className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 transition shadow-lg shadow-amber-500/20"
                            >
                                {submitting ? "Joining..." : "Join Waitlist Instead"}
                            </button>
                        )}
                    </div>

                </form>

            </div>

        </div>

    );

};

export default NewBooking;