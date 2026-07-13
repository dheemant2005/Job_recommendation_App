import NavBar from "./components/NavBar";
import CompanyCard from "./components/CompanyCard";
import JobCard from "./components/JobCard";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";
import { getCompanies, updateCompany, deleteCompany, createCompany } from "./Services/CompanyService";
import { getJobs, updateJob, deleteJob, createJob } from "./Services/JobService";
import type { Company, CompanyPayload } from "./types/company";
import type { Job, JobPayload } from "./types/job";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import ResumeAnalyser from "./pages/ResumeAnalyser";
import JobMatch from "./pages/JobMatch";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserApplication from "./pages/UserApplication";

function App() {
  // Start loading=false so we don't get a blank screen before token check
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [authPage, setAuthPage] = useState<"login" | "register">("login");
  const [currentPage, setCurrentPage] = useState("home");

  const handleLogin = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    setToken(null);
    setCompanies([]);
    setJobs([]);
    setCurrentPage("home");
  };

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [companiesData, jobsData] = await Promise.all([
        getCompanies(),
        getJobs(),
      ]);
      setCompanies(companiesData);
      setJobs(jobsData);
    } catch (err) {
      // Don't block the UI — just log it. User can still use other pages.
      console.error("Failed to fetch data:", err);
      setError("Could not reach backend. Some features may be unavailable.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(companyId: number, company: CompanyPayload) {
    try {
      const updatedCompany = await updateCompany(companyId, company);
      setCompanies(prev =>
        prev.map(c => (c.id === updatedCompany.id ? updatedCompany : c))
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteCompany(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd(company: CompanyPayload) {
    try {
      const newCompany = await createCompany(company);
      setCompanies(prev => [...prev, newCompany]);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleJobEdit(jobId: number, job: JobPayload) {
    try {
      const updatedJob = await updateJob(jobId, job);
      setJobs(prev => prev.map(j => (j.id === updatedJob.id ? updatedJob : j)));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleJobDelete(id: number) {
    try {
      await deleteJob(id);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleJobAdd(job: JobPayload) {
    try {
      const newJob = await createJob(job);
      setJobs(prev => [...prev, newJob]);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // ── Auth Gates ──────────────────────────────────────────────────
  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {authPage === "login" ? (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthPage("register")}
          />
        ) : (
          <Register onSwitchToLogin={() => setAuthPage("login")} />
        )}
      </div>
    );
  }

  // ── Loading Spinner ─────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid var(--border)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ opacity: 0.6 }}>Loading TalentSpark…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Main App ────────────────────────────────────────────────────
  return (
    <>
      <NavBar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} />

      {/* Backend error banner (non-blocking) */}
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "var(--danger)",
            padding: "0.6rem 1.5rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.88rem",
            textAlign: "center",
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <span>⚠️ {error}</span>
          <button
            onClick={fetchData}
            style={{
              background: "var(--danger)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "0.25rem 0.6rem",
              cursor: "pointer",
              fontSize: "0.78rem",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {currentPage === "home" && (
        <>
          {/* Hero Banner */}
          <div style={{
            textAlign: "center",
            padding: "3rem 2rem 3.5rem",
            marginBottom: "1rem",
          }}>
            <h1 style={{
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              fontWeight: 800,
              marginBottom: "1rem",
              background: "var(--accent-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              display: "block",
              lineHeight: 1.1,
            }}>
              Find Your Next<br />Dream Job
            </h1>
            <p style={{ fontSize: "1.1rem", color: "var(--text)", maxWidth: 520, margin: "0 auto 2rem" }}>
              AI-powered job matching, resume analysis, and career coaching — all in one place.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => setCurrentPage("jobmatch")} style={{ padding: "0.75rem 1.75rem", fontSize: "0.95rem" }}>
                ✦ Find Matching Jobs
              </button>
              <button onClick={() => setCurrentPage("resume")} style={{ padding: "0.75rem 1.75rem", fontSize: "0.95rem" }}>
                Analyse My Resume
              </button>
            </div>
          </div>
          <CompanyCard
            companies={companies}
            jobs={jobs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
          <JobCard
            jobs={jobs}
            companies={companies}
            onEdit={handleJobEdit}
            onDelete={handleJobDelete}
            onAdd={handleJobAdd}
          />
        </>
      )}
      {currentPage === "chat" && <Chat />}
      {currentPage === "resume" && <ResumeAnalyser />}
      {currentPage === "jobmatch" && <JobMatch onNavigate={setCurrentPage} />}
      {currentPage === "userdashboard" && <UserDashboard onNavigate={setCurrentPage} />}
      {currentPage === "admindashboard" && <AdminDashboard />}
      {currentPage === "application" && <UserApplication onNavigate={setCurrentPage} />}
      <Footer />
    </>
  );
}

export default App;