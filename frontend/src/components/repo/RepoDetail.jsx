import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar";

const ISSUE_STATUS_OPTIONS = ["open", "closed"];

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
  const [issues, setIssues] = useState([]);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueStatus, setIssueStatus] = useState("open");
  const [repoDescription, setRepoDescription] = useState("");
  const [repoContent, setRepoContent] = useState("");
  const [editingIssueId, setEditingIssueId] = useState(null);
  const [issueEditTitle, setIssueEditTitle] = useState("");
  const [issueEditDescription, setIssueEditDescription] = useState("");
  const [issueEditStatus, setIssueEditStatus] = useState("open");
  const [selectedIssue, setSelectedIssue] = useState(null);

  const fetchRepository = async () => {
    try {
      const response = await fetch(`http://localhost:3000/repo/${id}`);
      const data = await response.json();
      setRepository(data);
      setRepoDescription(data.description || "");
      setRepoContent(Array.isArray(data.content) ? data.content.join("\n") : "");
    } catch (error) {
      console.error("Error fetching repository:", error);
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await fetch(`http://localhost:3000/issue/all/${id}`);
      const data = await response.json();
      setIssues(data.issues || []);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  useEffect(() => {
    fetchRepository();
    fetchIssues();
  }, [id]);

  const currentUserId = localStorage.getItem("userId");
  const isOwner = useMemo(() => {
    return String(repository?.owner?._id || repository?.owner) === String(currentUserId);
  }, [currentUserId, repository?.owner]);

  const handleUpdateRepository = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3000/repo/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          description: repoDescription,
          content: repoContent
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update repository");
      }

      fetchRepository();
      window.alert("Repository updated successfully.");
    } catch (error) {
      console.error("Error updating repository:", error);
      window.alert(error.message || "Failed to update repository.");
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const response = await fetch(`http://localhost:3000/repo/toggle/${id}`, {
        method: "PATCH"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to toggle visibility");
      }

      fetchRepository();
      window.alert("Repository visibility updated.");
    } catch (error) {
      console.error("Error toggling visibility:", error);
      window.alert(error.message || "Failed to toggle repository visibility.");
    }
  };

  const handleDeleteRepository = async () => {
    const shouldDelete = window.confirm("Are you sure you want to delete this repository?");
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/repo/delete/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete repository");
      }

      window.alert("Repository deleted successfully.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting repository:", error);
      window.alert(error.message || "Failed to delete repository.");
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();

    if (!issueTitle.trim() || !issueDescription.trim()) {
      window.alert("Issue title and description are required.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/issue/create/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: issueTitle,
          description: issueDescription,
          status: issueStatus
        })
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create issue");
      }

      setIssueTitle("");
      setIssueDescription("");
      setIssueStatus("open");
      fetchIssues();
      fetchRepository();
      window.alert("Issue created successfully.");
    } catch (error) {
      console.error("Error creating issue:", error);
      window.alert(error.message || "Failed to create issue.");
    }
  };

  const startEditIssue = (issue) => {
    setEditingIssueId(issue._id);
    setIssueEditTitle(issue.title);
    setIssueEditDescription(issue.description);
    setIssueEditStatus(issue.status);
  };

  const handleUpdateIssue = async (issueId) => {
    try {
      const response = await fetch(`http://localhost:3000/issue/update/${issueId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: issueEditTitle,
          description: issueEditDescription,
          status: issueEditStatus
        })
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to update issue");
      }

      setEditingIssueId(null);
      fetchIssues();
      window.alert("Issue updated successfully.");
    } catch (error) {
      console.error("Error updating issue:", error);
      window.alert(error.message || "Failed to update issue.");
    }
  };

  const handleDeleteIssue = async (issueId) => {
    const shouldDelete = window.confirm("Delete this issue?");
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/issue/delete/${issueId}`, {
        method: "DELETE"
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete issue");
      }

      fetchIssues();
      window.alert("Issue deleted successfully.");
    } catch (error) {
      console.error("Error deleting issue:", error);
      window.alert(error.message || "Failed to delete issue.");
    }
  };

  const handleOpenIssueDetails = async (issueId) => {
    try {
      const response = await fetch(`http://localhost:3000/issue/${issueId}`);
      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch issue details");
      }

      setSelectedIssue(data.issue || null);
    } catch (error) {
      console.error("Error fetching issue details:", error);
      window.alert(error.message || "Failed to fetch issue details.");
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
              <p>{repository?.owner?.username || "Unknown owner"}</p>
              <p>{repository?.visibility ? "Public" : "Private"}</p>
              {isOwner && (
                <div className="flex flex-wrap justify-end gap-2">
                  <button onClick={handleToggleVisibility} className="px-3 py-1 rounded-md border border-[#30363d] hover:bg-[#1f2937] text-white">
                    Toggle Visibility
                  </button>
                  <button onClick={handleDeleteRepository} className="px-3 py-1 rounded-md border border-red-700 text-red-300 hover:bg-red-950/40">
                    Delete Repo
                  </button>
                </div>
              )}
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

          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Issues</h2>
              <span className="text-sm text-gray-400">{issues.length} total</span>
            </div>

            {selectedIssue && (
              <div className="mb-5 p-4 rounded-lg border border-[#30363d] bg-[#0d1117]">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-white">{selectedIssue.title}</h3>
                  <button
                    type="button"
                    onClick={() => setSelectedIssue(null)}
                    className="text-xs px-2 py-1 rounded-md border border-[#30363d] text-gray-300 hover:bg-[#1f2937]"
                  >
                    Close
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-2">{selectedIssue.description}</p>
                <p className="text-xs text-gray-500 mt-2">Status: {selectedIssue.status}</p>
              </div>
            )}

            <form onSubmit={handleCreateIssue} className="space-y-3 mb-6">
              <input
                type="text"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="Issue title"
                className="w-full px-4 py-2 rounded-md bg-[#0d1117] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Issue description"
                rows="4"
                className="w-full px-4 py-2 rounded-md bg-[#0d1117] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <select
                value={issueStatus}
                onChange={(e) => setIssueStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#0d1117] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ISSUE_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] transition text-white text-sm font-medium"
              >
                Create Issue
              </button>
            </form>

            <div className="space-y-3">
              {issues.map((issue) => (
                <div key={issue._id} className="p-4 rounded-lg border border-[#30363d] bg-[#0d1117] space-y-3">
                  {editingIssueId === issue._id ? (
                    <>
                      <input
                        type="text"
                        value={issueEditTitle}
                        onChange={(e) => setIssueEditTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-md bg-[#161b22] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        value={issueEditDescription}
                        onChange={(e) => setIssueEditDescription(e.target.value)}
                        rows="3"
                        className="w-full px-4 py-2 rounded-md bg-[#161b22] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <select
                        value={issueEditStatus}
                        onChange={(e) => setIssueEditStatus(e.target.value)}
                        className="w-full px-4 py-2 rounded-md bg-[#161b22] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {ISSUE_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateIssue(issue._id)} type="button" className="px-3 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] transition text-white text-sm font-medium">
                          Save
                        </button>
                        <button onClick={() => setEditingIssueId(null)} type="button" className="px-3 py-2 rounded-md border border-[#30363d] text-gray-300 hover:bg-[#1f2937]">
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenIssueDetails(issue._id)}
                          className="font-semibold text-white hover:underline text-left"
                        >
                          {issue.title}
                        </button>
                        <span className={`text-xs px-2 py-1 rounded-full ${issue.status === "open" ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-300"}`}>
                          {issue.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{issue.description}</p>
                      <div className="flex gap-2">
                        <button onClick={() => startEditIssue(issue)} type="button" className="px-3 py-2 rounded-md border border-[#30363d] text-gray-300 hover:bg-[#1f2937] text-sm">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteIssue(issue._id)} type="button" className="px-3 py-2 rounded-md border border-red-700 text-red-300 hover:bg-red-950/40 text-sm">
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {issues.length === 0 && (
                <div className="text-sm text-gray-400">No issues yet.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default RepoDetail;