import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeamManagement from "./TeamManagement";
import InventoryManagement from "./InventoryManagement";
import CustomersManagement from "./CustomersManagement";
import { LanguageSwitch, useLanguage } from "../../i18n";
import {
  createServiceRequest,
  getDashboardStats,
  getServiceRequests,
  updateServiceRequestStatus,
  updateServiceRequestAssignmentAndPriority,
} from "../../api/dashboard";
import { getTechnicians } from "../../api/technicians";
import { clearAuthSession, getAuthSession } from "../../auth/session";
import { createExcelWorkbook } from "../../utils/createExcelWorkbook";
import "./Dashboard.css";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "dashboard", target: "top" },
  { label: "Today", icon: "clock", target: "kanban-board" },
  { label: "Requests", icon: "requests", target: "request-queue" },
  { label: "Schedule", icon: "schedule", target: "kanban-board" },
  { label: "Team", icon: "team", target: "team-management" },
  { label: "Customers", icon: "team" },
  { label: "Inventory", icon: "inventory" },
  { label: "Reports", icon: "reports", target: "overview-stats" },
  { label: "Settings", icon: "settings" },
];

const STATUS_OPTIONS = [
  ["New", "New request"],
  ["PendingApproval", "Pending approval"],
  ["AwaitingParts", "Awaiting parts"],
  ["Scheduled", "Scheduled"],
  ["InProgress", "In progress"],
  ["TechnicianPending", "Technician pending"],
  ["Rejected", "Rejected"],
  ["Completed", "Completed"],
];

const ICONS = {
  dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="11" width="7" height="10" rx="1.5" /><rect x="3" y="14" width="8" height="7" rx="1.5" /></>,
  requests: <><path d="M7 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" /><path d="M14 3.5V8h5M8 12h8M8 16h6" /></>,
  schedule: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h3M8 17h6" /></>,
  team: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  inventory: <><rect x="4" y="4" width="16" height="17" rx="2" /><path d="M9 4V2.8h6V4M8 9h8M8 13h8M8 17h5" /></>,
  reports: <><path d="M4 19.5V4M4 19.5h17" /><path d="m7 15 4-4 3 2 5-6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.2 1-1.4 2.4-1.5-.6a8.4 8.4 0 0 1-1.7 1l-.3 1.6h-2.8l-.3-1.6a8.4 8.4 0 0 1-1.7-1l-1.5.6-1.4-2.4 1.2-1a7.1 7.1 0 0 1 0-2l-1.2-1 1.4-2.4 1.5.6a8.4 8.4 0 0 1 1.7-1l.3-1.6h2.8l.3 1.6a8.4 8.4 0 0 1 1.7 1l1.5-.6 1.4 2.4-1.2 1a7.1 7.1 0 0 1-.1 1.9Z" transform="translate(-1 -1) scale(1.08)" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  moon: <><path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  check: <><path d="m5 12 4 4L19 6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  wrench: <><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L15 12l-3-3 2.7-2.7Z" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  filter: <><path d="M4 6h16M7 12h10m-7 6h4" /></>,
  dots: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9a7 7 0 0 1 11.6-2.6L20 9M4 15l2.9 2.6A7 7 0 0 0 18.5 15" /></>,
};

function Icon({ name, size = 18, ...props }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>{ICONS[name]}</svg>;
}

function statusLabel(status) {
  return (STATUS_OPTIONS.find(([value]) => value === status)?.[1] || status || "Unknown");
}

