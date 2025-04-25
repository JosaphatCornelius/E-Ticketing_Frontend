import { useEffect, useState } from 'react';
import { AirlineModels } from 'src/models/AirlineModels';
import FetchAirlines from 'src/_mock/FetchAirlines';
import { BookingModels } from 'src/models/BookingModels';
import { UserModels } from 'src/models/UserModels';
import { useRouter } from 'src/routes/hooks';
import FetchBookings from 'src/_mock/FetchBookings';
import GetSessionData from 'src/_mock/FetchSession';
import FetchFlights from 'src/_mock/FetchFlights';
import { FlightModels } from 'src/models/FlightModels';
import FetchUsers from 'src/_mock/FetchUsers';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { _tasks, _posts, _timeline } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsNews } from '../analytics-news';
import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsTrafficBySite } from '../analytics-traffic-by-site';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const router = useRouter();
  const [userSess, setUserSess] = useState<UserModels | null>(null);

  const [userCount, setUserCount] = useState<UserModels[] | null>([]);
  const [flightCount, setFlightCount] = useState<FlightModels[] | null>([]);
  const [airlineCount, setAirlineCount] = useState<AirlineModels[] | null>([]);
  const [bookingCount, setBookingCount] = useState<BookingModels[] | null>([]);

  useEffect(() => {
    async function FetchData() {
      try {
        const [users, flights, airline, bookings] = await Promise.allSettled([
          FetchUsers(),
          FetchFlights('', '', ''),
          FetchAirlines(),
          FetchBookings(''),
        ]);

        if (users.status === 'fulfilled') setUserCount(users.value);
        else console.error('Failed to fetch users:', users.reason);

        if (flights.status === 'fulfilled') setFlightCount(flights.value);
        else console.error('Failed to fetch bookings:', flights.reason);

        if (airline.status === 'fulfilled') setAirlineCount(airline.value);
        else console.error('Failed to fetch bookings:', airline.reason);

        if (bookings.status === 'fulfilled') setBookingCount(bookings.value);
        else console.error('Failed to fetch bookings:', bookings.reason);
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }

    FetchData();
  }, []);

  useEffect(() => {
    async function FetchSession() {
      const sessionUser: UserModels[] = await GetSessionData();

      if (sessionUser) {
        setUserSess(sessionUser[0]); // Set user if session exists
        if (sessionUser[0].userRole === 'user') {
          router.replace('/');
        }
      } else {
        router.replace('/sign-in'); // Redirect to login page if no session
      }
    }

    FetchSession();
  }, [router]);

  const myAirline = airlineCount?.find((x) => x.airlineID === userSess?.userID);
  const myFlights = flightCount?.filter((x) => x.airlineID === myAirline?.airlineID) || [];
  const totalRevenue = bookingCount
    ? bookingCount
        .filter((b) =>
          myFlights.some((f) => f.flightID === b.flightID && b.bookingConfirmation === 'confirmed')
        )
        .reduce((sum, b) => sum + (b.bookingPrice ?? 0), 0)
    : 0;

  const totalGlobalRevenue = bookingCount
    ? bookingCount
        .filter((b) => b.bookingConfirmation === 'confirmed')
        .reduce((sum, booking) => sum + (booking.bookingPrice ?? 0), 0)
    : 0;

  return (
    userSess && (
      <DashboardContent maxWidth="xl">
        <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
          Hi, Welcome back {userSess.username}👋
        </Typography>

        {userSess.userRole === 'airline' ? (
          <Grid container spacing={3}>
            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Flights Created"
                percent={2.6}
                total={myFlights.length}
                icon={<img alt="icon" src="/assets/icons/glass/ic-glass-bag.svg" />}
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                  series: [22, 8, 35, 50, 82, 84, 77, 12],
                }}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Tickets Sold"
                percent={2.8}
                total={myAirline?.ticketSold ?? 0}
                color="warning"
                icon={<img alt="icon" src="/assets/icons/glass/ic-glass-buy.svg" />}
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                  series: [40, 70, 50, 28, 70, 75, 7, 64],
                }}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Total Revenue"
                percent={3.6}
                total={totalRevenue}
                color="warning"
                icon={<img alt="icon" src="/assets/icons/glass/ic-glass-message.svg" />}
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                  series: [56, 30, 23, 54, 47, 40, 62, 73],
                }}
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3}>
            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Flights Created"
                percent={2.6}
                total={flightCount ? flightCount.length : 0}
                icon={<img alt="icon" src="/assets/icons/glass/ic-glass-bag.svg" />}
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                  series: [22, 8, 35, 50, 82, 84, 77, 12],
                }}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Total Users"
                percent={-0.1}
                total={userCount ? userCount.length : 0}
                color="secondary"
                icon={<img alt="icon" src="/assets/icons/glass/ic-glass-users.svg" />}
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                  series: [56, 47, 40, 62, 73, 30, 23, 54],
                }}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Tickets Sold"
                percent={2.8}
                total={
                  airlineCount ? airlineCount.reduce((sum, x) => sum + (x.ticketSold || 0), 0) : 0
                }
                color="warning"
                icon={<img alt="icon" src="/assets/icons/glass/ic-glass-buy.svg" />}
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                  series: [40, 70, 50, 28, 70, 75, 7, 64],
                }}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Total Airlines"
                percent={3.6}
                total={airlineCount ? airlineCount.length : 0}
                color="error"
                icon={<img alt="icon" src="/assets/icons/glass/ic-glass-message.svg" />}
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                  series: [56, 30, 23, 54, 47, 40, 62, 73],
                }}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Total Revenue"
                percent={3.6}
                total={totalGlobalRevenue}
                color="warning"
                icon={<img alt="icon" src="/assets/icons/glass/ic-glass-buy.svg" />}
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                  series: [56, 30, 23, 54, 47, 40, 62, 73],
                }}
              />
            </Grid>
          </Grid>
        )}
      </DashboardContent>
    )
  );
}
