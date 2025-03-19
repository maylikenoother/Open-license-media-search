const API_BASE_URL = import.meta.env.MODE === "development"
  ? "/api"
  : "http://open_license_media_api:8000";

export default API_BASE_URL;
