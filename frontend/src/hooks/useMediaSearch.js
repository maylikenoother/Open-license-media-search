import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { searchMedia, getPopularMedia } from '../services/searchService';
import { useUser } from '@clerk/clerk-react';

const useMediaSearch = () => {
  const queryClient = useQueryClient();
  const { isSignedIn } = useUser();
  const [searchParams, setSearchParams] = useState({
    query: '',
    mediaType: 'images',
    page: 1,
    pageSize: 20,
    licenseType: '',
    creator: '',
    tags: '',
    source: ''
  });
  
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  const popularMediaQuery = useQuery(
    ['popularMedia', searchParams.mediaType],
    () => getPopularMedia(searchParams.mediaType),
    { 
      enabled: !searchPerformed,
      staleTime: 5 * 60 * 1000
    }
  );
  
  const searchResultsQuery = useQuery(
    ['searchResults', searchParams],
    () => searchMedia(searchParams.query, searchParams),
    {
      enabled: searchPerformed && !!searchParams.query,
      keepPreviousData: true,
      onSuccess: (data) => {
        if (!data.isAuthenticated) {
          setAuthError(true);
        } else {
          setAuthError(false);
        }
      }
    }
  );
  
  const searchMutation = useMutation(
    (params) => searchMedia(params.query, params),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['searchResults', searchParams], data);
        
        if (!data.isAuthenticated) {
          setAuthError(true);
        } else {
          setAuthError(false);
        }
      },
      onError: (error) => {
        if (error.response?.status === 401 || error.response?.status === 422) {
          setAuthError(true);
        }
      }
    }
  );
  
  const performSearch = useCallback((params = {}) => {
    const newParams = { ...searchParams, ...params, page: params.page || 1 };
    setSearchParams(newParams);
    setSearchPerformed(true);
    
    setAuthError(false);
    
    return searchMutation.mutateAsync(newParams);
  }, [searchParams, searchMutation]);
  
  const resetSearch = useCallback(() => {
    setSearchParams({
      query: '',
      mediaType: 'images',
      page: 1,
      pageSize: 20,
      licenseType: '',
      creator: '',
      tags: '',
      source: ''
    });
    setSearchPerformed(false);
    setAuthError(false);
    queryClient.invalidateQueries('popularMedia');
  }, [queryClient]);
  
  const changePage = useCallback((page) => {
    performSearch({ ...searchParams, page });
  }, [searchParams, performSearch]);
  
  const changeMediaType = useCallback((mediaType) => {
    if (searchPerformed) {
      performSearch({ ...searchParams, mediaType, page: 1 });
    } else {
      setSearchParams(prev => ({ ...prev, mediaType }));
    }
  }, [searchParams, performSearch, searchPerformed]);
  
  return {
    searchParams,
    setSearchParams,
    searchPerformed,
    popularMedia: popularMediaQuery.data || [],
    searchResults: searchResultsQuery.data,
    isLoading: searchPerformed ? searchResultsQuery.isLoading : popularMediaQuery.isLoading,
    isError: searchPerformed ? searchResultsQuery.isError : popularMediaQuery.isError,
    error: searchPerformed ? searchResultsQuery.error : popularMediaQuery.error,
    performSearch,
    resetSearch,
    changePage,
    changeMediaType,
    authError,
    isAuthenticated: isSignedIn
  };
};

export default useMediaSearch;