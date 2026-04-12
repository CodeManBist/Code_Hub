import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
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

const RepoIssues = () => {
  const { id } = useParams();
  const [repository, setRepository] = useState(null);
  const [issues, setIssues] = useState([]);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueStatus, setIssueStatus] = useState("open");
  const [editingIssueId, setEditingIssueId] = useState(null);
  const [issueEditTitle, setIssueEditTitle] = useState("");
  const [issueEditDescription, setIssueEditDescription] = useState("");
  const [issueEditStatus, setIssueEditStatus] = useState("open");
  const [selectedIssue, setSelectedIssue] = useState(null);

  const fetchRepository = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/repo/${id}`);
      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch repository");
      }

      setRepository(data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch repository");
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/issue/all/${id}`);
      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch issues");
      }

      setIssues(data.issues || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch issues");
    }
  };

  useEffect(() => {
    fetchRepository();
    fetchIssues();
  }, [id]);

  const handleCreateIssue = async (e) => {
    e.preventDefault();

    if (!issueTitle.trim() || !issueDescription.trim()) {
      toast.error("Issue title and description are required");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/issue/create/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: issueTitle,
          description: issueDescription,
          status: issueStatus,
          author: localStorage.getItem("userId")
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
      toast.success("Issue created");
    } catch (error) {
      toast.error(error.message || "Failed to create issue");
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/issue/update/${issueId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
      toast.success("Issue updated");
    } catch (error) {
      toast.error(error.message || "Failed to update issue");
    }
  };

  const handleDeleteIssue = async (issueId) => {
    const shouldDelete = window.confirm("Delete this issue?");
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/issue/delete/${issueId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete issue");
      }

      fetchIssues();
      toast.success("Issue deleted");
    } catch (error) {
      toast.error(error.message || "Failed to delete issue");
    }
  };

  const handleOpenIssueDetails = async (issueId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/issue/${issueId}`);
      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch issue details");
      }

      setSelectedIssue(data.issue || null);
    } catch (error) {
      toast.error(error.message || "Failed to fetch issue details");
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#0d1117] text-white px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <Link to={`/repo/${id}`} className="text-sm text-blue-400 hover:underline">
              Back to repository
            </Link>
            <h1 className="text-3xl font-semibold mt-2">Issues - {repository?.name || "Repository"}</h1>
          </div>

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

export default RepoIssues;
