import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";

const CreateRepository = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(true);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateRepository = async (e) => {
    e.preventDefault();
    const owner = localStorage.getItem("userId");

    if (!owner) {
      window.alert("You need to be logged in to create a repository.");
      return;
    }

    if (!name.trim()) {
      window.alert("Repository name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/repo/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          owner,
          name,
          description,
          visibility,
          content: content
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          issues: []
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create repository");
      }

      window.alert("Repository created successfully.");
      navigate(`/repo/${data.repositoryId}`);
    } catch (error) {
      console.error("Error creating repository:", error);
      window.alert(error.message || "Failed to create repository.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#0d1117] text-white px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold">Create repository</h1>
            <p className="text-sm text-gray-400 mt-2">Set up a new repository for your account.</p>
          </div>

          <form onSubmit={handleCreateRepository} className="space-y-4 rounded-xl border border-[#30363d] bg-[#161b22] p-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Repository name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#0d1117] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="my-new-repo"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 rounded-md bg-[#0d1117] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Short description of the repository"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Files/content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="6"
                className="w-full px-4 py-2 rounded-md bg-[#0d1117] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="One line per file/content item"
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={visibility}
                onChange={(e) => setVisibility(e.target.checked)}
                className="accent-blue-500"
              />
              Public repository
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] transition text-white text-sm font-medium disabled:opacity-60"
              >
                {isSubmitting ? "Creating..." : "Create repository"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 rounded-md border border-[#30363d] text-sm text-gray-300 hover:bg-[#1f2937] transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default CreateRepository;