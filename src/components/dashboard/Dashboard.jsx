import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Welcome, {userName}!</h1>
        <p className="status-badge">Logged In via API</p>
        <p className="dashboard-desc">
          You are securely authenticated. Your JWT token has been verified by the backend.
        </p>

        {token && (
          <div className="token-preview">
            <span className="token-label">JWT Token:</span>
            <code>{token.slice(0, 32)}...</code>
          </div>
        )}

        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
