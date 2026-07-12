import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCodeBranch, FaCopy, FaFileAlt, FaFolder, FaLock, FaRegStar } from "react-icons/fa";
import Navbar from "../Navbar";
import "./repoBrowser.css";

const api = import.meta.env.VITE_API_BASE_URL;
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
async function request(url) { const response = await fetch(`${api}${url}`, { headers: auth() }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "Request failed"); return data; }
const bytes = (size) => size == null ? "—" : size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`;
const language = (name = "") => ({ js: "JavaScript", jsx: "JSX", ts: "TypeScript", tsx: "TSX", json: "JSON", html: "HTML", css: "CSS", md: "Markdown", txt: "Text" })[name.split(".").pop().toLowerCase()] || "Text";

function Markdown({ content }) {
  return <article className="readme prose-codehub">{content.split("\n").map((line, index) => {
    if (/^### /.test(line)) return <h3 key={index}>{line.slice(4)}</h3>;
    if (/^## /.test(line)) return <h2 key={index}>{line.slice(3)}</h2>;
    if (/^# /.test(line)) return <h1 key={index}>{line.slice(2)}</h1>;
    if (/^```/.test(line)) return <pre key={index}>{line.slice(3)}</pre>;
    if (/^- /.test(line)) return <li key={index}>{line.slice(2)}</li>;
    if (!line.trim()) return <br key={index} />;
    return <p key={index}>{line.replace(/`([^`]+)`/g, "$1")}</p>;
  })}</article>;
}
function Code({ file }) { return <div className="code-viewer">{file.content.split("\n").map((line, index) => <div className="code-row" key={index}><span className="line-number">{index + 1}</span><code>{line || " "}</code></div>)}</div>; }

export default function RepoDetail() {
  const { id } = useParams();
  const [repository, setRepository] = useState(null); const [tree, setTree] = useState(null); const [path, setPath] = useState(""); const [file, setFile] = useState(null); const [readme, setReadme] = useState(null); const [commits, setCommits] = useState([]); const [commit, setCommit] = useState(""); const [tab, setTab] = useState("code"); const [search, setSearch] = useState(""); const [loading, setLoading] = useState(true);
  const suffix = commit ? `&commit=${encodeURIComponent(commit)}` : "";
  async function loadTree(nextPath = path, selectedCommit = commit) { setLoading(true); try { const commitQuery = selectedCommit ? `&commit=${encodeURIComponent(selectedCommit)}` : ""; const data = await request(`/repo/${id}/files?path=${encodeURIComponent(nextPath)}${commitQuery}`); setTree(data); setPath(nextPath); setFile(null); } catch (error) { toast.error(error.message); } finally { setLoading(false); } }
  useEffect(() => { (async () => { try { const [repo, history] = await Promise.all([request(`/repo/${id}`), request(`/repo/${id}/commits`)]); setRepository(repo); setCommits(history.commits || []); await loadTree(""); try { setReadme(await request(`/repo/${id}/readme`)); } catch { setReadme(null); } } catch (error) { toast.error(error.message); } })(); }, [id]);
  useEffect(() => { if (repository) { loadTree(""); setReadme(null); } }, [commit]);
  const isOwner = useMemo(() => String(repository?.owner?._id || repository?.owner) === String(localStorage.getItem("userId")), [repository]);
  const entries = (tree?.entries || []).filter((entry) => !search || entry.path.toLowerCase().includes(search.toLowerCase()) || entry.name.toLowerCase().includes(search.toLowerCase()));
  async function openEntry(entry) { if (entry.type === "directory") return loadTree(entry.path); try { setFile(await request(`/repo/${id}/file?path=${encodeURIComponent(entry.path)}${suffix}`)); } catch (error) { toast.error(error.message); } }
  function crumbPaths() { const parts = path ? path.split("/") : []; return parts.map((part, index) => ({ part, value: parts.slice(0, index + 1).join("/") })); }
  async function copy(value) { await navigator.clipboard.writeText(value); toast.success("Copied to clipboard"); }
  if (!repository && loading) return <><Navbar /><main className="repo-page"><div className="skeleton h-12" /><div className="skeleton h-72" /></main></>;
  return <><Navbar /><main className="repo-page"><section className="repo-hero"><div><p className="owner-name">{repository?.owner?.username || "owner"} <span>/</span></p><h1>{repository?.name}</h1><p className="repo-description">{repository?.description || "No description provided."}</p></div><div className="repo-stats"><span><FaRegStar /> {repository?.starsCount || 0}</span><span>{repository?.issues?.length || 0} issues</span><span>{repository?.visibility ? "Public" : <><FaLock /> Private</>}</span></div></section>
    <nav className="repo-tabs"><button className={tab === "code" ? "active" : ""} onClick={() => setTab("code")}>Code</button><Link to={`/repo/${id}/issues`}>Issues</Link><button className={tab === "commits" ? "active" : ""} onClick={() => setTab("commits")}>Commits</button>{isOwner && <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>Settings</button>}</nav>
    {tab === "commits" ? <section className="panel commit-list">{commits.length ? commits.map((item) => <button key={item.id} onClick={() => { setCommit(item.id); setTab("code"); }}><FaCodeBranch /><span><strong>{item.message}</strong><small>{item.author} · {item.timestamp ? new Date(item.timestamp).toLocaleString() : "Unknown date"}</small></span><code>{item.hash.slice(0, 8)}</code></button>) : <p className="empty">No commits yet. Push a commit with the existing CodeHub CLI to browse its files here.</p>}</section> : tab === "settings" ? <Settings repository={repository} isOwner={isOwner} onSaved={setRepository} /> : <><div className="browser-toolbar"><div className="breadcrumbs"><button onClick={() => loadTree("")}>{repository?.name}</button>{crumbPaths().map(({ part, value }) => <React.Fragment key={value}><span>/</span><button onClick={() => loadTree(value)}>{part}</button></React.Fragment>)}</div><select value={commit} onChange={(e) => setCommit(e.target.value)}><option value="">Latest commit</option>{commits.map((item) => <option key={item.id} value={item.id}>{item.message.slice(0, 42)}</option>)}</select></div>
      {file ? <section className="panel"><header className="file-header"><span><FaFileAlt /> {file.path}</span><span>{language(file.name)} · {bytes(file.size)}</span><button onClick={() => copy(file.content)}><FaCopy /> Copy</button></header><Code file={file} /></section> : <><section className="panel file-browser"><div className="browser-head"><strong>{tree?.commitId ? `Commit ${tree.commitId.slice(0, 8)}` : "Repository files"}</strong><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a file" /></div>{loading ? <div className="skeleton h-36" /> : entries.length ? entries.map((entry) => <button className="file-entry" key={entry.path} onClick={() => openEntry(entry)}><span>{entry.type === "directory" ? <FaFolder className="folder" /> : <FaFileAlt />}{entry.name}</span><small>{bytes(entry.size)}</small></button>) : <p className="empty">No files match this search.</p>}</section>{readme && !path && <section className="panel readme-panel"><header><FaFileAlt /> README.md</header><Markdown content={readme.content} /></section>}</>}</>}</main></>;
}

function Settings({ repository, isOwner, onSaved }) {
  const [name, setName] = useState(repository.name); const [description, setDescription] = useState(repository.description || "");
  if (!isOwner) return null;
  async function save(event) { event.preventDefault(); try { const response = await fetch(`${api}/repo/update/${repository._id}`, { method: "PUT", headers: { ...auth(), "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); onSaved(data.repository); toast.success("Repository settings saved"); } catch (error) { toast.error(error.message); } }
  return <form className="panel settings" onSubmit={save}><label>Repository name<input value={name} onChange={(e) => setName(e.target.value)} required /></label><label>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} /></label><button>Save changes</button></form>;
}
