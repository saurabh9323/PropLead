import axios from "axios";
import { cookies } from "next/headers";
import { apiurls } from "@/api/MainApi";

const methodsWithBody = ["post", "put", "patch", "delete"];

function removeEmptyQueryValues(data) {
  if (!data) return undefined;

  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

async function getTokenHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("proplead_token")?.value;

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest(key, method, data, headers = {}, path = "") {
  const url = apiurls[key] && `${apiurls[key]}${path}`;

  if (!url || url.includes("undefined")) {
    throw new Error(`API URL not found for key: ${key}`);
  }

  const requestMethod = method.toLowerCase();
  const tokenHeader = await getTokenHeader();
  const finalHeaders = {
    ...tokenHeader,
    ...headers,
  };

  try {
    const response = await axios({
      method: requestMethod,
      timeout: 15000,
      url,
      headers: finalHeaders,
      params: requestMethod === "get" ? removeEmptyQueryValues(data) : undefined,
      data: methodsWithBody.includes(requestMethod) ? data : undefined,
    });

    return {
      ok: true,
      statusCode: response.status,
      ...response.data,
    };
  } catch (error) {
    if (error.response) {
      return {
        ok: false,
        statusCode: error.response.status,
        ...error.response.data,
      };
    }

    console.error(`API request failed: ${requestMethod.toUpperCase()} ${key}`, error.code);
    throw error;
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
