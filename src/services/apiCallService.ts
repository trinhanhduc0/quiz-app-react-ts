// utils/api.ts
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { NavigateFunction } from 'react-router-dom';
import axiosInstance from './axiosInstance';

const apiCall = async <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: any,
  navigate?: NavigateFunction,
): Promise<T> => {
  try {
    const config: AxiosRequestConfig = {
      url: endpoint,
      method,
      data: body,
    };

    const response: AxiosResponse<T> = await axiosInstance(config);
    if (response?.status === 401 && navigate) {
      navigate('/login');
    }
    return response.data;
  } catch (error: any) {
    if ((error.response?.status === 401 || error.status === 401) && navigate) {
      navigate('/login');
    }
    const message = error.response?.data?.message || error.message;
    console.error(`API error: ${message}`, error);
    throw new Error(message);
  }
};
export const apiCallGet = async <T>(url: string, navigate?: NavigateFunction) =>
  await apiCall<T>(url, 'GET', undefined, navigate);

export const apiCallPost = async <T>(url: string, body: any, navigate?: NavigateFunction) =>
  await apiCall<T>(url, 'POST', body, navigate);

export const apiCallPut = async <T>(url: string, body: any, navigate?: NavigateFunction) =>
  await apiCall<T>(url, 'PUT', body, navigate);

export const apiCallDelete = async <T>(url: string, body: any, navigate?: NavigateFunction) =>
  await apiCall<T>(url, 'DELETE', body, navigate);

export const apiCallPatch = async <T>(url: string, body: any, navigate?: NavigateFunction) =>
  await apiCall<T>(url, 'PATCH', body, navigate);

export const apiUploadImage = async (
  endpoint: string,
  formData: FormData,
  navigate?: NavigateFunction,
): Promise<any> => {
  try {
    const response = await axiosInstance.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401 && navigate) {
      navigate('/login');
    }
    console.error('Upload image error:', error);
    throw new Error(error.message);
  }
};