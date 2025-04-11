import { BookingModels } from "src/models/BookingModels";
import { ResponseModels } from "src/models/ResponseModels";

export default async function FetchBookings(userID: string): Promise<BookingModels[]> {
  try {
    const backendURL = import.meta.env.VITE_API_URL;
    const response = await fetch(`${backendURL}/api/booking/get-booking-list?userID=${userID}`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data: ResponseModels<BookingModels> = await response.json();
    return data.data;
  } catch (error) {
    throw new Error(error);
  }
}