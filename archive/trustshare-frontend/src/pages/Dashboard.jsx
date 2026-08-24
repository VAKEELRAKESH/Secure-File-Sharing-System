import {
  FiFolder,
  FiShare2,
  FiHardDrive,
  FiActivity,
  FiUpload,
  FiArrowRight,
} from "react-icons/fi";

function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Manage your files securely from one place.</p>
        </div>

        <a href="/upload" className="primary-button">
          <FiUpload />
          Upload File
        </a>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FiFolder />
          </div>
          <div>
            <span>Total Files</span>
            <h3>24</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FiShare2 />
          </div>
          <div>
            <span>Shared Files</span>
            <h3>8</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <FiHardDrive />
          </div>
          <div>
            <span>Storage Used</span>
            <h3>2.4 GB</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <FiActivity />
          </div>
          <div>
            <span>Recent Activity</span>
            <h3>16</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="card-heading">
            <div>
              <h3>Recent Files</h3>
              <p>Your latest uploaded files</p>
            </div>

            <a href="/myfiles" className="view-link">
              View all
              <FiArrowRight />
            </a>
          </div>

          <div className="recent-file">
            <div className="file-symbol pdf">PDF</div>

            <div className="file-info">
              <strong>Project Report.pdf</strong>
              <span>2.4 MB • Today</span>
            </div>

            <span className="file-status">Uploaded</span>
          </div>

          <div className="recent-file">
            <div className="file-symbol doc">DOC</div>

            <div className="file-info">
              <strong>Project Documentation.docx</strong>
              <span>1.8 MB • Yesterday</span>
            </div>

            <span className="file-status">Uploaded</span>
          </div>

          <div className="recent-file">
            <div className="file-symbol image">IMG</div>

            <div className="file-info">
              <strong>Architecture.png</strong>
              <span>850 KB • Yesterday</span>
            </div>

            <span className="file-status">Uploaded</span>
          </div>
        </section>

        <section className="dashboard-card">
          <div className="card-heading">
            <div>
              <h3>Storage</h3>
              <p>Your storage overview</p>
            </div>
          </div>

          <div className="storage-circle">
            <div>
              <strong>24%</strong>
              <span>Used</span>
            </div>
          </div>

          <div className="storage-details">
            <div>
              <span>Used</span>
              <strong>2.4 GB</strong>
            </div>

            <div>
              <span>Available</span>
              <strong>7.6 GB</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="dashboard-card activity-card">
        <div className="card-heading">
          <div>
            <h3>Recent Activity</h3>
            <p>Your latest account activity</p>
          </div>
        </div>

        <div className="activity-item">
          <div className="activity-dot blue-dot"></div>
          <div>
            <strong>File uploaded</strong>
            <span>Project Report.pdf was uploaded</span>
          </div>
          <small>10 min ago</small>
        </div>

        <div className="activity-item">
          <div className="activity-dot green-dot"></div>
          <div>
            <strong>File shared</strong>
            <span>Project Documentation.docx was shared</span>
          </div>
          <small>1 hour ago</small>
        </div>

        <div className="activity-item">
          <div className="activity-dot orange-dot"></div>
          <div>
            <strong>File downloaded</strong>
            <span>Architecture.png was downloaded</span>
          </div>
          <small>3 hours ago</small>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;