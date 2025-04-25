import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { FlightPaymentHistory } from 'src/layouts/paymentHistory/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Payment History</title>
      </Helmet>

      <FlightPaymentHistory />
    </>
  );
}
