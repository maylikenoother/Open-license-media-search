
/**
 * Get authorization headers with token
 * 
 @returns {Object}

  
  /**
   * Helper function to get cookie by name
   */
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
 
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

      const intervalId = setInterval(updateToken, 5 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }, [getToken, isSignedIn]);
    
    return { token, isLoading };
  };
  
  /**
   * 
   * @param {string} token 
   * @returns {Object|null} 
   */
  export const parseToken = (token) => {
    if (!token) return null;
    
    try {
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