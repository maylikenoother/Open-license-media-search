import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TokenHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('auth_token', token);
      navigate('/search');
    } else {

      navigate('/login');
    }
  }, [navigate]);

  return null;
};

export default TokenHandler;
