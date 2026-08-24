import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";

function NotFound() {
  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="not-found-page">
      <div className="not-found-icon">
        <FiAlertCircle />
      </div>

      <h2>Page Not Found</h2>

      <p>
        The page you are looking for does not exist.
      </p>

      <button
        type="button"
        className="primary-button"
        onClick={goBack}
      >
        <FiArrowLeft />
        Go Back
      </button>
    </div>
  );
}

export default NotFound;