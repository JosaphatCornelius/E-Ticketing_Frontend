import { ResponseModels } from "src/models/ResponseModels";
import { UserModels } from "src/models/UserModels";

export default async function FetchUsers(): Promise<UserModels[]> {
  try {
    const backendURL = import.meta.env.VITE_API_URL;
    const response = await fetch(`${backendURL}/api/user/get-user-list`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data: ResponseModels<UserModels> = await response.json();
    
    return data.data;
  } catch (error) {
    throw new Error(error);
  }
}