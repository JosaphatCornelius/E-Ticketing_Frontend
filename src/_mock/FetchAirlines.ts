import { AirlineModels } from "src/models/AirlineModels";
import { ResponseModels } from "src/models/ResponseModels";

export default async function FetchAirlines(): Promise<AirlineModels[]> {
  try {
    const backendURL = import.meta.env.VITE_API_URL;
    const response = await fetch(`${backendURL}/api/flight/get-flight-list`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data: ResponseModels<AirlineModels> = await response.json();
    
    return data.data;
  } catch (error) {
    throw new Error(error);
  }
}