import React, { useState, useEffect } from 'react'
import Navbar from '../Navbar';
import { GoRepo } from "react-icons/go";
import { FaStar } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { MdEvent } from "react-icons/md";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      try {
        const response = await fetch(`http://localhost:3000/repo/user/${userId}`);
        const data = await response.json();
        setRepositories(data.repositories);
      } catch (error) {
        console.error('Error fetching repositories:', error);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`http://localhost:3000/repo/all`);
        const data = await response.json();
        setSuggestedRepositories(data);
      } catch (error) {
        console.error('Error fetching repositories:', error);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setSearchResults([]);
    } else {
      const filteredRepo = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  return (
    <>
      <Navbar />

      <div className="bg-[#0d1117] text-white min-h-screen flex">

        {/* LEFT SIDEBAR */}
        <aside className="w-[18%] min-h-screen border-r border-[#30363d] bg-[#161b22] p-4 sticky top-0">
          <h2 className="text-lg font-semibold mb-4">Explore</h2>

          <div className="space-y-3">
            {suggestedRepositories.map((repo) => (
              <div
                key={repo._id}
                className="p-3 rounded-md hover:bg-[#1f2937] transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <GoRepo className="text-gray-400" />
                  <p className="text-sm font-medium text-blue-400">{repo.name}</p>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{repo.description}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 px-8 py-6 overflow-y-auto">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Your Repositories</h1>

            <input
              type="text"
              value={searchQuery}
              placeholder="Search repositories..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 w-[300px] rounded-md bg-[#161b22] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* REPO LIST */}
          <div className="space-y-4">
            {(searchQuery ? searchResults : repositories).map((repo) => (
              <div
                key={repo._id}
                className="p-5 bg-[#161b22] border border-[#30363d] rounded-lg hover:border-gray-500 transition"
              >
                {/* TOP */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <GoRepo className="text-gray-400" />
                    <h3 className="text-lg font-semibold text-blue-400 cursor-pointer hover:underline">
                      {repo.name}
                    </h3>
                  </div>

                  <button className="flex items-center gap-1 text-xs px-3 py-1 border border-[#30363d] rounded-md hover:bg-[#1f2937]">
                    <FaStar className="text-yellow-400" />
                    Star
                  </button>
                </div>

                {/* DESCRIPTION */}
                <p className="text-gray-400 text-sm mb-3">
                  {repo.description}
                </p>

                {/* META INFO */}
                <div className="flex gap-4 text-xs text-gray-400 items-center">
                  <span className="flex items-center gap-1">
                    <GoDotFill className="text-green-500" />
                    JavaScript
                  </span>
                  <span className="flex items-center gap-1">
                    <FaStar />
                    0
                  </span>
                  <span>Updated recently</span>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT PANEL */}
        <aside className="w-[22%] min-h-screen border-l border-[#30363d] bg-[#0d1117] p-5">
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 p-3 bg-[#161b22] rounded-md border border-[#30363d]">
              <MdEvent className="text-blue-400" />
              Tech Conference - Dec 15
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#161b22] rounded-md border border-[#30363d]">
              <MdEvent className="text-blue-400" />
              Developer Meetup - Dec 25
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#161b22] rounded-md border border-[#30363d]">
              <MdEvent className="text-blue-400" />
              React Summit - April 30
            </div>
          </div>
        </aside>

      </div>
    </>
  )
}

export default Dashboard;