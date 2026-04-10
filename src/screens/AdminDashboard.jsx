import React, { useEffect, useState } from "react";

// ── Inline styles & keyframes injected once ──────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --navy:   #0a1628;
    --navy2:  #0f2040;
    --sky:    #1e6bff;
    --sky-lt: #4d8fff;
    --gold:   #f0b429;
    --mint:   #00c48c;
    --rose:   #ff4d6d;
    --amber:  #f97316;
    --surface:#f4f6fb;
    --card:   #ffffff;
    --border: #e2e8f4;
    --text:   #0a1628;
    --muted:  #6b7a99;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { + font-family: 'Inter', sans-serif; background: var(--surface); color: var(--text); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: .5; transform: scale(.75); }
  }

  .fade-up { animation: fadeUp .45s ease both; }
  .fade-up:nth-child(1) { animation-delay: .05s; }
  .fade-up:nth-child(2) { animation-delay: .12s; }
  .fade-up:nth-child(3) { animation-delay: .19s; }
  .fade-up:nth-child(4) { animation-delay: .26s; }

  .card {
    background: var(--card);
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(10,22,40,.06), 0 4px 16px rgba(10,22,40,.06);
    border: 1px solid var(--border);
    transition: box-shadow .2s, transform .2s;
    position: relative;
  }
  .card:hover { box-shadow: 0 4px 24px rgba(10,22,40,.12); transform: translateY(-1px); }
  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--sky) 0%, var(--sky-lt) 50%, var(--gold) 100%);
    border-radius: 16px 16px 0 0;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .card:hover::before {
    opacity: 0.6;
  }

  select, input[type="date"] {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 9px 12px;
    width: 100%;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    appearance: none;
  }
  select:focus, input[type="date"]:focus {
    border-color: var(--sky);
    box-shadow: 0 0 0 3px rgba(30,107,255,.12);
  }

  button { cursor: pointer; font-family: 'DM Sans', sans-serif; }

  /* status pills */
  .pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; letter-spacing: .4px;
    padding: 4px 11px; border-radius: 999px;
    white-space: nowrap;
  }
  .pill-pending   { background: #fff7e0; color: #b45309; }
  .pill-progress  { background: #dbeafe; color: #1d4ed8; }
  .pill-resolved  { background: #d1fae5; color: #065f46; }
  .pill-rejected  { background: #ffe4e6; color: #9f1239; }
  .pill-default   { background: #f1f5f9; color: #475569; }

  /* sidebar accent bar */
  .accent-bar {
    position: absolute; left: 0; top: 12px; bottom: 12px;
    width: 4px; border-radius: 0 4px 4px 0;
  }

  /* modal backdrop */
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(10,22,40,.55);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
    animation: fadeUp .2s ease;
  }


    .main-container {
        width: 100%;
        max-width: none;
        margin: 0 auto;
        padding-left: 0;
        padding-right: 0;
    }

  .bottom-nav {
    max-width: 480px;
  }
  @media (min-width: 768px) {
    .bottom-nav {
      max-width: 1200px;
    }
  }

  /* loading skeleton */
`;

// ── Helpers ──────────────────────────────────────────────────────────────────
const pillClass = (status = "") => {
    const s = status.toLowerCase().replace(" ", "");
    const map = { pending: "pill-pending", inprogress: "pill-progress", resolved: "pill-resolved", rejected: "pill-rejected" };
    return "pill " + (map[s] || "pill-default");
};

const pillDot = (status = "") => {
    const s = status.toLowerCase().replace(" ", "");
    const colors = { pending: "#f0b429", inprogress: "#1e6bff", resolved: "#00c48c", rejected: "#ff4d6d" };
    return colors[s] || "#94a3b8";
};

const accentColor = (status = "") => {
    const s = status.toLowerCase().replace(" ", "");
    const colors = { pending: "#f0b429", inprogress: "#1e6bff", resolved: "#00c48c", rejected: "#ff4d6d" };
    return colors[s] || "#cbd5e1";
};

const fmt = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

// ── StatusModal (inline prompt replacement) ───────────────────────────────────
const StatusModal = ({ complaint, onClose, onSave }) => {
    const [val, setVal] = useState(complaint.status || "Pending");
    const options = ["Pending", "In Progress", "Resolved", "Rejected"];
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: "#fff", borderRadius: 20, padding: 28, width: "92%", maxWidth: 380,
                    boxShadow: "0 20px 60px rgba(10,22,40,.25)"
                }}
            >
                <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Update Status</p>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
                    #{complaint._id?.slice(-6).toUpperCase()} · {complaint.category}
                </p>
                <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
                    {options.map(o => (
                        <button
                            key={o}
                            onClick={() => setVal(o)}
                            style={{
                                padding: "11px 16px", borderRadius: 12, textAlign: "left", fontSize: 14, fontWeight: 500,
                                border: val === o ? "2px solid var(--sky)" : "1.5px solid var(--border)",
                                background: val === o ? "#eff6ff" : "#fff",
                                color: val === o ? "var(--sky)" : "var(--text)",
                                transition: "all .15s"
                            }}
                        >
                            <span style={{
                                display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                                background: pillDot(o), marginRight: 10, verticalAlign: "middle"
                            }} />
                            {o}
                        </button>
                    ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={onClose}
                        style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "1.5px solid var(--border)", background: "#fff", fontSize: 14, color: "var(--muted)" }}
                    >Cancel</button>
                    <button
                        onClick={() => onSave(val)}
                        style={{ flex: 2, padding: "10px 0", borderRadius: 12, border: "none", background: "var(--sky)", color: "#fff", fontSize: 14, fontWeight: 600 }}
                    >Save Changes</button>
                </div>
            </div>
        </div>
    );
};

// ── Detail Modal ──────────────────────────────────────────────────────────────
const DetailModal = ({ item, onClose }) => (
    <div className="modal-backdrop" onClick={onClose}>
        <div
            onClick={e => e.stopPropagation()}
            style={{
                background: "#fff", borderRadius: 20, width: "92%", maxWidth: 420,
                boxShadow: "0 20px 60px rgba(10,22,40,.25)", overflow: "hidden"
            }}
        >
            {/* colored top stripe */}
            <div style={{ height: 6, background: accentColor(item.status) }} />
            <div style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                    <div>
                        <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 19 }}>{item.category}</p>
                        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>#{item._id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <span className={pillClass(item.status)}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: pillDot(item.status), animation: "pulse-dot 2s infinite", display: "inline-block" }} />
                        {item.status || "Pending"}
                    </span>
                </div>

                <div style={{ display: "grid", gap: 12, fontSize: 13 }}>
                    {[
                        ["📍 Location", item.location || "Unknown"],
                        ["📅 Filed on", fmt(item.createdAt)],
                        ["📝 Details", item.details || "No additional details provided."],
                    ].map(([label, val]) => (
                        <div key={label} style={{ background: "var(--surface)", borderRadius: 12, padding: "10px 14px" }}>
                            <p style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, marginBottom: 3 }}>{label}</p>
                            <p style={{ color: "var(--text)", lineHeight: 1.5 }}>{val}</p>
                        </div>
                    ))}
                </div>

                {item.image && (
                    <img
                        src={`http://localhost:5000/uploads/${item.image}`}
                        alt="complaint"
                        style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12, marginTop: 14 }}
                    />
                )}

                <button
                    onClick={onClose}
                    style={{
                        marginTop: 20, width: "100%", padding: "12px 0", borderRadius: 12,
                        border: "none", background: "var(--navy)", color: "#fff", fontWeight: 600, fontSize: 14
                    }}
                >Close</button>
            </div>
        </div>
    </div>
);

