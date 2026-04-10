import React from 'react'
import { FaGithub } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";
import { Link } from 'react-router-dom';

const Navbar = () => {
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
      </div>

    </nav>
  )
}

export default Navbar