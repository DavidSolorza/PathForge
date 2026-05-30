import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { config } from '@core/config'

let api: AxiosInstance | null = null

function getToken(): string | null {
  return localStorage.getItem(config.auth.tokenKey)
}

function createApi(): AxiosInstance {
  const instance = axios.create({
    baseURL: config.api.baseUrl,
    timeout: config.api.timeout,
    headers: { 'Content-Type': 'application/json' },
  })

  instance.interceptors.request.use((req) => {
    const token = getToken()
    if (token && req.headers) {
      req.headers.Authorization = `Bearer ${token}`
    }
    return req
  })

  instance.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem(config.auth.tokenKey)
        localStorage.removeItem(config.auth.refreshTokenKey)
        window.location.href = '/login'
      }
      return Promise.reject(error)
    },
  )

  return instance
}

export function getApi(): AxiosInstance {
  if (!api) api = createApi()
  return api
}

export function resetApi(): void {
  api = null
}

export async function apiGet<T>(url: string, cfg?: AxiosRequestConfig): Promise<T> {
  const { data } = await getApi().get<T>(url, cfg)
  return data
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await getApi().post<T>(url, body)
  return data
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await getApi().put<T>(url, body)
  return data
}

export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await getApi().delete<T>(url)
  return data
}
