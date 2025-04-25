import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import FetchFlights from 'src/_mock/FetchFlights';

import { CONFIG } from 'src/config-global';
import { FlightModels } from 'src/models/FlightModels';

import UserFlightTicketPage from 'src/sections/user/UserFlightTicketPage';

// ----------------------------------------------------------------------

export default function Page() {
  const [flightData, setFlightData] = useState<FlightModels[]>([]);

  useEffect(() => {
    async function FetchData() {
      try {
        const [flights] = await Promise.allSettled([FetchFlights('', '', '')]);

        if (flights.status === 'fulfilled') setFlightData(flights.value);
        else console.error('Failed to fetch flights:', flights.reason);
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }

    FetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <UserFlightTicketPage flights={flightData} />
    </>
  );
}
