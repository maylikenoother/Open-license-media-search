// src/hooks/useMediaSearch.js
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { searchMedia, getPopularMedia } from '../services/searchService';
import { useUser } from '@clerk/clerk-react';

/**
 * Custom hook for searching media
 * This hook encapsulates all the logic for searching media and managing search state
 */
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
  
  // Query for popular media if no search has been performed
  const popularMediaQuery = useQuery(
    ['popularMedia', searchParams.mediaType],
    () => getPopularMedia(searchParams.mediaType),
    { 
      enabled: !searchPerformed,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  );
  
  // Query for search results
  const searchResultsQuery = useQuery(
    ['searchResults', searchParams],
    () => searchMedia(searchParams.query, searchParams),
    {
      enabled: searchPerformed && !!searchParams.query,
      keepPreviousData: true,
      onSuccess: (data) => {
        // Check if user is authenticated from the response
        if (!data.isAuthenticated) {
          setAuthError(true);
        } else {
          setAuthError(false);
        }
      }
    }
  );
  
  // Mutation for searching
  const searchMutation = useMutation(
    (params) => searchMedia(params.query, params),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['searchResults', searchParams], data);
        
        // Check if user is authenticated from the response
        if (!data.isAuthenticated) {
          setAuthError(true);
        } else {
          setAuthError(false);
        }
      },
      onError: (error) => {
        // If the error is an authentication error, set the auth error flag
        if (error.response?.status === 401 || error.response?.status === 422) {
          setAuthError(true);
        }
      }
    }
  );
  
  // Function to perform a search
  const performSearch = useCallback((params = {}) => {
    const newParams = { ...searchParams, ...params, page: params.page || 1 };
    setSearchParams(newParams);
    setSearchPerformed(true);
    
    // Reset auth error state on new search
    setAuthError(false);
    
    return searchMutation.mutateAsync(newParams);
  }, [searchParams, searchMutation]);
  
  // Function to reset search
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
  
  // Function to change page
  const changePage = useCallback((page) => {
    performSearch({ ...searchParams, page });
  }, [searchParams, performSearch]);
  
  // Function to change media type
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