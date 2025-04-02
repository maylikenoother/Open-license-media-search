// src/services/bookmarkService.js
import axios from 'axios';
import config from '../config';

/**
 * Get all bookmarks for the current user
 * 
 * @returns {Promise} - Promise resolving to bookmarks
 */
export const getBookmarks = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/users/bookmarks`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('clerk-token')}`
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    throw error;
  }
};

/**
 * Create a new bookmark
 * 
 * @param {Object} bookmarkData - Data for the new bookmark
 * @param {string} bookmarkData.mediaId - The ID of the media item
 * @param {string} bookmarkData.mediaUrl - The URL of the media item
 * @param {string} bookmarkData.mediaType - The type of media
 * @param {string} [bookmarkData.mediaTitle] - The title of the media item
 * @param {string} [bookmarkData.mediaCreator] - The creator of the media item
 * @param {string} [bookmarkData.mediaLicense] - The license of the media item
 * @returns {Promise} - Promise resolving to the created bookmark
 */
export const createBookmark = async (bookmarkData) => {
  try {
    const response = await axios.post(`${config.apiUrl}/users/bookmarks`, bookmarkData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('clerk-token')}`
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error creating bookmark:', error);
    throw error;
  }
};

/**
 * Delete a bookmark
 * 
 * @param {string} mediaId - The ID of the media item to unbookmark
 * @returns {Promise} - Promise resolving to success message
 */
export const deleteBookmark = async (mediaId) => {
  try {
    const response = await axios.delete(`${config.apiUrl}/users/bookmarks/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('clerk-token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    throw error;
  }
};

/**
 * Check if a media item is bookmarked
 * 
 * @param {string} mediaId - The ID of the media item to check
 * @param {Array} bookmarks - Array of bookmarks to check against
 * @returns {boolean} - True if the media item is bookmarked
 */
export const isBookmarked = (mediaId, bookmarks) => {
  if (!bookmarks || !Array.isArray(bookmarks)) {
    return false;
  }
  
  return bookmarks.some(bookmark => bookmark.media_id === mediaId);
};