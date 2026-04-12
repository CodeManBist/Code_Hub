import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../Navbar";

async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const rawText = await response.text();
  return {
    error: rawText?.slice(0, 200) || `Unexpected response format (${response.status})`
  };
}

const RepoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repository, setRepository] = useState(null);
  const [repoDescription, setRepoDescription] = useState("");
  const [repoContent, setRepoContent] = useState("");

  const fetchRepository = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/repo/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readApiResponse(response);
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch repository");
      }

      setRepository(data);
      setRepoDescription(data.description || "");
      setRepoContent(Array.isArray(data.content) ? data.content.join("\n") : "");
    } catch (error) {
      toast.error(error.message || "Failed to fetch repository");
    }
  };

  useEffect(() => {
    fetchRepository();
  }, [id]);

  const currentUserId = localStorage.getItem("userId");
  const isOwner = useMemo(() => {
    return String(repository?.owner?._id || repository?.owner) === String(currentUserId);
  }, [currentUserId, repository?.owner]);

  const handleUpdateRepository = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/repo/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          description: repoDescription,
          content: repoContent
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
        })
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to update repository");
      }

      fetchRepository();
      toast.success("Repository updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update repository");
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/repo/toggle/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to toggle visibility");
      }

      fetchRepository();
      toast.success("Repository visibility updated");
    } catch (error) {
      toast.error(error.message || "Failed to toggle repository visibility");
    }
  };

  const handleDeleteRepository = async () => {
    const shouldDelete = window.confirm("Are you sure you want to delete this repository?");
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/repo/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete repository");
      }

      toast.success("Repository deleted successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to delete repository");
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#0d1117] text-white px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Link to="/dashboard" className="text-sm text-blue-400 hover:underline">
                Back to dashboard
              </Link>
              <h1 className="text-3xl font-semibold mt-2">{repository?.name || "Repository"}</h1>
              <p className="text-gray-400 mt-2">{repository?.description}</p>
            </div>

            <div className="text-right text-sm text-gray-400 space-y-2">
              <p className="text-red-500">{repository?.visibility ? "Public" : "Private"}</p>
              <div className="flex flex-wrap justify-end gap-2">
                <Link to={`/repo/${id}/issues`} className="px-3 py-1 rounded-md border border-[#30363d] hover:bg-[#1f2937] text-white">
                  Manage Issues
                </Link>
                {isOwner && (
                  <>
                    <button onClick={handleToggleVisibility} className="px-3 py-1 rounded-md border border-[#30363d] hover:bg-[#1f2937] text-white">
                      Toggle Visibility
                    </button>
                    <button onClick={handleDeleteRepository} className="px-3 py-1 rounded-md border border-red-700 text-red-300 hover:bg-red-950/40">
                      Delete Repo
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {isOwner && (
            <form onSubmit={handleUpdateRepository} className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Edit description</label>
                <textarea
                  value={repoDescription}
                  onChange={(e) => setRepoDescription(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 rounded-md bg-[#0d1117] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Edit content</label>
                <textarea
                  value={repoContent}
                  onChange={(e) => setRepoContent(e.target.value)}
                  rows="5"
                  className="w-full px-4 py-2 rounded-md bg-[#0d1117] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button type="submit" className="px-4 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] transition text-white text-sm font-medium">
                Save repository changes
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
};

export default RepoDetail;
