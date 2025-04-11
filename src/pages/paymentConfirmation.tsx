import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { FlightConfirmationView } from 'src/layouts/paymentConfirmation/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Payment Confirmation</title>
      </Helmet>

      <FlightConfirmationView />
    </>
  );
}
