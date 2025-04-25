import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import FetchFlights from 'src/_mock/FetchFlights';

import { CONFIG } from 'src/config-global';
import { FlightModels } from 'src/models/FlightModels';
import UserBookTicketPage from 'src/sections/user/UserBookTicketPage';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <UserBookTicketPage/>
    </>
  );
}
