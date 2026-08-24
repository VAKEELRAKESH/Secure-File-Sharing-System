import {
  FiUsers,
  FiFile,
  FiHardDrive,
  FiDownload,
  FiShield,
  FiAlertTriangle,
} from "react-icons/fi";

const securityEvents = [
  {
    id: 1,
    event: "Successful login",
    user: "Admin",
    time: "10 minutes ago",
    status: "Success",
  },
  {
    id: 2,
    event: "File downloaded",
    user: "User",
    time: "35 minutes ago",
    status: "Success",
  },
  {
    id: 3,
    event: "Failed login attempt",
    user: "Unknown user",
    time: "1 hour ago",
    status: "Warning",
  },
  {
    id: 4,
    event: "File shared",
    user: "Admin",
    time: "2 hours ago",
    status: "Success",
  },
];

function AdminDashboard() {
  return (
    <div className="admin-dashboard-page">
      <div className="page-heading">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Monitor users, files, storage and security activity.</p>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <FiUsers />
          </div>
          <span>Total Users</span>
          <strong>128</strong>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <FiFile />
          </div>
          <span>Total Files</span>
          <strong>1,245</strong>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon orange">
            <FiHardDrive />
          </div>
          <span>Storage Used</span>
          <strong>68.4 GB</strong>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <FiDownload />
          </div>
          <span>Total Downloads</span>
          <strong>3,842</strong>
        </div>
      </div>

      <div className="admin-overview">
        <div className="admin-overview-card">
          <div className="admin-card-header">
            <div>
              <h3>Security Overview</h3>
              <p>Recent security events</p>
            </div>
            <FiShield />
          </div>

          <div className="security-list">
            {securityEvents.map((event) => (
              <div className="security-row" key={event.id}>
                <div className="security-icon">
                  {event.status === "Warning" ? (
                    <FiAlertTriangle />
                  ) : (
                    <FiShield />
                  )}
                </div>

                <div className="security-info">
                  <strong>{event.event}</strong>
                  <span>
                    {event.user} • {event.time}
                  </span>
                </div>

                <span
                  className={`security-status ${event.status.toLowerCase()}`}
                >
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-overview-card">
          <div className="admin-card-header">
            <div>
              <h3>System Summary</h3>
              <p>Current platform statistics</p>
            </div>
          </div>

          <div className="system-summary">
            <div>
              <span>Active Users</span>
              <strong>114</strong>
            </div>

            <div>
              <span>Active Shares</span>
              <strong>76</strong>
            </div>

            <div>
              <span>Expired Shares</span>
              <strong>12</strong>
            </div>

            <div>
              <span>Security Alerts</span>
              <strong>3</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;