import React from 'react'
import { FaGithub } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setCurrentUser(null);
      navigate("/auth", { replace: true });
    }
  };

  return (
    <nav className="w-full px-6 py-3 flex items-center justify-between bg-[#161b22] border-b border-[#30363d] sticky top-0 z-50">

      {/* LEFT */}
      <div className="cursor-pointer">
        <Link className='flex items-center gap-3' to="/dashboard">
          <FaGithub className="text-white text-2xl hover:scale-110 transition" />
          <span className="text-white font-semibold text-lg">GitHub</span>
        </Link>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6 text-gray-300 text-xl">
        <Link to="/repo/create" className="text-sm font-medium hover:text-white transition">
          New Repo
        </Link>
        <Link to="/profile">
          <VscAccount className="cursor-pointer hover:text-white transition" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-gray-300 hover:text-white transition"
        >
          Logout
        </button>
      </div>

    </nav>
  )
}

export default Navbar