// ── Stat Chip ─────────────────────────────────────────────────────────────────
const StatChip = ({ label, count, color }) => (
    <div style={{
        background: "#fff", border: "1px solid var(--border)", borderRadius: 14,
        padding: "12px 16px", minWidth: 0, flex: "1 1 0"
    }}>
        <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "Syne,sans-serif", color }}>{count}</p>
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, whiteSpace: "nowrap" }}>{label}</p>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [updatingComplaint, setUpdatingComplaint] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [activeNav, setActiveNav] = useState("Complaints");

    const itemsPerPage = 4;

    const filteredComplaints = complaints.filter(c =>
        (categoryFilter === "" || c.category === categoryFilter) &&
        (statusFilter === "" || c.status === statusFilter)
    );

    const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / itemsPerPage));
    const currentItems = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const counts = {
        total: complaints.length,
        pending: complaints.filter(c => c.status?.toLowerCase() === "pending").length,
        inProgress: complaints.filter(c => c.status?.toLowerCase() === "in progress").length,
        resolved: complaints.filter(c => c.status?.toLowerCase() === "resolved").length,
    };

    useEffect(() => {
        const fetchComplaints = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log("Fetching complaints from http://localhost:5000/api/complaints");
                const res = await fetch("http://localhost:5000/api/complaints");

                if (!res.ok) {
                    throw new Error(`Server error: ${res.status} ${res.statusText}`);
                }

                const data = await res.json();
                console.log("Fetched complaints:", data);
                setComplaints(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message || "Failed to load complaints");
                setComplaints([]);
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, []);

    const handleSaveStatus = async (newStatus) => {
        const id = updatingComplaint._id;
        try {
            const res = await fetch(`http://localhost:5000/api/complaints/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Update failed");
            const updated = await res.json();
            setComplaints(prev => prev.map(c => c._id === id ? updated : c));
            setUpdatingComplaint(null);
        } catch {
            alert("Error updating status");
        }
    };

    const navItems = [
        { icon: "📋", label: "Complaints" },
        { icon: "🏛️", label: "Departments" },
        { icon: "📊", label: "Stats" },
        { icon: "⚙️", label: "Settings" },
    ];

    return (
        <>
            <style>{GLOBAL_CSS}</style>

            <div className="main-container" style={{ background: "var(--surface)", minHeight: "100vh", paddingBottom: 40 }}>

                {/* ── HEADER ── */}
                <header style={{
                    background: "#fff",
                    padding: "16px 20px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    position: "sticky", top: 0, zIndex: 50,
                    boxShadow: "0 4px 24px rgba(10,22,40,.3)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: "linear-gradient(135deg, var(--sky), #0044cc)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 16, boxShadow: "0 2px 8px rgba(30,107,255,.5)"
                        }}>🏛️</div>
                        <div>
                            <p style={{
                                fontFamily: "Syne, sans-serif",
                                fontWeight: 700,          // font-bold
                                fontSize: "20px",         // text-xl (~20px)
                                color: "var(--primary)",  // text-primary
                                letterSpacing: "-0.025em" // tracking-tight
                            }}>Complaint Setu</p>
                            <p style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Admin Dashboard</p>
                        </div>
                    </div>
                    <button style={{
                        width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border)",
                        background: "var(--surface)", color: "var(--text)", fontSize: 16, display: "flex",
                        alignItems: "center", justifyContent: "center"
                    }}>☰</button>
                </header>

                {/* ── STAT STRIP ── */}
                <div style={{ padding: "16px 16px 0", display: "flex", gap: 10 }}>
                    <StatChip label="Total" count={counts.total} color="var(--navy)" />
                    <StatChip label="Pending" count={counts.pending} color="#b45309" />
                    <StatChip label="In Progress" count={counts.inProgress} color="var(--sky)" />
                    <StatChip label="Resolved" count={counts.resolved} color="var(--mint)" />
                </div>

                {/* ── SECTION TITLE ── */}
                <div style={{ padding: "20px 16px 0" }}>
                    <p style={{
                        fontFamily: "Syne, sans-serif",
                        fontWeight: 700,          // font-bold
                        fontSize: "20px",         // text-xl (~20px)
                        color: "var(--primary)",  // text-primary
                        letterSpacing: "-0.025em" // tracking-tight
                    }}>All Complaints</p>
                    <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>Manage and track citizen grievances</p>
                </div>

                {/* ── FILTERS ── */}
                <div style={{ padding: "14px 16px 0" }}>
                    <div className="card" style={{ padding: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>Filters</p>
                            <button
                                onClick={() => { setCategoryFilter(""); setStatusFilter(""); setCurrentPage(1); }}
                                style={{ fontSize: 12, color: "var(--sky)", background: "none", border: "none", fontWeight: 500 }}
                            >Clear all</button>
                        </div>
                        <div style={{ display: "grid", gap: 10 }}>
                            <div style={{ position: "relative" }}>
                                <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}>
                                    <option value="">All Categories</option>
                                    {["Water Issues", "Electricity", "Roads & Potholes", "Sanitation", "Street Lights"].map(o => <option key={o}>{o}</option>)}
                                </select>
                                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)", fontSize: 12 }}>▾</span>
                            </div>
                            <div style={{ position: "relative" }}>
                                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                                    <option value="">All Statuses</option>
                                    {["Pending", "In Progress", "Resolved", "Rejected"].map(o => <option key={o}>{o}</option>)}
                                </select>
                                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)", fontSize: 12 }}>▾</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <input type="date" placeholder="From" />
                                <input type="date" placeholder="To" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── COMPLAINT CARDS ── */}
                <div style={{ padding: "14px 16px 0", display: "grid", gap: 12 }}>

                    {loading && [1, 2, 3].map(i => (
                        <div key={i} className="card" style={{ padding: 20, display: "grid", gap: 10 }}>
                            <div className="skeleton" style={{ height: 14, width: "60%" }} />
                            <div className="skeleton" style={{ height: 12, width: "40%" }} />
                            <div className="skeleton" style={{ height: 12, width: "80%" }} />
                        </div>
                    ))}

                    {error && (
                        <div style={{ background: "#fff0f3", border: "1.5px solid #fecdd3", borderRadius: 14, padding: 16, color: "#9f1239", fontSize: 13 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {!loading && !error && filteredComplaints.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)", fontSize: 14 }}>
                            <p style={{ fontSize: 32, marginBottom: 10 }}>📭</p>
                            No complaints found.
                        </div>
                    )}

                    {currentItems.map((item, i) => (
                        <div
                            key={item._id}
                            className="card fade-up"
                            style={{
                                padding: "20px 20px 20px 28px",
                                position: "relative",
                                overflow: "hidden",
                                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
                                border: "1px solid rgba(226,232,244,0.8)",
                                boxShadow: "0 4px 20px rgba(10,22,40,0.08), 0 1px 3px rgba(10,22,40,0.04)",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px) scale(1.01)";
                                e.currentTarget.style.boxShadow = "0 8px 32px rgba(10,22,40,0.12), 0 2px 8px rgba(10,22,40,0.06)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0) scale(1)";
                                e.currentTarget.style.boxShadow = "0 4px 20px rgba(10,22,40,0.08), 0 1px 3px rgba(10,22,40,0.04)";
                            }}
                        >
                            <div className="accent-bar" style={{
                                background: accentColor(item.status),
                                boxShadow: `0 0 12px ${accentColor(item.status)}40`
                            }} />

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        marginBottom: 6
                                    }}>
                                        <span style={{
                                            fontSize: 11,
                                            color: "var(--muted)",
                                            background: "var(--surface)",
                                            padding: "2px 8px",
                                            borderRadius: 6,
                                            letterSpacing: "0.5px",
                                            fontWeight: 500
                                        }}>
                                            #{item._id?.slice(-8).toUpperCase()}
                                        </span>
                                        <div style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: "50%",
                                            background: accentColor(item.status),
                                            boxShadow: `0 0 8px ${accentColor(item.status)}60`
                                        }} />
                                    </div>
                                    <h3 style={{
                                        fontFamily: "Syne,sans-serif",
                                        fontWeight: 700,
                                        fontSize: 18,
                                        color: "var(--navy)",
                                        margin: 0,
                                        lineHeight: 1.2
                                    }}>
                                        {item.category || "Uncategorised"}
                                    </h3>
                                </div>
                                <span className={pillClass(item.status)} style={{
                                    fontSize: 11,
                                    padding: "6px 12px",
                                    borderRadius: 20,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                                }}>
                                    <span style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: "50%",
                                        background: pillDot(item.status),
                                        display: "inline-block",
                                        marginRight: 6,
                                        animation: item.status?.toLowerCase() === "in progress" ? "pulse-dot 1.6s infinite" : "none",
                                        boxShadow: `0 0 6px ${pillDot(item.status)}80`
                                    }} />
                                    {item.status || "Pending"}
                                </span>
                            </div>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 16,
                                fontSize: 13,
                                color: "var(--muted)",
                                marginBottom: 20
                            }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    background: "var(--surface)",
                                    padding: "8px 12px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(226,232,244,0.5)"
                                }}>
                                    <span style={{ fontSize: 14 }}>📍</span>
                                    <div>
                                        <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, fontWeight: 500 }}>LOCATION</p>
                                        <p style={{ margin: 0, color: "var(--text)", fontWeight: 500 }}>{item.location || "Unknown"}</p>
                                    </div>
                                </div>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    background: "var(--surface)",
                                    padding: "8px 12px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(226,232,244,0.5)"
                                }}>
                                    <span style={{ fontSize: 14 }}>📅</span>
                                    <div>
                                        <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, fontWeight: 500 }}>DATE FILED</p>
                                        <p style={{ margin: 0, color: "var(--text)", fontWeight: 500 }}>{fmt(item.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                display: "flex",
                                gap: 12,
                                marginTop: "auto"
                            }}>
                                <button
                                    onClick={() => setUpdatingComplaint(item)}
                                    style={{
                                        flex: 1,
                                        padding: "12px 16px",
                                        borderRadius: 12,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        border: "1.5px solid var(--sky)",
                                        background: "linear-gradient(135deg, #fff 0%, #f8fafc 100%)",
                                        color: "var(--sky)",
                                        transition: "all 0.2s ease",
                                        boxShadow: "0 2px 8px rgba(30,107,255,0.1)",
                                        position: "relative",
                                        overflow: "hidden"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)";
                                        e.target.style.transform = "translateY(-1px)";
                                        e.target.style.boxShadow = "0 4px 16px rgba(30,107,255,0.2)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = "linear-gradient(135deg, #fff 0%, #f8fafc 100%)";
                                        e.target.style.transform = "translateY(0)";
                                        e.target.style.boxShadow = "0 2px 8px rgba(30,107,255,0.1)";
                                    }}
                                >
                                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                        <span>✏️</span>
                                        <span>Update Status</span>
                                    </span>
                                </button>
                                <button
                                    onClick={() => setSelectedComplaint(item)}
                                    style={{
                                        flex: 1.5,
                                        padding: "12px 16px",
                                        borderRadius: 12,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        border: "1.5px solid var(--sky)",
                                        background: "linear-gradient(135deg, var(--sky) 0%, #1a5fb4 100%)",
                                        color: "#fff",
                                        transition: "all 0.2s ease",
                                        boxShadow: "0 2px 8px rgba(30,107,255,0.3)",
                                        position: "relative",
                                        overflow: "hidden"
                                    }}

                                    onMouseLeave={(e) => {
                                        e.target.style.background = "linear-gradient(135deg, var(--sky) 0%, #1a5fb4 100%)";
                                        e.target.style.transform = "translateY(0)";
                                        e.target.style.boxShadow = "0 2px 8px rgba(30,107,255,0.3)";
                                    }}
                                >
                                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                        <span>👁️</span>
                                        <span>View Details</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── PAGINATION ── */}
                {!loading && filteredComplaints.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px" }}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            style={{
                                padding: "8px 16px", borderRadius: 10, border: "1.5px solid var(--border)",
                                background: currentPage === 1 ? "var(--surface)" : "#fff",
                                color: currentPage === 1 ? "var(--muted)" : "var(--navy)",
                                fontSize: 13, fontWeight: 500
                            }}
                        >← Prev</button>
                        <div style={{ display: "flex", gap: 6 }}>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button
                                    key={n}
                                    onClick={() => setCurrentPage(n)}
                                    style={{
                                        width: 32, height: 32, borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600,
                                        background: n === currentPage ? "var(--sky)" : "var(--surface)",
                                        color: n === currentPage ? "#fff" : "var(--muted)",
                                        transition: "background .15s"
                                    }}
                                >{n}</button>
                            ))}
                        </div>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            style={{
                                padding: "8px 16px", borderRadius: 10, border: "1.5px solid var(--border)",
                                background: currentPage === totalPages ? "var(--surface)" : "#fff",
                                color: currentPage === totalPages ? "var(--muted)" : "var(--navy)",
                                fontSize: 13, fontWeight: 500
                            }}
                        >Next →</button>
                    </div>
                )}

                {/* ── BOTTOM NAV ── */}
                <nav className="bottom-nav" style={{
                    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
                    width: "100%",
                    background: "rgba(255,255,255,.92)", backdropFilter: "blur(16px)",
                    borderTop: "1px solid var(--border)",
                    display: "flex", justifyContent: "space-around", padding: "8px 0 12px",
                    boxShadow: "0 -4px 20px rgba(10,22,40,.08)"
                }}>
                    {navItems.map(({ icon, label }) => {
                        const active = activeNav === label;
                        return (
                            <button
                                key={label}
                                onClick={() => setActiveNav(label)}
                                style={{
                                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                                    background: "none", border: "none", padding: "4px 16px",
                                    color: active ? "var(--sky)" : "var(--muted)"
                                }}
                            >
                                <span style={{ fontSize: active ? 20 : 18, transition: "font-size .15s" }}>{icon}</span>
                                <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: ".3px" }}>{label}</span>
                                {active && <span style={{ width: 16, height: 2, borderRadius: 2, background: "var(--sky)" }} />}
                            </button>
                        );
                    })}
                </nav>

                {/* ── MODALS ── */}
                {selectedComplaint && (
                    <DetailModal item={selectedComplaint} onClose={() => setSelectedComplaint(null)} />
                )}
                {updatingComplaint && (
                    <StatusModal
                        complaint={updatingComplaint}
                        onClose={() => setUpdatingComplaint(null)}
                        onSave={handleSaveStatus}
                    />
                )}

            </div>
        </>
    );
};

export default AdminDashboard;