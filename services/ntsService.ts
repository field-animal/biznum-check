import { ApiResponse, BusinessStatusItem } from '../types';

const API_BASE_URL = "https://api.odcloud.kr/api/nts-businessman/v1/status";

/**
 * Fetches status for a single business number.
 * Note: The API technically supports batching, but the requirement is to call for each b_no.
 */
export const fetchBusinessStatus = async (
  serviceKey: string,
  businessNumber: string
): Promise<BusinessStatusItem | null> => {
  // Clean the business number (remove dashes, spaces)
  const cleanBNo = businessNumber.replace(/[^0-9]/g, '');
  const cleanKey = serviceKey.trim();

  if (!cleanBNo) return null;

  // Handle Service Key Encoding logic
  // The API requires the service key in the query string.
  // Users may provide the "Decoding" key (standard Base64-like string) or "Encoding" key (URL-encoded).
  // Check if the key matches a URL-encoded pattern (contains % followed by hex).
  const isEncoded = /%[0-9A-Fa-f]{2}/.test(cleanKey);
  
  // If it looks encoded, use as is. Otherwise, encode it.
  const finalKey = isEncoded ? cleanKey : encodeURIComponent(cleanKey);

  try {
    const response = await fetch(`${API_BASE_URL}?serviceKey=${finalKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        b_no: [cleanBNo], // Sending as a single-item array per requirement
      }),
    });

    if (!response.ok) {
      let errorDetail = '';
      try {
        // Try to extract detailed error message from API response if available
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
    console.error(`Failed to fetch status for ${cleanBNo}`, error);
    throw error;
  }
};