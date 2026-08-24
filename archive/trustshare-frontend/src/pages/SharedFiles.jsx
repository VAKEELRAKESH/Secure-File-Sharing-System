import { useEffect, useState } from "react";
import {
  FiFileText,
  FiImage,
  FiDownload,
  FiEye,
  FiClock,
  FiUser,
} from "react-icons/fi";

const defaultSharedFiles = [
  {
    id: "demo-1",
    name: "Project Report.pdf",
    type: "PDF",
    size: "2.4 MB",
    sharedBy: "Admin",
    permission: "VIEW",
    date: "Aug 22, 2026",
    expiry: "Sep 22, 2026",
  },
  {
    id: "demo-2",
    name: "Project Documentation.docx",
    type: "DOCX",
    size: "1.8 MB",
    sharedBy: "Team Member",
    permission: "DOWNLOAD",
    date: "Aug 21, 2026",
    expiry: "Sep 20, 2026",
  },
  {
    id: "demo-3",
    name: "Architecture.png",
    type: "PNG",
    size: "850 KB",
    sharedBy: "Admin",
    permission: "VIEW",
    date: "Aug 20, 2026",
    expiry: "Sep 20, 2026",
  },
];

function SharedFiles() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const savedSharedFiles =
      JSON.parse(
        localStorage.getItem("trustshare_shared_files")
      ) || [];

    setFiles([
      ...savedSharedFiles,
      ...defaultSharedFiles,
    ]);
  }, []);

  const getFileIcon = (type) => {
    if (
      type === "PNG" ||
      type === "JPG" ||
      type === "JPEG"
    ) {
      return <FiImage />;
    }

    return <FiFileText />;
  };

  return (
    <div className="shared-files-page">
      <div className="page-heading">
        <div>
          <h2>Shared Files</h2>
          <p>Files that have been shared with you.</p>
        </div>
      </div>

      <div className="shared-summary">
        <div className="shared-summary-card">
          <strong>{files.length}</strong>
          <span>Total Shared Files</span>
        </div>

        <div className="shared-summary-card">
          <strong>
            {
              files.filter(
                (file) => file.permission === "VIEW"
              ).length
            }
          </strong>
          <span>View Access</span>
        </div>

        <div className="shared-summary-card">
          <strong>
            {
              files.filter(
                (file) =>
                  file.permission === "DOWNLOAD"
              ).length
            }
          </strong>
          <span>Download Access</span>
        </div>
      </div>

      <div className="shared-files-card">
        <div className="shared-files-header">
          <div>
            <h3>Shared With Me</h3>
            <span>
              Files available through secure sharing
            </span>
          </div>
        </div>

        <div className="shared-file-list">
          {files.map((file, index) => (
            <div
              className="shared-file-row"
              key={`${file.id}-${index}`}
            >
              <div
                className={`shared-file-icon ${file.type.toLowerCase()}`}
              >
                {getFileIcon(file.type)}
              </div>

              <div className="shared-file-info">
                <strong>{file.name}</strong>

                <span>
                  {file.type} • {file.size}
                </span>
              </div>

              <div className="shared-by">
                <FiUser />

                <div>
                  <small>Shared by</small>
                  <strong>{file.sharedBy}</strong>
                </div>
              </div>

              <div className="permission-section">
                <small>Permission</small>

                <span
                  className={`permission-badge ${file.permission.toLowerCase()}`}
                >
                  {file.permission}
                </span>
              </div>

              <div className="expiry-section">
                <small>
                  <FiClock />
                  Expires
                </small>

                <span>{file.expiry}</span>
              </div>

              <div className="shared-actions">
                <button title="View">
                  <FiEye />
                </button>

                <button title="Download">
                  <FiDownload />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SharedFiles;