import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../../services/profileService";
const ProfilePage = () => {
    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        role: "",
        age: "",
        gender: "",
        phone: "",
        department: "",
        institution: ""
    });

    const [message, setMessage] = useState("");


    useEffect(() => {

        loadProfile();

    }, []);

    const loadProfile = async () => {

        try {

            const data = await getProfile();

            setProfile(data);

        }

        catch(error){

            console.error(error);

        }

        finally{

            setLoading(false);

        }

    };

    const handleChange = (e)=>{

        setProfile({

            ...profile,

            [e.target.name]:e.target.value

        });

    };

    const handleSubmit = async ()=>{

        try{

            setSaving(true);

            await updateProfile({

                name:profile.name,

                age:profile.age,

                gender:profile.gender,

                phone:profile.phone,

                department:profile.department,

                institution:profile.institution

            });

            setMessage("Profile updated successfully.");

        }

        catch(error){

            console.error(error);

            setMessage("Failed to update profile.");

        }

        finally{

            setSaving(false);

        }

    };

    if(loading){

        return(

            <div className="min-h-screen bg-[#0d0e12] flex items-center justify-center text-white">

                Loading Profile...

            </div>

        );

    }

    return (

        <div className="min-h-screen bg-[#0d0e12] text-white">

            <div className="max-w-6xl mx-auto px-6 py-10">

                {/* Header */}

                <div className="mb-10">

                    <h1 className="text-4xl font-bold">
                        My Profile
                    </h1>

                    <p className="text-gray-400 mt-2">
                        Manage your personal information and account details.
                    </p>

                </div>

                {/* Profile Card */}

                <div className="bg-[#12131a] rounded-3xl border border-white/10 shadow-xl p-8">

                    <div className="flex flex-col md:flex-row items-center gap-8">

                        {/* Avatar */}

                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-5xl font-bold">

                            {profile.name?.charAt(0).toUpperCase()}

                        </div>

                        {/* Basic Information */}

                        <div className="flex-1">

                            <h2 className="text-3xl font-bold">

                                {profile.name}

                            </h2>

                            <p className="text-purple-400 text-lg mt-2">

                                {profile.role}

                            </p>

                            <div className="grid md:grid-cols-2 gap-6 mt-8">

                                <div>

                                    <label className="text-gray-400 text-sm">

                                        Email Address

                                    </label>

                                    <div className="mt-2 bg-[#1d1f27] rounded-lg px-4 py-3 border border-white/10 text-gray-300">

                                        {profile.email}

                                    </div>

                                </div>

                                <div>

                                    <label className="text-gray-400 text-sm">

                                        Role

                                    </label>

                                    <div className="mt-2 bg-[#1d1f27] rounded-lg px-4 py-3 border border-white/10 text-gray-300 uppercase">

                                        {profile.role}

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Personal Information */}

                <div className="mt-10 bg-[#12131a] rounded-3xl border border-white/10 shadow-xl p-8">

                    <h2 className="text-2xl font-bold mb-8">

                        Personal Information

                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">

                        {/* Full Name */}

                        <div>

                            <label className="block text-gray-400 mb-2">

                                Full Name

                            </label>

                            <input
                                type="text"
                                name="name"
                                value={profile.name || ""}
                                onChange={handleChange}
                                className="w-full bg-[#1d1f27] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                            />

                        </div>

                        {/* Age */}

                        <div>

                            <label className="block text-gray-400 mb-2">

                                Age

                            </label>

                            <input
                                type="number"
                                name="age"
                                value={profile.age || ""}
                                onChange={handleChange}
                                className="w-full bg-[#1d1f27] border border-white/10 rounded-xl px-4 py-3 text-white"
                            />

                        </div>

                        {/* Gender */}

                        <div>

                            <label className="block text-gray-400 mb-2">

                                Gender

                            </label>

                            <select
                                name="gender"
                                value={profile.gender || ""}
                                onChange={handleChange}
                                className="w-full bg-[#1d1f27] border border-white/10 rounded-xl px-4 py-3 text-white"
                            >

                                <option value="">Select</option>

                                <option value="Male">Male</option>

                                <option value="Female">Female</option>

                                <option value="Other">Other</option>

                            </select>

                        </div>

                        {/* Phone */}

                        <div>

                            <label className="block text-gray-400 mb-2">

                                Phone Number

                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={profile.phone || ""}
                                onChange={handleChange}
                                className="w-full bg-[#1d1f27] border border-white/10 rounded-xl px-4 py-3 text-white"
                            />

                        </div>

                        {/* Department */}

                        <div>

                            <label className="block text-gray-400 mb-2">

                                Department

                            </label>

                            <input
                                type="text"
                                name="department"
                                value={profile.department || ""}
                                onChange={handleChange}
                                className="w-full bg-[#1d1f27] border border-white/10 rounded-xl px-4 py-3 text-white"
                            />

                        </div>

                        {/* Institution */}

                        <div>

                            <label className="block text-gray-400 mb-2">

                                Institution

                            </label>

                            <input
                                type="text"
                                name="institution"
                                value={profile.institution || ""}
                                onChange={handleChange}
                                className="w-full bg-[#1d1f27] border border-white/10 rounded-xl px-4 py-3 text-white"
                            />

                        </div>

                    </div>

                </div>
                {message && (

                    <div className="mb-6 text-green-400 font-medium">

                        {message}

                    </div>

                )}
                <div className="mt-10 flex justify-end">

                    <button

                        onClick={handleSubmit}

                        disabled={saving}

                        className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition"

                    >

                        {saving ? "Saving..." : "Save Changes"}

                    </button>

                </div>

            </div>

        </div>

    );

};

export default ProfilePage;