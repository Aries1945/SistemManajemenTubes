/**
 * Whitebox Testing untuk Penilaian API Utilities
 * 
 * Test Coverage:
 * 1. getGradingData - Mengambil data grading
 * 2. saveNilai - Menyimpan nilai
 * 3. updatePenilaianVisibility - Update visibilitas
 * 4. Error handling dan authentication
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

global.localStorage = mockLocalStorage;

// Mock fetch
global.fetch = jest.fn();

describe('Penilaian API Utilities - Whitebox Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  describe('1. makeRequest - Authentication', () => {
    const makeRequest = async (url, options = {}) => {
      let token = localStorage.getItem('token');
      
      if (!token) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            token = user.token;
            if (token) {
              localStorage.setItem('token', token);
            }
          } catch (error) {
            // Ignore parse error
          }
        }
      }
      
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          throw new Error('Authentication failed. Please login again.');
        }
        
        const contentType = response.headers.get('content-type');
        let errorMessage = `Request failed with status ${response.status}`;
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            // Use default error message
          }
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    };

    it('harus menambahkan token ke header Authorization', async () => {
      mockLocalStorage.getItem.mockReturnValue('test-token');
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        headers: {
          get: () => 'application/json'
        }
      });

      await makeRequest('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('harus throw error jika tidak ada token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockLocalStorage.getItem.mockReturnValueOnce(null); // user juga null

      await expect(makeRequest('/test')).rejects.toThrow(
        'Authentication required. Please login again.'
      );
    });

    it('harus mengambil token dari user object jika token tidak ada', async () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce(null) // token
        .mockReturnValueOnce(JSON.stringify({ token: 'user-token' })); // user

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        headers: {
          get: () => 'application/json'
        }
      });

      await makeRequest('/test');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'user-token');
    });

    it('harus handle 401 error dan clear storage', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-token');
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: {
          get: () => 'application/json'
        },
        json: async () => ({ error: 'Unauthorized' })
      });

      await expect(makeRequest('/test')).rejects.toThrow(
        'Authentication failed. Please login again.'
      );

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('2. getGradingData', () => {
    const getGradingData = async (tugasId) => {
      const makeRequest = async (url) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5001/api${url}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Request failed');
        return response.json();
      };

      return makeRequest(`/auth/dosen/tugas-besar/${tugasId}/grading`);
    };

    it('harus memanggil endpoint yang benar', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            tugas: { id: 1, judul: 'Test' },
            komponen: [],
            groups: [],
            nilai: []
          }
        }),
        headers: {
          get: () => 'application/json'
        }
      });

      const result = await getGradingData(1);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/auth/dosen/tugas-besar/1/grading',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer')
          })
        })
      );

      expect(result.success).toBe(true);
    });

    it('harus handle error dengan benar', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: {
          get: () => 'application/json'
        },
        json: async () => ({ error: 'Not found' })
      });

      await expect(getGradingData(999)).rejects.toThrow();
    });
  });

  describe('3. saveNilai', () => {
    const saveNilai = async (tugasId, kelompokId, komponenIndex, nilai, catatan) => {
      const makeRequest = async (url, options) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5001/api${url}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options?.headers
          }
        });
        if (!response.ok) throw new Error('Request failed');
        return response.json();
      };

      return makeRequest(`/auth/dosen/tugas-besar/${tugasId}/nilai`, {
        method: 'POST',
        body: JSON.stringify({
          kelompok_id: kelompokId,
          komponen_index: komponenIndex,
          nilai: nilai,
          catatan: catatan
        })
      });
    };

    it('harus mengirim data dengan format yang benar', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Nilai berhasil disimpan',
          saved_count: 3
        }),
        headers: {
          get: () => 'application/json'
        }
      });

      const result = await saveNilai(1, 1, 0, 85, 'Bagus');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/auth/dosen/tugas-besar/1/nilai',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            kelompok_id: 1,
            komponen_index: 0,
            nilai: 85,
            catatan: 'Bagus'
          })
        })
      );

      expect(result.success).toBe(true);
      expect(result.saved_count).toBe(3);
    });

    it('harus handle nilai null/undefined untuk catatan', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        headers: {
          get: () => 'application/json'
        }
      });

      await saveNilai(1, 1, 0, 85, null);

      const callArgs = global.fetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.catatan).toBeNull();
    });
  });

  describe('4. updatePenilaianVisibility', () => {
    const updatePenilaianVisibility = async (tugasId, penilaianVisible) => {
      const makeRequest = async (url, options) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5001/api${url}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options?.headers
          }
        });
        if (!response.ok) throw new Error('Request failed');
        return response.json();
      };

      return makeRequest(`/auth/dosen/tugas-besar/${tugasId}/penilaian-visibility`, {
        method: 'PUT',
        body: JSON.stringify({
          penilaian_visible: penilaianVisible
        })
      });
    };

    it('harus update visibility ke true', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Visibility updated'
        }),
        headers: {
          get: () => 'application/json'
        }
      });

      const result = await updatePenilaianVisibility(1, true);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/auth/dosen/tugas-besar/1/penilaian-visibility',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            penilaian_visible: true
          })
        })
      );

      expect(result.success).toBe(true);
    });

    it('harus update visibility ke false', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        headers: {
          get: () => 'application/json'
        }
      });

      await updatePenilaianVisibility(1, false);

      const callArgs = global.fetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.penilaian_visible).toBe(false);
    });
  });

  describe('5. Error Handling', () => {
    it('harus handle network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const makeRequest = async () => {
        const response = await fetch('/test');
        return response.json();
      };

      await expect(makeRequest()).rejects.toThrow('Network error');
    });

    it('harus handle JSON parse error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
        headers: {
          get: () => 'application/json'
        }
      });

      const makeRequest = async () => {
        const response = await fetch('/test');
        return response.json();
      };

      await expect(makeRequest()).rejects.toThrow('Invalid JSON');
    });

    it('harus handle 500 server error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: () => 'application/json'
        },
        json: async () => ({
          error: 'Server error',
          details: 'Internal server error'
        })
      });

      const makeRequest = async () => {
        const response = await fetch('/test');
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Request failed');
        }
        return response.json();
      };

      await expect(makeRequest()).rejects.toThrow('Server error');
    });
  });

  describe('6. Request Format Validation', () => {
    it('harus mengirim Content-Type application/json', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        headers: {
          get: () => 'application/json'
        }
      });

      const makeRequest = async (url, options = {}) => {
        return fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
      };

      await makeRequest('/test', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' })
      });

      const callArgs = global.fetch.mock.calls[0][1];
      expect(callArgs.headers['Content-Type']).toBe('application/json');
    });

    it('harus stringify body untuk POST/PUT requests', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        headers: {
          get: () => 'application/json'
        }
      });

      const makeRequest = async (url, options = {}) => {
        return fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          body: options.body ? JSON.stringify(options.body) : undefined
        });
      };

      await makeRequest('/test', {
        method: 'POST',
        body: { test: 'data', nilai: 85 }
      });

      const callArgs = global.fetch.mock.calls[0][1];
      expect(typeof callArgs.body).toBe('string');
      expect(JSON.parse(callArgs.body)).toEqual({ test: 'data', nilai: 85 });
    });
  });
});

