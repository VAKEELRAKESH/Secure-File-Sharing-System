import {
  FiSearch,
  FiBell,
  FiUser,
  FiChevronDown,
} from "react-icons/fi";

function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1>Dashboard</h1>
        <p>Welcome back to TrustShare</p>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search files..."
            aria-label="Search files"
          />
        </div>

        <button className="notification-button" aria-label="Notifications">
          <FiBell />
          <span className="notification-dot"></span>
        </button>

        <div className="user-profile">
          <div className="user-avatar">
            <FiUser />
          </div>

          <div className="user-info">
            <strong>User</strong>
            <span>Member</span>
          </div>

          <FiChevronDown className="profile-arrow" />
        </div>
      </div>
    </header>
  );
}

export default Topbar;