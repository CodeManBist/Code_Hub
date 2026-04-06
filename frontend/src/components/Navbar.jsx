import React from 'react'
import { FaGithub } from "react-icons/fa";
import { IoGitPullRequestOutline } from "react-icons/io5";
import { GoIssueOpened } from "react-icons/go";
import { VscAccount } from "react-icons/vsc";

const Navbar = () => {
  return (
    <nav className="w-full px-6 py-3 flex items-center justify-between bg-[#161b22] border-b border-[#30363d] sticky top-0 z-50">

      {/* LEFT */}
      <div className="flex items-center gap-3 cursor-pointer">
        <FaGithub className="text-white text-2xl hover:scale-110 transition" />
        <span className="text-white font-semibold text-lg">GitHub</span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6 text-gray-300 text-xl">
        <IoGitPullRequestOutline className="cursor-pointer hover:text-white transition" />
        <GoIssueOpened className="cursor-pointer hover:text-white transition" />
        <VscAccount className="cursor-pointer hover:text-white transition" />
      </div>

    </nav>
  )
}

export default Navbar