function statusClass(status) {
  return `status-${String(status || "new").toLowerCase()}`;
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function formatServiceDate(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(new Date(year, month - 1, day));
}

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function requestDateKey(value) {
  if (!value) return "";
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? text.slice(0, 10) : localDateKey(date);
}

function Dashboard() {
  const navigate = useNavigate();
  const session = getAuthSession();
  const userName = session?.userName || "Service manager";
  const token = session?.token;
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [queueStatus, setQueueStatus] = useState("all");
  const [boardStatus, setBoardStatus] = useState("all");
  const [boardSearch, setBoardSearch] = useState("");
  const [boardToday, setBoardToday] = useState(false);
  const [boardPage, setBoardPage] = useState(1);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [managerRemark, setManagerRemark] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dashboardTheme") === "dark");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!profileMenuOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileMenuOpen]);

  const refreshDashboard = async () => {
    if (!token) return;
    setLoading(true);
    setPageError("");
    try {
      const [nextStats, nextRequests] = await Promise.all([
        getDashboardStats(token),
        getServiceRequests(token),
      ]);
      setStats(nextStats);
      setRequests(Array.isArray(nextRequests) ? nextRequests : []);
    } catch (error) {
      if (error.message.includes("401") || error.message.includes("403")) {
    clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }
      setPageError(error.message || "We couldn't load the service dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;
    Promise.all([getDashboardStats(token), getServiceRequests(token)])
      .then(([nextStats, nextRequests]) => {
        if (cancelled) return;
        setStats(nextStats);
        setRequests(Array.isArray(nextRequests) ? nextRequests : []);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.message.includes("401") || error.message.includes("403")) {
      clearAuthSession();
          navigate("/login", { replace: true });
          return;
        }
        setPageError(error.message || "We couldn't load the service dashboard.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token, navigate]);
  useEffect(() => {
    localStorage.setItem("dashboardTheme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getTechnicians(token)
      .then((items) => { if (!cancelled && Array.isArray(items)) setTechnicians(items); })
      .catch(() => { if (!cancelled) setTechnicians([]); });
    return () => { cancelled = true; };
  }, [token]);


  const searchedRequests = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return requests;
    return requests.filter((request) => [
      request.requestNumber,
      request.customerName,
      request.appliance,
      request.issue,
      request.assignedTechnician,
      statusLabel(request.status),
    ].some((value) => String(value || "").toLowerCase().includes(term)));
  }, [requests, search]);

  const invalidDateRange = Boolean(dateFrom && dateTo && dateFrom > dateTo);

  const closedRequests = useMemo(() => searchedRequests.filter((request) => ["Completed", "Rejected"].includes(request.status)), [searchedRequests]);

  const dateFilteredRequests = useMemo(() => closedRequests.filter((request) => {
    if (invalidDateRange) return false;
    const closedDate = requestDateKey(request.technicianActionAt || request.date);
    return (!dateFrom || closedDate >= dateFrom) && (!dateTo || closedDate <= dateTo);
  }), [closedRequests, dateFrom, dateTo, invalidDateRange]);

  const queueRequests = useMemo(() => dateFilteredRequests.filter((request) => {
    const matchesStatus = queueStatus === "all" || request.status === queueStatus;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  }), [dateFilteredRequests, queueStatus, priorityFilter]);

  const todayKey = localDateKey();
  const boardRequests = useMemo(() => {
    const term = boardSearch.trim().replace(/^#/, "").toLowerCase();
    return searchedRequests.filter((request) => {
      const matchesSearch = !term || String(request.requestNumber || "").toLowerCase().includes(term);
      const matchesStatus = boardStatus === "all" || request.status === boardStatus;
      const matchesToday = !boardToday || [request.preferredServiceDate, request.date, request.technicianActionAt]
        .some((value) => requestDateKey(value) === todayKey);
      return matchesSearch && matchesStatus && matchesToday;
    });
  }, [searchedRequests, boardSearch, boardStatus, boardToday, todayKey]);

  const todayCounts = useMemo(() => ({
    open: boardRequests.filter((request) => !["Completed", "Rejected"].includes(request.status)).length,
    closed: boardRequests.filter((request) => request.status === "Completed").length,
    rejected: boardRequests.filter((request) => request.status === "Rejected").length,
  }), [boardRequests]);

  const boardPageSize = 20;
  const boardTotalPages = Math.max(1, Math.ceil(boardRequests.length / boardPageSize));
  const displayedBoardPage = Math.min(boardPage, boardTotalPages);
  const visibleBoardRequests = boardRequests.slice((displayedBoardPage - 1) * boardPageSize, displayedBoardPage * boardPageSize);



  const updateSearch = (value) => { setCurrentPage(1); setBoardPage(1); setSearch(value); };
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(queueRequests.length / pageSize));
  const displayedPage = Math.min(currentPage, totalPages);
  const pageStart = queueRequests.length === 0 ? 0 : (displayedPage - 1) * pageSize;
  const visibleRequests = queueRequests.slice(pageStart, pageStart + pageSize);
  const exportRequests = () => {
    const columns = [
      ["Request number", (request) => request.requestNumber],
      ["Request date", (request) => request.date],
      ["Customer", (request) => request.customerName],
      ["Appliance", (request) => request.appliance],
      ["Issue", (request) => request.problemDescription || request.issue],
      ["Status", (request) => statusLabel(request.status)],
      ["Priority", (request) => request.priority],
      ["Technician", (request) => request.assignedTechnician],
      ["Customer phone", (request) => request.customerPhone],
      ["Service address", (request) => request.serviceAddress],
      ["Preferred service date", (request) => request.preferredServiceDate],
      ["Amount paid ($)", (request) => request.amountPaid],
      ["Closure remark", (request) => request.technicianNote],
      ["Closed at", (request) => request.technicianActionAt],
    ];
    const rows = [columns.map(([label]) => label), ...queueRequests.map((request) => columns.map(([, getValue]) => getValue(request)))];
    const blob = createExcelWorkbook(rows, 11);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `service-requests-${dateFrom || "all"}-to-${dateTo || "all"}.xlsx`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`Exported ${queueRequests.length} service requests to Excel.`);
    window.setTimeout(() => setNotice(""), 3200);
  };
  const openRequestDetails = (request) => { setSelectedRequest(request); setManagerRemark(request.managerNote || ""); };

  const updateAssignmentAndPriority = async (field, value) => {
    if (!selectedRequest || !token) return;
    const changes = {
      priority: field === "priority" ? value : selectedRequest.priority,
      assignedTechnician: field === "assignedTechnician" ? (value || null) : selectedRequest.assignedTechnician,
      managerNote: managerRemark,
    };
    setBusyId(selectedRequest.id);
    setPageError("");
    try {
      const updated = await updateServiceRequestAssignmentAndPriority(token, selectedRequest.id, changes);
      setRequests((current) => current.map((item) => item.id === updated.id ? updated : item));
      setSelectedRequest(updated);
      setManagerRemark(updated.managerNote || "");
      setNotice(`Request #${updated.requestNumber} updated.`);
      window.setTimeout(() => setNotice(""), 3200);
    } catch (error) {
      setPageError(error.message || "The technician or priority could not be updated.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateRequest = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      customerName: String(formData.get("customerName") || "").trim(),
      appliance: String(formData.get("appliance") || "").trim(),
      issue: String(formData.get("issue") || "").trim(),
      priority: String(formData.get("priority") || "-"),
      assignedTechnician: String(formData.get("assignedTechnician") || "").trim() || null,
    };
    setBusyId("create");
    setPageError("");
    try {
      const created = await createServiceRequest(token, payload);
      setRequests((current) => [created, ...current]);
      setStats(await getDashboardStats(token));
      setShowCreate(false);
      setNotice(`Request #${created.requestNumber} was added to the queue.`);
      window.setTimeout(() => setNotice(""), 3200);
      form.reset();
    } catch (error) {
      setPageError(error.message || "The service request could not be created.");
    } finally {
      setBusyId(null);
    }
  };

  const handleNavigation = (item) => {
    setActiveNav(item.label);
    if (item.label === "Today") { setBoardToday(true); setBoardPage(1); }
    else if (item.label === "Schedule") { setBoardToday(false); setBoardPage(1); }
    if (item.label === "Team" || item.label === "Inventory") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (item.target) {
      window.setTimeout(() => document.getElementById(item.target)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const firstName = userName.split(/\s+/)[0] || "there";
  const statCards = [
    { label: t("Total active requests"), value: stats?.totalActiveRequests ?? "—", detail: t("Open service requests"), icon: "reports", tone: "mint" },
    { label: t("Pending approvals"), value: stats?.pendingApprovals ?? "—", detail: t("Waiting for review"), icon: "clock", tone: "amber" },
    { label: t("In-progress services"), value: stats?.inProgressServices ?? "—", detail: t("Technicians on the job"), icon: "wrench", tone: "blue" },
    { label: t("Completed jobs"), value: stats?.completedJobs ?? "—", detail: t("Jobs marked complete"), icon: "check", tone: "green" },
  ];

  return (
    <div className={`dashboard-shell${darkMode ? " is-dark" : ""}`} id="top">
      <aside className="dashboard-sidebar">
        <div className="brand-lockup">
          <img className="brand-logo" src="/dhc-logo.png" alt="DHC HomeCare Service Hub" />
          <div className="brand-copy"><strong>DHC HomeCare</strong><span>Service Hub · Damak</span></div>
        </div>

        <nav className="main-navigation" aria-label="Main navigation">
          <p className="nav-caption">WORKSPACE</p>
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.label}
              className={`nav-item${activeNav === item.label ? " is-active" : ""}`}
              onClick={() => handleNavigation(item)}
              disabled={!item.target && !["Inventory", "Customers"].includes(item.label)}
              aria-current={activeNav === item.label ? "page" : undefined}
              title={item.target || item.label === "Inventory" ? undefined : `${item.label} section`}
            >
              <Icon name={item.icon} size={18} />
              <span>{t(item.label)}</span>
              {item.label === "Requests" && stats?.totalActiveRequests > 0 && <span className="nav-count">{stats.totalActiveRequests}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="location-mark"><span className="location-dot" /><div><small>{t("Workspace location")}</small><strong>Damak, Jhapa</strong></div></div>
          <button type="button" className="sidebar-logout" onClick={handleLogout}><span>↗</span> {t("Log out")}</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <label className="global-search">
            <Icon name="search" size={18} />
            <input aria-label="Search service requests" value={search} onChange={(event) => updateSearch(event.target.value)} placeholder={t("Search requests, customers, appliances...")} />
            <kbd>⌘ K</kbd>
          </label>
          <div className="topbar-actions">
            <LanguageSwitch language={language} setLanguage={setLanguage} compact />
            <button type="button" className="icon-button" aria-label="Messages"><Icon name="mail" /></button>
            <button type="button" className="icon-button has-alert" aria-label="Notifications"><Icon name="bell" /><span /></button>
            <div className="profile-menu-wrap" ref={profileMenuRef}>
              <button
                type="button"
                className="profile-chip profile-menu-trigger"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen((open) => !open)}
              >
                <span className="profile-avatar">{initials(userName)}</span><span>{userName}</span><span className="chevron">⌄</span>
              </button>
              {profileMenuOpen && <div className="profile-menu" role="menu">
                <div className="profile-menu-user"><strong>{userName}</strong><span>Service manager</span></div>
                <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); handleLogout(); }}><span aria-hidden="true">↗</span> Log out</button>
              </div>}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {activeNav === "Customers" ? <CustomersManagement token={token} /> : activeNav === "Inventory" ? <InventoryManagement token={token} requests={requests} onRequestsChanged={refreshDashboard} /> : activeNav === "Team" ? <TeamManagement token={token} /> : <>
          <div className="page-heading">
              <div><p className="eyebrow">{t("Service operations")}</p><h1>{t("Dashboard")}</h1><p className="welcome-line">{t("Welcome back")}, <strong>{firstName}</strong>. {t("Here’s what’s happening today.")}</p></div>
            <div className="heading-actions">
              <button type="button" className="button button-quiet" onClick={refreshDashboard} disabled={loading}><Icon name="refresh" size={16} /> {t("Refresh")}</button>
              <button type="button" className="button button-dark-toggle" onClick={() => setDarkMode((value) => !value)}><Icon name={darkMode ? "sun" : "moon"} size={16} /> {t(darkMode ? "Light mode" : "Dark mode")}</button>
              <button type="button" className="button button-primary" onClick={() => setShowCreate(true)}><Icon name="plus" size={17} /> {t("New request")}</button>
            </div>
          </div>

          {pageError && <div className="dashboard-alert" role="alert"><span>{pageError}</span><button type="button" onClick={() => setPageError("")} aria-label="Dismiss error"><Icon name="close" size={16} /></button></div>}
          {notice && <div className="dashboard-notice" role="status"><Icon name="check" size={16} /> {notice}</div>}

          <section className="stats-grid" id="overview-stats" aria-label="Service overview">
            {statCards.map((card) => <article className="stat-card" key={card.label}>
              <div className={`stat-icon stat-icon-${card.tone}`}><Icon name={card.icon} size={21} /></div>
              <div className="stat-copy"><span>{card.label}</span><strong>{loading && !stats ? <i className="loading-value" /> : card.value}</strong><small>{card.detail}</small></div>
              {card.label === "Total active requests" && <span className="live-indicator"><i /> Live</span>}
            </article>)}
          </section>

          <div className="dashboard-workspace">
            <section className="panel board-panel" id="kanban-board">
              <div className="panel-heading board-heading">
                <div><h2>{t("Service board")}</h2><p>{boardToday ? t("All calls planned, opened or closed today") : t("Open any service call to assign a technician or review its status")}</p></div>
                <button type="button" className="icon-button panel-menu" aria-label="Refresh board" onClick={refreshDashboard}><Icon name="refresh" size={17} /></button>
              </div>
              <div className="service-board-tools">
                <label className="queue-search board-call-search"><Icon name="search" size={16}/><input aria-label="Search by call number" value={boardSearch} onChange={(event) => { setBoardPage(1); setBoardSearch(event.target.value); }} placeholder="Search call number"/></label>
                <label className="select-wrap"><Icon name="filter" size={15}/><select aria-label="Filter service board by status" value={boardStatus} onChange={(event) => { setBoardPage(1); setBoardStatus(event.target.value); }}><option value="all">All call statuses</option>{STATUS_OPTIONS.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <button type="button" className={`today-filter-button${boardToday ? " is-selected" : ""}`} aria-pressed={boardToday} onClick={() => { setBoardPage(1); setBoardToday((value) => !value); setActiveNav((value) => value === "Today" ? "Schedule" : "Today"); }}>Today</button>
                <span className="board-result-count">{boardRequests.length} {boardToday ? "today" : "total"}{boardToday && <small>{todayCounts.open} open · {todayCounts.closed + todayCounts.rejected} closed</small>}</span>
              </div>
              <div className="service-board-scroll">
                <div className="service-board-list">
                  <div className="service-board-row service-board-labels" aria-hidden="true"><span>Call</span><span>Customer / appliance</span><span>Issue</span><span>Status</span><span>Priority</span><span>Technician / visit</span></div>
                  {visibleBoardRequests.map((request) => <article className="service-board-row" key={request.id} role="button" tabIndex={0} aria-label={`Open call ${request.requestNumber}`} onClick={() => openRequestDetails(request)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openRequestDetails(request); } }}>
                    <span className="service-board-call"><b>#{request.requestNumber}</b><small>{formatDate(request.date)}</small></span>
                    <span className="service-board-customer"><b>{request.customerName}</b><small>{request.appliance}</small></span>
                    <span className="service-board-issue">{request.problemDescription || request.issue || "No issue details provided"}</span>
                    <span><span className={`status-pill ${statusClass(request.status)}`}>{statusLabel(request.status)}</span></span>
                    <span><span className={`priority-chip priority-${String(request.priority || "-").toLowerCase()}`}>{request.priority || "-"}</span></span>
                    <span className="service-board-technician"><b>{request.assignedTechnician || "Unassigned"}</b><small>{request.preferredServiceDate ? `Visit ${formatServiceDate(request.preferredServiceDate)}` : "Visit date not set"}</small></span>
                  </article>)}
                  {!loading && boardRequests.length === 0 && <div className="service-board-empty">{boardToday ? "No calls are scheduled, opened or closed today." : "No calls match these filters."}</div>}
                  {loading && requests.length === 0 && <div className="service-board-empty">Loading service calls…</div>}
                </div>
              </div>
              <div className="board-footer"><span><i className="footer-dot" /> Click a call to assign a technician or review details</span><div className="board-pagination"><button type="button" aria-label="Previous service calls" title="Previous calls" onClick={() => setBoardPage((page) => Math.max(1, page - 1))} disabled={displayedBoardPage <= 1}>←</button><span>Page {displayedBoardPage} of {boardTotalPages}</span><button type="button" aria-label="Next service calls" title="Next calls" onClick={() => setBoardPage((page) => Math.min(boardTotalPages, page + 1))} disabled={displayedBoardPage >= boardTotalPages}>→</button></div><button type="button" onClick={() => { setBoardPage(1); setBoardSearch(""); setBoardStatus("all"); setBoardToday(false); setSearch(""); }}>Clear filters</button></div>
            </section>

            <section className="panel queue-panel" id="request-queue">
              <div className="panel-heading">
                <div><h2>Service call closure status</h2><p>Completed and rejected calls with their final notes and payment details</p></div>
                <button type="button" className="button button-small button-outline" onClick={refreshDashboard} disabled={loading}><Icon name="refresh" size={15} /> Refresh</button>
              </div>
              <div className="queue-tools">
                <label className="queue-search"><Icon name="search" size={16} /><input aria-label="Search closed calls" value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search closed calls" /></label>
                <label className="select-wrap"><Icon name="filter" size={15} /><select aria-label="Filter closure status" value={queueStatus} onChange={(event) => { setCurrentPage(1); setQueueStatus(event.target.value); }}><option value="all">All closed calls</option><option value="Completed">Completed</option><option value="Rejected">Rejected</option></select></label>
                <label className="priority-select"><span className="sr-only">Filter by priority</span><select aria-label="Filter closed calls by priority" value={priorityFilter} onChange={(event) => { setCurrentPage(1); setPriorityFilter(event.target.value); }}><option value="all">All priorities</option><option value="High">High priority</option><option value="Medium">Medium priority</option><option value="Low">Low priority</option></select></label><label className="date-filter"><span>From closure date</span><input aria-label="Closure date from" type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => { setCurrentPage(1); setDateFrom(event.target.value); }} /></label><label className="date-filter"><span>Through closure date</span><input aria-label="Closure date through" type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => { setCurrentPage(1); setDateTo(event.target.value); }} /></label><button type="button" className="export-button" onClick={exportRequests} disabled={invalidDateRange || queueRequests.length === 0}>Export Excel ({queueRequests.length})</button>
              </div>
              <div className="queue-summary"><span>{invalidDateRange ? "Start date must be on or before end date." : `${queueRequests.length} closed calls`}</span><span>{closedRequests.filter((request) => request.status === "Completed").length} completed · {closedRequests.filter((request) => request.status === "Rejected").length} rejected</span></div>
              <div className="request-table-wrap">
                <table className="request-table">
                  <thead><tr><th>Call</th><th>Customer / appliance</th><th>Issue</th><th>Closure status</th><th>Priority</th><th>Paid</th><th>Closure remark</th><th>Closed date</th><th><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>
                    {visibleRequests.map((request) => <tr key={request.id}>
                      <td className="request-number">#{request.requestNumber}</td>
                      <td><strong>{request.customerName}</strong><small>{request.appliance}</small></td>
                      <td className="issue-cell">{request.problemDescription || request.issue}</td>
                      <td><span className={`status-pill ${statusClass(request.status)}`}>{statusLabel(request.status)}</span></td>
                      <td><span className={`priority-dot priority-${String(request.priority || "medium").toLowerCase()}`}>{request.priority}</span></td>
                      <td className="paid-cell">{request.status === "Completed" ? request.amountPaid == null ? "Not recorded" : `NPR ${Number(request.amountPaid).toFixed(2)}` : "—"}</td>
                      <td className="closure-cell" title={request.technicianNote || "No closure remark recorded"}>{request.technicianNote || "No remark recorded"}</td>
                      <td className="date-cell">{formatDate(request.technicianActionAt || request.date)}</td>
                      <td><button type="button" className="row-action" onClick={() => openRequestDetails(request)} aria-label={`View call ${request.requestNumber}`}><Icon name="dots" size={16} /></button></td>
                    </tr>)}
                    {!loading && queueRequests.length === 0 && <tr><td className="empty-state" colSpan="9">No closed calls match these filters.</td></tr>}
                    {loading && requests.length === 0 && <tr><td className="empty-state" colSpan="9">Loading closed calls...</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="queue-footer"><span>Showing {queueRequests.length === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + pageSize, queueRequests.length)} of {queueRequests.length} closed calls</span><div className="queue-pagination"><button type="button" aria-label="Previous closed calls" title="Previous calls" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={displayedPage <= 1}>←</button><span>Page {displayedPage} of {totalPages}</span><button type="button" aria-label="Next closed calls" title="Next calls" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={displayedPage >= totalPages}>→</button></div><button type="button" onClick={() => { setCurrentPage(1); setQueueStatus("all"); setPriorityFilter("all"); setSearch(""); setDateFrom(""); setDateTo(""); }}>Clear filters</button></div>
            </section>
          </div>
          <footer className="dashboard-footer"><span>SmartHome Service Hub</span><span>Dashboard data refreshes from SQL Server</span></footer>
          </>}
        </div>
      </main>

      {showCreate && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCreate(false); }}>
        <section className="request-modal" role="dialog" aria-modal="true" aria-labelledby="create-request-title">
          <div className="modal-heading"><div><p className="eyebrow">SERVICE WORKFLOW</p><h2 id="create-request-title">Create service request</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={() => setShowCreate(false)}><Icon name="close" /></button></div>
          <form className="request-form" onSubmit={handleCreateRequest}>
            <label>Customer name<input name="customerName" required maxLength="100" placeholder="e.g. Jamie Lee" /></label>
            <label>Appliance<input name="appliance" required maxLength="100" placeholder="e.g. Bosch dishwasher" /></label>
            <label>Issue<input name="issue" required maxLength="500" placeholder="Describe the issue" /></label>
            <div className="form-row"><label>Priority<select name="priority" defaultValue="-"><option value="-">– Not set</option><option>Low</option><option>Medium</option><option>High</option></select></label><label>Assign technician<select name="assignedTechnician" defaultValue=""><option value="">Leave unassigned</option>{technicians.map((technician) => <option key={technician.id} value={technician.name}>{technician.name}</option>)}</select></label></div>
            <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={busyId === "create"}>{busyId === "create" ? "Saving..." : "Create request"}</button></div>
          </form>
        </section>
      </div>}

      {selectedRequest && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRequest(null); }}>
        <section className="request-modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="request-detail-title">
          <div className="modal-heading"><div><p className="eyebrow">REQUEST #{selectedRequest.requestNumber}</p><h2 id="request-detail-title">{selectedRequest.appliance}</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={() => setSelectedRequest(null)}><Icon name="close" /></button></div>
          <p className="detail-issue">{selectedRequest.problemDescription||selectedRequest.issue}</p>
          <div className="detail-grid"><div><small>Customer</small><strong>{selectedRequest.customerName}</strong></div><div><small>Status</small><strong><span className={`status-pill ${statusClass(selectedRequest.status)}`}>{statusLabel(selectedRequest.status)}</span></strong></div><div><small>Priority</small><strong>{selectedRequest.priority}</strong></div><div><small>Technician</small><strong>{selectedRequest.assignedTechnician || "Unassigned"}</strong></div><div><small>Request date</small><strong>{formatDate(selectedRequest.date)}</strong></div>{selectedRequest.preferredServiceDate && <div><small>Customer requested visit</small><strong>{formatServiceDate(selectedRequest.preferredServiceDate)}</strong></div>}{selectedRequest.customerPhone && <div><small>Customer phone</small><strong>{selectedRequest.customerPhone}</strong></div>}{selectedRequest.serviceAddress && <div><small>Service address</small><strong>{selectedRequest.serviceAddress}</strong></div>}{selectedRequest.technicianNote && <div><small>{selectedRequest.status === "Completed" ? "Completion summary" : selectedRequest.status === "Rejected" ? "Rejection reason" : "Technician update"}</small><strong>{selectedRequest.technicianNote}</strong></div>}{selectedRequest.status === "Completed" && selectedRequest.amountPaid != null && <div className="detail-paid-amount"><small>Amount received by technician</small><strong>${Number(selectedRequest.amountPaid).toFixed(2)}</strong></div>}{selectedRequest.status === "Completed" && selectedRequest.technicianActionAt && <div><small>Call closed</small><strong>{new Date(selectedRequest.technicianActionAt).toLocaleString()}</strong></div>}</div>
          <label className="detail-status-field">Remark for technician<textarea value={managerRemark} maxLength={2000} onChange={(event) => setManagerRemark(event.target.value)} placeholder="Add context for the technician" /><small>This remark is sent with your next assignment, priority, or status change.</small></label>          <label className="detail-status-field">Change priority<select value={selectedRequest.priority || "-"} disabled={busyId === selectedRequest.id} onChange={(event) => updateAssignmentAndPriority("priority", event.target.value)}><option value="-">– Not set</option><option>Low</option><option>Medium</option><option>High</option></select></label>
          <label className="detail-status-field">Assign technician<select value={selectedRequest.assignedTechnician || ""} disabled={busyId === selectedRequest.id} onChange={(event) => updateAssignmentAndPriority("assignedTechnician", event.target.value)}><option value="">Unassigned</option>{selectedRequest.assignedTechnician && !technicians.some((technician) => technician.name === selectedRequest.assignedTechnician) && <option value={selectedRequest.assignedTechnician}>{selectedRequest.assignedTechnician} (current)</option>}{technicians.map((technician) => <option key={technician.id} value={technician.name}>{technician.name}</option>)}</select></label>
          <label className="detail-status-field">Update status<select value={selectedRequest.status} disabled={busyId === selectedRequest.id} onChange={async (event) => { const selected = selectedRequest; const status = event.target.value; setBusyId(selected.id); try { const updated = await updateServiceRequestStatus(token, selected.id, status, managerRemark); setRequests((current) => current.map((item) => item.id === updated.id ? updated : item)); setSelectedRequest(updated);
      setManagerRemark(updated.managerNote || ""); setStats(await getDashboardStats(token)); } catch (error) { setPageError(error.message); } finally { setBusyId(null); } }}>{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </section>
      </div>}
    </div>
  );
}

export default Dashboard;

