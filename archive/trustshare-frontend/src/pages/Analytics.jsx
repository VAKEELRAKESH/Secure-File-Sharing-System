import {
  FiBarChart2,
  FiHardDrive,
  FiUpload,
  FiDownload,
  FiShare2,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const activityData = [
  { name: "Mon", uploads: 4, downloads: 2 },
  { name: "Tue", uploads: 7, downloads: 4 },
  { name: "Wed", uploads: 5, downloads: 6 },
  { name: "Thu", uploads: 9, downloads: 5 },
  { name: "Fri", uploads: 6, downloads: 8 },
  { name: "Sat", uploads: 8, downloads: 4 },
  { name: "Sun", uploads: 10, downloads: 7 },
];

const storageData = [
  { name: "PDF", storage: 35 },
  { name: "DOCX", storage: 25 },
  { name: "Images", storage: 20 },
  { name: "ZIP", storage: 12 },
  { name: "Other", storage: 8 },
];

function Analytics() {
  return (
    <div className="analytics-page">
      <div className="page-heading">
        <div>
          <h2>Analytics</h2>
          <p>Monitor your file activity and storage usage.</p>
        </div>
      </div>

      <div className="analytics-stats">
        <div className="analytics-stat-card">
          <div className="analytics-stat-icon blue">
            <FiBarChart2 />
          </div>
          <span>Total Files</span>
          <strong>24</strong>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon green">
            <FiUpload />
          </div>
          <span>Total Uploads</span>
          <strong>49</strong>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon orange">
            <FiDownload />
          </div>
          <span>Total Downloads</span>
          <strong>36</strong>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon purple">
            <FiShare2 />
          </div>
          <span>Shared Files</span>
          <strong>8</strong>
        </div>
      </div>

      <div className="analytics-grid">
        <section className="analytics-card large">
          <div className="analytics-card-heading">
            <div>
              <h3>Upload & Download Activity</h3>
              <p>Weekly file activity</p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="uploads"
                  stroke="#2563eb"
                  fill="#dbeafe"
                />

                <Area
                  type="monotone"
                  dataKey="downloads"
                  stroke="#16a34a"
                  fill="#dcfce7"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <h3>Storage by File Type</h3>
              <p>Storage distribution</p>
            </div>

            <FiHardDrive />
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="storage"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Analytics;