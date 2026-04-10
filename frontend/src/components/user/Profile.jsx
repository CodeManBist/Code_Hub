import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { useNavigate, useParams } from "react-router-dom";
import HeatMap from "@uiw/react-heat-map";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  const profileUserId = id || localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`http://localhost:3000/userProfile/${profileUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        setUser(data.data);
        setEditUsername(data.data?.username || "");
        setEditEmail(data.data?.email || "");
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [profileUserId]);

  const handleFollow = async () => {
    const currentUserId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!currentUserId || !user?._id || String(currentUserId) === String(user._id)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/follow/${user._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentUserId })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to follow user");
      }

      const refreshedProfile = await fetch(`http://localhost:3000/userProfile/${profileUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const refreshedData = await refreshedProfile.json();
      setUser(refreshedData.data);
    } catch (error) {
      console.error("Error following user:", error);
      window.alert(error.message || "Failed to follow user.");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:3000/updateProfile/${profileUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editUsername,
          email: editEmail
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUser(data.data);
      setIsEditingProfile(false);
      window.alert("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      window.alert(error.message || "Failed to update profile.");
    }
  };

  const handleDeleteProfile = async () => {
    const token = localStorage.getItem("token");
    const shouldDelete = window.confirm("Delete your account permanently?");
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/deleteProfile/${profileUserId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      window.alert("Account deleted successfully.");
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Error deleting profile:", error);
      window.alert(error.message || "Failed to delete account.");
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
                  src="/profile.webp"
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

                {isOwnProfile && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => setIsEditingProfile((prev) => !prev)}
                      className="px-4 py-2 rounded-md border border-[#30363d] text-sm text-gray-300 hover:bg-[#1f2937] transition"
                    >
                      {isEditingProfile ? "Cancel" : "Edit Profile"}
                    </button>
                    <button
                      onClick={handleDeleteProfile}
                      className="px-4 py-2 rounded-md border border-red-700 text-sm text-red-300 hover:bg-red-950/40 transition"
                    >
                      Delete Account
                    </button>
                  </div>
                )}

                {isOwnProfile && isEditingProfile && (
                  <form onSubmit={handleUpdateProfile} className="mt-5 space-y-3 max-w-md">
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full px-4 py-2 rounded-md bg-[#0d1117] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Username"
                    />
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-md bg-[#0d1117] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Email"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] transition text-white text-sm font-medium"
                    >
                      Save Profile
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto mt-6">
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 sm:p-7 md:p-8 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Contribution Heatmap</h3>
              <span className="text-xs text-gray-400">Last 12 months</span>
            </div>

            <div className="overflow-x-auto">
              <HeatMap
                className="profile-heatmap"
                value={Array.isArray(user?.contributionHeatmap) ? user.contributionHeatmap : []}
                startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                endDate={new Date()}
                width={860}
                rectSize={12}
                space={3}
                panelColors={{
                  0: "#161b22",
                  1: "#0e4429",
                  2: "#006d32",
                  3: "#26a641",
                  4: "#39d353"
                }}
              />
            </div>

            {(!user?.contributionHeatmap || user.contributionHeatmap.length === 0) && (
              <p className="text-xs text-gray-400 mt-3">No contribution data yet.</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Profile;
