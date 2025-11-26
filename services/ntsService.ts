import { ApiResponse, BusinessStatusItem } from '../types';

const API_BASE_URL = "https://api.odcloud.kr/api/nts-businessman/v1/status";

/**
 * Fetches status for a single business number.
 * Note: The API technically supports batching, but the requirement is to call for each b_no.
 */
export const fetchBusinessStatus = async (
  serviceKey: string,
  businessNumber: string,
  signal?: AbortSignal
): Promise<BusinessStatusItem | null> => {
  // Clean the business number (remove dashes, spaces)
  const cleanBNo = businessNumber.replace(/[^0-9]/g, '');
  const cleanKey = serviceKey.trim();

  if (!cleanBNo) return null;

  // Handle Service Key Encoding logic
  const isEncoded = /%[0-9A-Fa-f]{2}/.test(cleanKey);
  const finalKey = isEncoded ? cleanKey : encodeURIComponent(cleanKey);

  try {
    const response = await fetch(`${API_BASE_URL}?serviceKey=${finalKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        b_no: [cleanBNo],
      }),
      signal
    });

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorBody = await response.json();
        if (errorBody.msg) {
          errorDetail = ` (${errorBody.msg})`;
        }
      } catch (e) {
        // Ignore JSON parse errors on error responses
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}${errorDetail}`);
    }

    const data: ApiResponse = await response.json();

    if (data.data && data.data.length > 0) {
      return data.data[0];
    }
    
    return null;
  } catch (error) {
    // Don't log abort errors as failures
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    console.error(`Failed to fetch status for ${cleanBNo}`, error);
    throw error;
  }
};

/**
 * Fetches status for multiple business numbers in a single batch request.
 */
export const fetchBusinessStatusBatch = async (
  serviceKey: string,
  businessNumbers: string[],
  signal?: AbortSignal
): Promise<BusinessStatusItem[]> => {
  const cleanKey = serviceKey.trim();
  // Clean numbers and remove empty ones
  const cleanBNos = businessNumbers
    .map(b => b.replace(/[^0-9]/g, ''))
    .filter(b => b.length > 0);

  if (cleanBNos.length === 0) return [];

  // Handle Service Key Encoding logic
  const isEncoded = /%[0-9A-Fa-f]{2}/.test(cleanKey);
  const finalKey = isEncoded ? cleanKey : encodeURIComponent(cleanKey);

  try {
    const response = await fetch(`${API_BASE_URL}?serviceKey=${finalKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        b_no: cleanBNos,
      }),
      signal
    });

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorBody = await response.json();
        if (errorBody.msg) {
          errorDetail = ` (${errorBody.msg})`;
        }
      } catch (e) {
        // Ignore JSON parse errors on error responses
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}${errorDetail}`);
    }

    const data: ApiResponse = await response.json();
    return data.data || [];
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    console.error(`Failed to fetch batch status`, error);
    throw error;
  }
};
