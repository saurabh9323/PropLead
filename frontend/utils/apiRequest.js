import axios from "axios";
import { apiurls, browserApiUrls } from "@/api/MainApi";
import { emptyApiResponse } from "@/lib/Types/ApiResponse";

const methodsWithBody = ["post"];

function removeEmptyQueryValues(data) {
  if (!data) return undefined;

  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

export async function apiRequest(key, method, data, headers = {}, path = "", options = {}) {
  const urls = typeof window === "undefined" ? apiurls : browserApiUrls;
  const url = urls[key] && `${urls[key]}${path}`;

  if (!url || url.includes("undefined")) {
    throw new Error(`API URL not found for key: ${key}`);
  }

  const requestMethod = method.toLowerCase();
  const finalHeaders = {
    Accept: "application/json",
    ...(requestMethod === "post" ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  try {
    const response = await axios({
      method: requestMethod,
      timeout: 15000,
      signal: options.signal,
      url,
      headers: finalHeaders,
      params: requestMethod === "get" ? removeEmptyQueryValues(data) : undefined,
      data: methodsWithBody.includes(requestMethod) ? (data ?? {}) : undefined,
    });

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    if (error.response) {
      return error.response.data;
    }

    console.error(`API request failed: ${requestMethod.toUpperCase()} ${key}`, error.code);
    return { ...emptyApiResponse, statusCode: 503, message: "Unable to reach the backend API. Please try again." };
  }
}

export async function getDropDownData(endPoint) {
  try {
    const response = await apiRequest(endPoint, "get");

    if (response.ok) {
      return response.data || [];
    }

    return [];
  } catch (error) {
    console.log(error);
    return [];
  }
}
