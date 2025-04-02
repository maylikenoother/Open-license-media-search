// src/services/authService.js

/**
 * Get authorization headers with token
 * 
 * @returns {Object} - Headers object with Authorization
 */
export const getAuthHeaders = () => {
    const token = localStorage.getItem('clerk-token');
    
    // Debug output
    console.log("getAuthHeaders called, token exists:", !!token);
    
    if (!token) {
      console.warn('No auth token found in localStorage. User may not be authenticated.');
      
      // Try to get token from cookie as fallback
      const tokenFromCookie = getCookie('clerk-token');
      if (tokenFromCookie) {
        console.log("Found token in cookies, using that instead");
        return {
          'Authorization': `Bearer ${tokenFromCookie}`,
          'X-Session-Token': tokenFromCookie
        };
      }
      
      return {};
    }
    
    console.log("Sending auth headers with token:", token.substring(0, 10) + "...");
    
    return {
      'Authorization': `Bearer ${token}`,
      'X-Session-Token': token  // Adding a backup header method
    };
  };
  
  /**
   * Helper function to get cookie by name
   */
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
  /**
   * Custom hook to manage auth token
   * This hook will update the token in localStorage whenever it changes
   */
  export const useAuthToken = () => {
    const { getToken, isSignedIn } = useAuth();
    const [token, setToken] = useState(localStorage.getItem('clerk-token') || '');
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
      const updateToken = async () => {
        setIsLoading(true);
        try {
          if (isSignedIn) {
            const newToken = await getToken();
            if (newToken) {
              localStorage.setItem('clerk-token', newToken);
              document.cookie = `clerk-token=${newToken}; path=/; max-age=3600; SameSite=Lax`;
              setToken(newToken);
              console.log("Authentication token updated");
            }
          } else {
            // Clear token if not signed in
            localStorage.removeItem('clerk-token');
            document.cookie = "clerk-token=; path=/; max-age=0";
            setToken('');
          }
        } catch (error) {
          console.error("Error getting auth token:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      updateToken();
      
      // Set up interval to refresh token
      const intervalId = setInterval(updateToken, 5 * 60 * 1000); // Refresh every 5 minutes
      
      return () => clearInterval(intervalId);
    }, [getToken, isSignedIn]);
    
    return { token, isLoading };
  };
  
  /**
   * Parse JWT token to get payload
   * 
   * @param {string} token - JWT token
   * @returns {Object|null} - Token payload or null if invalid
   */
  export const parseToken = (token) => {
    if (!token) return null;
    
    try {
      // Get the payload part of the JWT (second segment)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  };