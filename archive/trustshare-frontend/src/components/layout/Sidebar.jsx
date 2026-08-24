import {
  FiHome,
  FiUpload,
  FiFolder,
  FiShare2,
  FiBarChart2,
  FiBell,
  FiShield,
  FiLogOut,
} from "react-icons/fi";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">T</div>
        <div>
          <h2>TrustShare</h2>
          <span>Secure File Sharing</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-title">MAIN MENU</p>

        <a href="/" className="nav-item active">
          <FiHome />
          <span>Dashboard</span>
        </a>

        <a href="/upload" className="nav-item">
          <FiUpload />
          <span>Upload File</span>
        </a>

        <a href="/myfiles" className="nav-item">
          <FiFolder />
          <span>My Files</span>
        </a>

        <a href="/sharedfiles" className="nav-item">
          <FiShare2 />
          <span>Shared Files</span>
        </a>

        <a href="/analytics" className="nav-item">
          <FiBarChart2 />
          <span>Analytics</span>
        </a>

        <a href="/notifications" className="nav-item">
          <FiBell />
          <span>Notifications</span>
        </a>

        <p className="nav-title admin-title">ADMINISTRATION</p>

        <a href="/admin-dashboard" className="nav-item">
          <FiShield />
          <span>Admin Dashboard</span>
        </a>
      </nav>

      <div className="sidebar-bottom">
        <button className="logout-button">
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;