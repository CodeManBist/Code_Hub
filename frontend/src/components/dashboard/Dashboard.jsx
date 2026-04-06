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
  const [activeTab, setActiveTab] = useState('repos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const refreshRepositories = async () => {
    const userId = localStorage.getItem("userId");

    try {
      const [userReposResponse, suggestedReposResponse] = await Promise.all([
        fetch(`http://localhost:3000/repo/user/${userId}`),
        fetch(`http://localhost:3000/repo/all`)
      ]);

      const userReposData = await userReposResponse.json();
      const suggestedReposData = await suggestedReposResponse.json();

      setRepositories(userReposData.repositories || []);
      setSuggestedRepositories(Array.isArray(suggestedReposData) ? suggestedReposData : []);
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };

  useEffect(() => {
    refreshRepositories();
  }, []);

  const handleStarToggle = async (repo) => {
    const userId = localStorage.getItem("userId");
    const isStarred = Array.isArray(repo.stargazers) && repo.stargazers.some((starUserId) => String(starUserId) === String(userId));

    try {
      const response = await fetch(`http://localhost:3000/repo/${repo._id}/star`, {
        method: isStarred ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to update star');
      }

      await refreshRepositories();
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

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

      <div className="bg-[#0d1117] text-white min-h-screen flex flex-col lg:flex-row">

        {/* MOBILE DRAWER */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div className="w-65 h-full bg-[#161b22] p-4">
              <button onClick={() => setIsSidebarOpen(false)} className="mb-4">Close</button>
              <h2 className="text-lg font-semibold mb-4">Explore</h2>
              {suggestedRepositories.map(repo => (
                <div key={repo._id} className="p-2 hover:bg-[#1f2937] rounded">
                  {repo.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block lg:w-[18%] h-screen border-r border-[#30363d] bg-[#161b22] p-4 sticky top-0">
          <h2 className="text-lg font-semibold mb-4">Explore</h2>
          {suggestedRepositories.map(repo => (
            <div key={repo._id} className="p-3 rounded-md hover:bg-[#1f2937] transition cursor-pointer">
              <div className="flex items-center gap-2">
                <GoRepo className="text-gray-400" />
                <p className="text-sm font-medium text-blue-400">{repo.name}</p>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2">{repo.description}</p>
            </div>
          ))}
        </aside>

        {/* MAIN */}
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">

            <div className="flex items-center gap-3">
              <button
                className="lg:hidden text-xl"
                onClick={() => setIsSidebarOpen(true)}
              >
                ☰
              </button>
              <h1 className="text-2xl font-semibold">Your Repositories</h1>
            </div>

            <input
              type="text"
              value={searchQuery}
              placeholder="Search repositories..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-75 px-4 py-2 rounded-md bg-[#161b22] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* MOBILE TABS */}
          <div className="lg:hidden flex gap-2 mb-4">
            {['repos', 'explore', 'events'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-md ${
                  activeTab === tab ? 'bg-blue-600' : 'bg-[#161b22]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* REPOSITORIES */}
          {(activeTab === 'repos' || window.innerWidth >= 1024) && (
            <div className="space-y-4">
              {(searchQuery ? searchResults : repositories).map(repo => (
                <div key={repo._id} className="p-5 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-blue-500 transition">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <GoRepo className="text-gray-400" />
                      <h3 className="text-lg font-semibold text-blue-400 hover:underline cursor-pointer">
                        {repo.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleStarToggle(repo)}
                      className="flex items-center gap-1 text-xs px-3 py-1 border border-[#30363d] rounded-md hover:bg-[#1f2937]"
                    >
                      <FaStar className="text-yellow-400" />
                      {Array.isArray(repo.stargazers) && repo.stargazers.some((starUserId) => String(starUserId) === String(localStorage.getItem("userId"))) ? 'Unstar' : 'Star'}
                    </button>
                  </div>

                  <p className="text-gray-400 text-sm mb-3">{repo.description}</p>

                  <div className="flex gap-4 text-xs text-gray-400 items-center">
                    <span className="flex items-center gap-1">
                      <GoDotFill className="text-green-500" />
                      JavaScript
                    </span>
                    <span className="flex items-center gap-1">
                      <FaStar /> {repo.starsCount ?? (Array.isArray(repo.stargazers) ? repo.stargazers.length : 0)}
                    </span>
                    <span>Updated recently</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EXPLORE MOBILE */}
          {activeTab === 'explore' && (
            <div className="space-y-3">
              {suggestedRepositories.map(repo => (
                <div key={repo._id} className="p-3 bg-[#161b22] rounded">
                  {repo.name}
                </div>
              ))}
            </div>
          )}

          {/* EVENTS MOBILE */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#161b22] rounded">Tech Conference</div>
              <div className="p-3 bg-[#161b22] rounded">Developer Meetup</div>
            </div>
          )}
        </main>

        {/* RIGHT PANEL */}
        <aside className="hidden xl:block xl:w-[22%] border-l border-[#30363d] p-5">
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-[#161b22] rounded-md">
              <MdEvent /> Tech Conference
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#161b22] rounded-md">
              <MdEvent /> Developer Meetup
            </div>
          </div>
        </aside>

      </div>
    </>
  )
}

export default Dashboard;