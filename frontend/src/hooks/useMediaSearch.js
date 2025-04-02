// src/hooks/useMediaSearch.js
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { searchMedia, getPopularMedia } from '../services/searchService';

/**
 * Custom hook for searching media
 * This hook encapsulates all the logic for searching media and managing search state
 */
const useMediaSearch = () => {
  const queryClient = useQueryClient();
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
      keepPreviousData: true
    }
  );
  
  // Mutation for searching
  const searchMutation = useMutation(
    (params) => searchMedia(params.query, params),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['searchResults', searchParams], data);
      }
    }
  );
  
  // Function to perform a search
  const performSearch = useCallback((params = {}) => {
    const newParams = { ...searchParams, ...params, page: params.page || 1 };
    setSearchParams(newParams);
    setSearchPerformed(true);
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
    changeMediaType
  };
};

export default useMediaSearch;