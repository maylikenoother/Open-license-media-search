// src/services/searchService.js
import axios from 'axios';
import config from '../config';

/**
 * Search for media with the given parameters
 * 
 * @param {string} query - The search query
 * @param {Object} params - Additional search parameters
 * @returns {Promise} - Promise resolving to search results
 */
export const searchMedia = async (query, params = {}) => {
  const { mediaType = 'images', page = 1, pageSize = 20, licenseType, creator, tags, source } = params;
  
  try {
    const response = await axios.get(`${config.apiUrl}/search`, {
      params: {
        query,
        media_type: mediaType,
        page,
        page_size: pageSize,
        license_type: licenseType,
        creator,
        tags,
        source
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('clerk-token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error searching media:', error);
    throw error;
  }
};

/**
 * Get details for a specific media item
 * 
 * @param {string} mediaId - The ID of the media item
 * @param {string} mediaType - The type of media (images, audio)
 * @returns {Promise} - Promise resolving to media details
 */
export const getMediaDetails = async (mediaId, mediaType = 'images') => {
  try {
    const response = await axios.get(`${config.apiUrl}/media/${mediaType}/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('clerk-token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting media details:', error);
    throw error;
  }
};

/**
 * Get popular media of a specific type
 * 
 * @param {string} mediaType - The type of media (images, audio)
 * @param {number} limit - Maximum number of items to return
 * @returns {Promise} - Promise resolving to popular media items
 */
export const getPopularMedia = async (mediaType = 'images', limit = 20) => {
  try {
    const response = await axios.get(`${config.apiUrl}/popular/${mediaType}`, {
      params: { limit },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('clerk-token')}`
      }
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Error getting popular media:', error);
    throw error;
  }
};

/**
 * Get the user's search history
 * 
 * @param {number} limit - Maximum number of history items to return
 * @returns {Promise} - Promise resolving to search history items
 */
export const getSearchHistory = async (limit = 20) => {
  try {
    const response = await axios.get(`${config.apiUrl}/history`, {
      params: { limit },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('clerk-token')}`
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error getting search history:', error);
    throw error;
  }
};

/**
 * Delete a specific search history item
 * 
 * @param {number} historyId - The ID of the history item to delete
 * @returns {Promise} - Promise resolving to success message
 */
export const deleteSearchHistory = async (historyId) => {
  try {
    const response = await axios.delete(`${config.apiUrl}/history/${historyId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('clerk-token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error deleting search history:', error);
    throw error;
  }
};

/**
 * Clear all search history for the current user
 * 
 * @returns {Promise} - Promise resolving to success message
 */
export const clearSearchHistory = async () => {
  try {
    const response = await axios.delete(`${config.apiUrl}/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('clerk-token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error clearing search history:', error);
    throw error;
  }
};