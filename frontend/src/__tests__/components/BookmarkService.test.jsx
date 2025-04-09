import { vi, describe, it, expect } from 'vitest';
import axios from 'axios';
import { searchMedia, getPopularMedia, getSearchHistory } from '../src/services/searchService';
import config from '../src/config';

vi.mock('axios');

vi.mock('../src/services/authService', () => ({
  getAuthHeaders: vi.fn(() => ({}))
}));

describe('searchService', () => {
  describe('searchMedia', () => {
    it('should search for media with default parameters', async () => {
      const mockResponse = {
        data: {
          results: [{ id: '1', title: 'Test Media' }],
          count: 1,
          auth_status: 'authenticated'
        }
      };
      
      axios.get.mockResolvedValue(mockResponse);

      const result = await searchMedia('test query');
      
      expect(axios.get).toHaveBeenCalledWith(`${config.apiUrl}/search`, {
        params: {
          query: 'test query',
          media_type: 'images',
          page: 1,
          page_size: 20,
          license_type: undefined,
          creator: undefined,
          tags: undefined,
          source: undefined
        },
        headers: expect.any(Object)
      });

      expect(result).toEqual({
        ...mockResponse.data,
        isAuthenticated: true
      });
    });

    it('should handle search with custom parameters', async () => {
      const mockResponse = {
        data: {
          results: [{ id: '1', title: 'Filtered Media' }],
          count: 1,
          auth_status: 'authenticated'
        }
      };
      
      axios.get.mockResolvedValue(mockResponse);

      const result = await searchMedia('test query', {
        mediaType: 'audio',
        page: 2,
        pageSize: 10,
        licenseType: 'cc0',
        creator: 'John Doe',
        tags: 'nature',
        source: 'freesound'
      });
      
      expect(axios.get).toHaveBeenCalledWith(`${config.apiUrl}/search`, {
        params: {
          query: 'test query',
          media_type: 'audio',
          page: 2,
          page_size: 10,
          license_type: 'cc0',
          creator: 'John Doe',
          tags: 'nature',
          source: 'freesound'
        },
        headers: expect.any(Object)
      });
    });

    it('should throw an error for failed search', async () => {
      const mockError = new Error('Search failed');
      mockError.response = { data: 'Error details' };
      
      axios.get.mockRejectedValue(mockError);

      await expect(searchMedia('test query')).rejects.toThrow('Search failed');
    });
  });

  describe('getPopularMedia', () => {
    it('should fetch popular media', async () => {
      const mockResponse = {
        data: {
          results: [
            { id: '1', title: 'Popular Image 1' },
            { id: '2', title: 'Popular Image 2' }
          ]
        }
      };
      
      axios.get.mockResolvedValue(mockResponse);

      const result = await getPopularMedia('images', 5);
      
      expect(axios.get).toHaveBeenCalledWith(`${config.apiUrl}/popular/images`, {
        params: { limit: 5 },
        headers: expect.any(Object)
      });

      expect(result).toEqual(mockResponse.data.results);
    });
  });

  describe('getSearchHistory', () => {
    it('should fetch search history', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: '1', search_query: 'First search' },
            { id: '2', search_query: 'Second search' }
          ]
        }
      };
      
      axios.get.mockResolvedValue(mockResponse);

      const result = await getSearchHistory(10);
      
      expect(axios.get).toHaveBeenCalledWith(`${config.apiUrl}/history`, {
        params: { limit: 10 },
        headers: expect.any(Object)
      });

      expect(result).toEqual(mockResponse.data.data);
    });
  });
});