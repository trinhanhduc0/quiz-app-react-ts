import TokenService from './TokenService';
import { NavigateFunction } from 'react-router-dom';

/**
 * General API call utility function
 * @param endpoint Endpoint to make the request to
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param body Data to be sent in the request body (for POST/PUT requests)
 * @param navigate Optional navigation function to handle redirection (e.g., on token expiration)
 * @returns JSON response
 */
const apiCall = async <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: any,
  navigate?: NavigateFunction,
): Promise<T> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TokenService.getToken() ?? ''}`,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      console.log(body);
      options.body = JSON.stringify(body);
    }
    const response = await fetch(endpoint, options);
    if (!response.ok) {
      const errorBody = await response.text();
      if (response.status === 401 && navigate) {
        navigate('/login'); // or '/logout' based on your application flow
      }
      throw new Error(`HTTP error! Status: ${response.status} - ${errorBody}`);
    }
    const text = await response.text();

    if (!text) {
      return {} as T; // hoặc `null`, hoặc `undefined` tùy ứng dụng
    }

    try {
      return JSON.parse(text) as T;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error('Invalid JSON response');
    }
  } catch (error) {
    console.error(`API call failed for ${method} ${endpoint}:`, error);
    throw error; // rethrowing the error for further handling
  }
};

/**
 * Utility function for GET API calls
 * @param url The API endpoint for the GET request
 * @param navigate Optional navigation function for redirection on errors
 * @returns JSON response
 */
export const apiCallGet = async <T>(url: string, navigate?: NavigateFunction): Promise<T> => {
  return apiCall<T>(url, 'GET', undefined, navigate);
};

/**
 * Utility function for POST API calls
 * @param url The API endpoint for the POST request
 * @param body The request body for the POST method
 * @param navigate Optional navigation function for redirection on errors
 * @returns JSON response
 */
export const apiCallPost = async <T>(
  url: string,
  body: any,
  navigate?: NavigateFunction,
): Promise<T> => {
  return apiCall<T>(url, 'POST', body, navigate);
};

/**
 * Utility function for PUT API calls
 * @param url The API endpoint for the PUT request
 * @param body The request body for the PUT method
 * @param navigate Optional navigation function for redirection on errors
 * @returns JSON response
 */
export const apiCallPut = async <T>(
  url: string,
  body: any,
  navigate?: NavigateFunction,
): Promise<T> => {
  return apiCall<T>(url, 'PUT', body, navigate);
};

/**
 * Utility function for DELETE API calls
 * @param url The API endpoint for the DELETE request
 * @param body The request body for the DELETE method
 * @param navigate Optional navigation function for redirection on errors
 * @returns JSON response
 */
export const apiCallDelete = async <T>(
  url: string,
  body: any,
  navigate?: NavigateFunction,
): Promise<T> => {
  return apiCall<T>(url, 'DELETE', body, navigate);
};

/**
 * Utility function for DELETE API calls
 * @param url The API endpoint for the DELETE request
 * @param body The request body for the DELETE method
 * @param navigate Optional navigation function for redirection on errors
 * @returns JSON response
 */
export const apiCallPatch = async <T>(
  url: string,
  body: any,
  navigate?: NavigateFunction,
): Promise<T> => {
  return apiCall<T>(url, 'PATCH', body, navigate);
};

/**
 * Utility function for uploading images (multipart/form-data)
 * @param endpoint The API endpoint for the upload
 * @param formData Form data containing the file to upload
 * @param navigate Optional navigation function for redirection on errors
 * @returns Response object from the API
 */
export const apiUploadImage = async (
  endpoint: string,
  formData: FormData,
  navigate?: NavigateFunction,
): Promise<Response> => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TokenService.getToken() ?? ''}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401 && navigate) {
        navigate('/login');
      }
      const errorBody = await response.text();
      console.error('Upload error response:', errorBody);
      throw new Error(`Upload failed. Status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Upload image error:', error);
    throw error;
  }
};
