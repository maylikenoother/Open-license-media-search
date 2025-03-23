const API_BASE_URL = import.meta.env.MODE === "development"
  ? "http://localhost:8000"
  : "http://open_license_media_api:8000";

export default API_BASE_URL;
