import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/allUsers");
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const currentUserId = localStorage.getItem("userId");
    const lowerSearch = searchQuery.toLowerCase();

    return users.filter((user) => {
      const notCurrentUser = String(user._id) !== String(currentUserId);
      const matchesSearch = user.username.toLowerCase().includes(lowerSearch);
      return notCurrentUser && matchesSearch;
    });
  }, [users, searchQuery]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#0d1117] text-white px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold">All Users</h1>
              <p className="text-sm text-gray-400">Find people and follow them.</p>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full sm:w-80 px-4 py-2 rounded-md bg-[#161b22] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-blue-500 transition"
              >
                <Link to={`/profile/${user._id}`} className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-[#0d1117] border border-[#30363d] flex items-center justify-center text-sm font-semibold">
                    {user.username?.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-semibold text-white truncate">{user.username}</h2>
                    <p className="text-sm text-gray-400 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {Array.isArray(user.followers) ? user.followers.length : 0} followers · {Array.isArray(user.following) ? user.following.length : 0} following
                    </p>
                  </div>
                </Link>

                <Link
                  to={`/profile/${user._id}`}
                  className="self-start sm:self-auto px-4 py-2 rounded-md bg-[#238636] text-white text-sm font-medium hover:bg-[#2ea043] transition"
                >
                  Open Profile
                </Link>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="p-6 rounded-xl border border-[#30363d] bg-[#161b22] text-gray-400">
                No users found.
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Users;