import { useEffect, useMemo, useState } from "react";
import {
  FiDownload,
  FiSearch,
  FiShare2,
  FiTrash2,
  FiFileText,
  FiImage,
  FiArchive,
  FiFile,
  FiCheckCircle,
} from "react-icons/fi";

const defaultFiles = [
  {
    id: 1,
    name: "Project Report.pdf",
    type: "PDF",
    size: "2.4 MB",
    date: "Today",
  },
  {
    id: 2,
    name: "Project Documentation.docx",
    type: "DOCX",
    size: "1.8 MB",
    date: "Yesterday",
  },
  {
    id: 3,
    name: "Architecture.png",
    type: "PNG",
    size: "850 KB",
    date: "Yesterday",
  },
  {
    id: 4,
    name: "Database Backup.zip",
    type: "ZIP",
    size: "5.2 MB",
    date: "Aug 20, 2026",
  },
];

function MyFiles() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    const savedFiles =
      JSON.parse(localStorage.getItem("trustshare_files")) || [];

    if (savedFiles.length === 0) {
      localStorage.setItem(
        "trustshare_files",
        JSON.stringify(defaultFiles)
      );

      setFiles(defaultFiles);
    } else {
      setFiles(savedFiles);
    }
  }, []);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch = file.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || file.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [files, search, filter]);

  const getFileIcon = (type) => {
    if (type === "PDF" || type === "DOCX") {
      return <FiFileText />;
    }

    if (type === "PNG" || type === "JPG" || type === "JPEG") {
      return <FiImage />;
    }

    if (type === "ZIP") {
      return <FiArchive />;
    }

    return <FiFile />;
  };

  const handleDelete = (id) => {
    const updatedFiles = files.filter(
      (file) => file.id !== id
    );

    setFiles(updatedFiles);

    localStorage.setItem(
      "trustshare_files",
      JSON.stringify(updatedFiles)
    );
  };

  const handleShare = (file) => {
    const existingShared =
      JSON.parse(
        localStorage.getItem("trustshare_shared_files")
      ) || [];

    const alreadyShared = existingShared.some(
      (sharedFile) => sharedFile.id === file.id
    );

    if (alreadyShared) {
      setShareMessage("This file is already shared.");
      return;
    }

    const sharedFile = {
      ...file,
      sharedBy: "You",
      permission: "DOWNLOAD",
      date: "Just now",
      expiry: "30 days",
    };

    localStorage.setItem(
      "trustshare_shared_files",
      JSON.stringify([sharedFile, ...existingShared])
    );

    setShareMessage(`${file.name} shared successfully.`);

    setTimeout(() => {
      setShareMessage("");
    }, 3000);
  };

  return (
    <div className="my-files-page">
      <div className="page-heading">
        <div>
          <h2>My Files</h2>
          <p>View and manage all your uploaded files.</p>
        </div>

        <a href="/upload" className="primary-button">
          Upload File
        </a>
      </div>

      {shareMessage && (
        <div className="upload-message success-message">
          <FiCheckCircle />
          <span>{shareMessage}</span>
        </div>
      )}

      <div className="file-toolbar">
        <div className="file-search">
          <FiSearch />

          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value)
          }
          className="file-filter"
        >
          <option value="All">All Files</option>
          <option value="PDF">PDF</option>
          <option value="DOCX">DOCX</option>
          <option value="PNG">PNG</option>
          <option value="JPG">JPG</option>
          <option value="ZIP">ZIP</option>
        </select>
      </div>

      <div className="files-card">
        <div className="files-card-header">
          <div>
            <h3>All Files</h3>
            <span>{filteredFiles.length} files</span>
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="files-empty">
            <FiFile />
            <h3>No files found</h3>
            <p>Try changing your search or filter.</p>
          </div>
        ) : (
          <div className="files-list">
            {filteredFiles.map((file) => (
              <div className="file-row" key={file.id}>
                <div
                  className={`file-type-icon ${file.type.toLowerCase()}`}
                >
                  {getFileIcon(file.type)}
                </div>

                <div className="file-row-info">
                  <strong>{file.name}</strong>

                  <span>
                    {file.type} • {file.size} • {file.date}
                  </span>
                </div>

                <div className="file-row-actions">
                  <button title="Download">
                    <FiDownload />
                  </button>

                  <button
                    title="Share"
                    onClick={() => handleShare(file)}
                  >
                    <FiShare2 />
                  </button>

                  <button
                    title="Delete"
                    className="delete-action"
                    onClick={() => handleDelete(file.id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyFiles;