import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import githubLogo from "../../assets/github-mark-white.svg";
import { useAuth } from "../../authContext";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);

      setCurrentUser(data.userId);

      navigate("/dashboard");

    } catch (error) {
      console.error("Signup failed:", error);
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1117]">
      
      <img src={githubLogo} alt="GitHub" className="w-12 mb-6" />

      <div className="w-[370px] p-8 rounded-xl border border-[#30363d] bg-[#161b22] shadow-lg mb-8">
        
        <h2 className="mb-7 text-center text-white font-semibold text-3xl tracking-wide">
          Create your account
        </h2>

        <form onSubmit={handleSignup}>
          
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-5 px-4 py-2 rounded-md border border-[#30363d] bg-transparent text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-5 px-4 py-2 rounded-md border border-[#30363d] bg-transparent text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-7 px-4 py-2 rounded-md border border-[#30363d] bg-transparent text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>

      <div className="w-[370px] p-5 rounded-xl border border-[#30363d] bg-[#161b22] text-gray-300 text-center">
        Already have an account?{" "}
        <Link to="/auth" className="text-blue-400 font-semibold hover:underline">
          Login
        </Link>
      </div>
    </div>
  );
}

export default Signup;