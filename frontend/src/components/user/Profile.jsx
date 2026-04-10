import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { useNavigate, useParams } from "react-router-dom";

const Profile = () => {
    const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const profileUserId = id || localStorage.getItem("userId");

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
        const response = await fetch(`http://localhost:3000/userProfile/${profileUserId}`);
                const data = await response.json();

                setUser(data.data);
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        fetchUserProfile();

    const fetchCurrentUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:3000/userProfile/${userId}`);
        const data = await response.json();
        setCurrentUser(data.data);
      } catch (error) {
        console.error("Error fetching current user profile:", error);
      }
    };

    fetchCurrentUser();
  }, [profileUserId]);

  const handleFollow = async () => {
    const currentUserId = localStorage.getItem("userId");

    if (!currentUserId || !user?._id || String(currentUserId) === String(user._id)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/follow/${user._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ currentUserId })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to follow user");
      }

      const refreshedProfile = await fetch(`http://localhost:3000/userProfile/${profileUserId}`);
      const refreshedData = await refreshedProfile.json();
      setUser(refreshedData.data);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const isOwnProfile = String(profileUserId) === String(localStorage.getItem("userId"));
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#0d1117] text-white px-4 sm:px-6 md:px-10 py-8 sm:py-10">
        <section className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 sm:p-7 md:p-8 shadow-lg shadow-black/20">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
              <div className="shrink-0">
                <img
                  src="profile.webp"
                  alt="Profile"
                  className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border border-[#30363d] bg-[#0d1117]"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    {user?.username}
                  </h2>

                  {!isOwnProfile && (
                    <button
                      onClick={handleFollow}
                      className="bg-[#238636] text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-[#2ea043] transition border border-transparent"
                    >
                      Follow
                    </button>
                  )}
                </div>

                <div className="flex justify-center sm:justify-start gap-6 text-sm text-gray-300 mb-4">
                  <span>
                    <strong className="text-white">{user?.followers?.length ?? 0}</strong> Followers
                  </span>
                  <span>
                    <strong className="text-white">{user?.following?.length ?? 0}</strong> Following
                  </span>
                </div>

                <p className="text-sm text-gray-400 max-w-md leading-6">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Profile;
