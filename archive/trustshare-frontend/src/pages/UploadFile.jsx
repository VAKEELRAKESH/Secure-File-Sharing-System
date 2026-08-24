import {
  FiUploadCloud,
  FiFile,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { useState } from "react";

function UploadFile() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (!file) return;

    setSelectedFile(file);
    setMessage("");
  };

  const handleInputChange = (event) => {
    const file = event.target.files[0];
    handleFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files[0];
    handleFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setMessage("");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${sizes[index]}`;
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }

    const newFile = {
      id: Date.now(),
      name: selectedFile.name,
      type: selectedFile.name.split(".").pop().toUpperCase(),
      size: formatFileSize(selectedFile.size),
      date: "Just now",
    };

    const existingFiles =
      JSON.parse(localStorage.getItem("trustshare_files")) || [];

    localStorage.setItem(
      "trustshare_files",
      JSON.stringify([newFile, ...existingFiles])
    );

    setMessage("File uploaded successfully.");

    setSelectedFile(null);
  };

  return (
    <div className="upload-page">
      <div className="page-heading">
        <div>
          <h2>Upload File</h2>
          <p>Upload your files securely to TrustShare.</p>
        </div>
      </div>

      <div className="upload-card">
        <div
          className={`upload-drop-zone ${
            dragActive ? "drag-active" : ""
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <div className="upload-icon">
            <FiUploadCloud />
          </div>

          <h3>Drop your file here</h3>

          <p>or choose a file from your computer</p>

          <label className="browse-button">
            Browse Files
            <input
              type="file"
              onChange={handleInputChange}
              hidden
            />
          </label>

          <span className="upload-supported">
            Supported files: PDF, DOCX, XLSX, PNG, JPG, ZIP
          </span>
        </div>

        {selectedFile && (
          <div className="selected-file">
            <div className="selected-file-icon">
              <FiFile />
            </div>

            <div className="selected-file-info">
              <strong>{selectedFile.name}</strong>

              <span>
                {formatFileSize(selectedFile.size)}
              </span>
            </div>

            <button
              type="button"
              className="remove-file-button"
              onClick={removeFile}
              title="Remove file"
            >
              <FiX />
            </button>
          </div>
        )}

        {message && (
          <div
            className={`upload-message ${
              message.includes("successfully")
                ? "success-message"
                : "error-message"
            }`}
          >
            {message.includes("successfully") ? (
              <FiCheckCircle />
            ) : (
              <FiAlertCircle />
            )}

            <span>{message}</span>
          </div>
        )}

        <div className="upload-actions">
          <button
            type="button"
            className="upload-submit-button"
            onClick={handleUpload}
          >
            <FiUploadCloud />
            Upload File
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadFile;