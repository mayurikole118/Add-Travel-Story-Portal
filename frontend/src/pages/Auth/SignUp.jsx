import React, { useState } from "react";
import bgImg from "../../assets/images/bg-image.png";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // ✅ UPDATED handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password) {
      return setError("All fields are required");
    }

    try {
      const response = await axiosInstance.post("/create-account", formData);

      console.log("Signup response:", response.data);

      // Save token if backend sends it
      if (response.data?.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
      }

      // 🚀 Redirect to dashboard after successful signup
      navigate("/dashboard");

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Signup failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-[#F3FAFF] px-4 py-8">

      {/* LEFT IMAGE SECTION */}
      <div className="w-full lg:w-1/2 relative mb-10 lg:mb-0">
        <img
          src={bgImg}
          alt="Travel"
          className="w-full h-[350px] lg:h-[600px] object-cover rounded-2xl shadow-md"
        />

        <div className="absolute inset-0 flex items-center">
          <div className="px-8 lg:px-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
              Join the Adventure
            </h1>

            <p className="mt-4 text-lg text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] w-[85%]">
              Create an account to start documenting your travels and memories.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="w-full lg:w-1/2 max-w-md bg-white shadow-xl rounded-2xl p-8">

        <h2 className="text-3xl font-bold text-[#0A1D56] mb-6">Sign Up</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            className="w-full p-3 rounded-lg bg-[#F0FCFF] border border-gray-200 focus:ring-2 focus:ring-[#00B4D8] outline-none"
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-[#F0FCFF] border border-gray-200 focus:ring-2 focus:ring-[#00B4D8] outline-none"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-[#F0FCFF] border border-gray-200 focus:ring-2 focus:ring-[#00B4D8] outline-none"
            onChange={handleChange}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#00B4D8] to-[#0077B6] text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:opacity-90 transition"
          >
            CREATE ACCOUNT
          </button>
        </form>

        <p className="text-center mt-4">
          Already have an account?
          <Link to="/login" className="ml-1 text-[#0077B6] font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
