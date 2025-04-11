import { useEffect, useState } from 'react';
import { UserModels } from 'src/models/UserModels';
import { useRouter } from 'src/routes/hooks';
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

  useEffect(() => {
    async function FetchData() {
      try {
        const [users, flights] = await Promise.allSettled([FetchUsers(), FetchFlights()]);

        if (users.status === 'fulfilled') setUserCount(users.value);
        else console.error('Failed to fetch users:', users.reason);

        if (flights.status === 'fulfilled') setFlightCount(flights.value);
        else console.error('Failed to fetch bookings:', flights.reason);
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

  return (
    userSess && (
      <DashboardContent maxWidth="xl">
        <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
          Hi, Welcome back {userSess.username}👋
        </Typography>

        <Grid container spacing={3}>
          <Grid xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Flights booked"
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
              title="New users"
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
              title="Tickets sold"
              percent={2.8}
              total={0}
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
              total={234}
              color="error"
              icon={<img alt="icon" src="/assets/icons/glass/ic-glass-message.svg" />}
              chart={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                series: [56, 30, 23, 54, 47, 40, 62, 73],
              }}
            />
          </Grid>

          <Grid xs={12} md={6} lg={12}>
            <AnalyticsOrderTimeline title="Recent Activities" list={_timeline} />
          </Grid>
        </Grid>
      </DashboardContent>
    )
  );
}
