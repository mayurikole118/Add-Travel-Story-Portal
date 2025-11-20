import React, { useState } from "react";
import PasswordInput from "../../components/Input/PasswordInput";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import bgImg from "../../assets/images/bg-image.png"; // your login image

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError("");

    try {
      const response = await axiosInstance.post("/login", {
        email,
        password,
      });

      if (response.data?.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An unexpected error occurred. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-[#F3FAFF] px-4 py-8">

      {/* LEFT IMAGE SECTION */}
      <div className="w-full lg:w-1/2 relative mb-10 lg:mb-0">
        <img
          src={bgImg}
          alt="Travel Login"
          className="w-full h-[350px] lg:h-[600px] object-cover rounded-2xl shadow-md"
        />

        {/* overlay text (WITHOUT black background) */}
        <div className="absolute inset-0 flex items-center">
          <div className="px-8 lg:px-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
              Capture Your Journeys
            </h1>

            <p className="mt-4 text-md lg:text-lg text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] w-[80%]">
              Record your travel experiences and memories in your personal travel journal.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="w-full lg:w-1/2 max-w-md bg-white shadow-xl rounded-2xl p-8">
        <form onSubmit={handleLogin}>
          <h4 className="text-3xl font-bold text-[#0A1D56] mb-6">Login</h4>

          {/* Email Input */}
          <input
            type="text"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-[#F0FCFF] border border-gray-200 focus:ring-2 focus:ring-[#00B4D8] outline-none mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password Input */}
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mt-1 mb-3">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#00B4D8] to-[#0077B6] text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:opacity-90 transition mt-4"
          >
            LOGIN
          </button>

          <p className="text-center text-slate-500 text-sm my-4">Or</p>

          {/* Create Account Button */}
          <button
            type="button"
            className="w-full bg-[#F0FCFF] text-[#0077B6] py-3 rounded-lg font-semibold text-lg border border-[#00B4D8] shadow-md hover:bg-[#E4F8FF] transition"
            onClick={() => navigate("/signUp")}
          >
            CREATE ACCOUNT
          </button>
        </form>
      </div>

    </div>
  );
};

export default Login;
