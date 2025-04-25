import { FlightModels } from 'src/models/FlightModels';
import { ResponseModels } from 'src/models/ResponseModels';

export default async function FetchFlights(
  from: string,
  destination: string,
  departure: string
): Promise<FlightModels[]> {
  try {
    const backendURL = import.meta.env.VITE_API_URL;
    const response = await fetch(
      `${backendURL}/api/flight/get-flight-list?from=${from}&destination=${destination}&departure=${departure}`
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data: ResponseModels<FlightModels> = await response.json();

    return data.data;
  } catch (error) {
    throw new Error(error);
  }
}
