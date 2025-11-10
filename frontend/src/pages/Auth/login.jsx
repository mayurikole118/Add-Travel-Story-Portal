import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../../components/Input/PasswordInput";
import bgImg from "../../assets/pictures/bg-img.png";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // basic validation
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter the password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/login", { email, password });

      // validate proper backend response
      if (response?.data?.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login API Error:", error);

      // handle various error cases safely
      if (error.response) {
        const msg = error.response?.data?.message || "Server error occurred.";
        setError(msg);
      } else if (error.request) {
        setError("Unable to reach the server. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-cyan-50 overflow-hidden relative">
      {/* background decor */}
      <div className="login-ui-box right-10 -top-40" />
      <div className="login-ui-box bg-cyan-200 -bottom-40 right-1/2"></div>

      <div className="container h-screen flex items-center justify-center px-20 mx-auto">
        {/* Left side with background image */}
        <div
          className="w-2/4 h-[90vh] flex items-end bg-cover bg-center rounded-lg p-10 z-50"
          style={{ backgroundImage: `url(${bgImg})` }}
        >
          <div>
            <h4 className="text-5xl text-white font-semibold leading-[58px]">
              Capture Your <br /> Journeys
            </h4>
            <p className="text-[15px] text-white leading-6 pr-7 mt-4">
              Record your travel experiences and memories in your personal
              travel journal.
            </p>
          </div>
        </div>

        {/* Right side with login form */}
        <div className="w-2/4 h-[75vh] bg-white rounded-r-lg relative p-16 shadow-lg shadow-cyan-200/20">
          <form onSubmit={handleLogin}>
            <h4 className="text-2xl font-semibold mb-7">Login</h4>

            <input
              type="text"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              disabled={loading}
            />

            <PasswordInput
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              disabled={loading}
            />

            {error && (
              <p className="text-red-500 text-xs pb-1 transition-all duration-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-xs text-slate-500 text-center my-4">Or</p>

            <button
              type="button"
              className="btn-primary btn-light"
              onClick={() => navigate("/signup")}
              disabled={loading}
            >
              CREATE ACCOUNT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
