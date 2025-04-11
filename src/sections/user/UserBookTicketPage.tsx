import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Container,
  useMediaQuery,
  useTheme,
  Alert,
  Snackbar,
} from '@mui/material';
import { FlightModels } from 'src/models/FlightModels';
import { useRouter } from 'src/routes/hooks';
import { UserModels } from 'src/models/UserModels';
import GetSessionData from 'src/_mock/FetchSession';
import { AccountPopover } from 'src/layouts/components/account-popover';
import { NotificationsPopover } from 'src/layouts/components/notifications-popover';
import { _notifications } from 'src/_mock';
import { ResponseModels } from 'src/models/ResponseModels';
import FetchFlights from 'src/_mock/FetchFlights';
import { BookingModels } from 'src/models/BookingModels';
import FetchBookings from 'src/_mock/FetchBookings';
import planeImg from './images/plane_wing1.jpg';
import FlightDetailPopup from '../product/FlightDetailPopup';

interface UserFlightTicketsProps {
  flights: FlightModels[];
}

async function createBooking(booking: BookingModels) {
  try {
    const backendURL = import.meta.env.VITE_API_URL;

    const response = await fetch(`${backendURL}/api/booking/post-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    });

    const data: ResponseModels<BookingModels> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create booking');
    }

    return data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

const UserBookTicketPage: React.FC<UserFlightTicketsProps> = ({ flights }) => {
  const router = useRouter();

  const [from, setFrom] = useState('');
  const [destination, setDestination] = useState('');
  const [flightTime, setFlightTime] = useState('');

  const [userData, setUserData] = useState<UserModels[]>([]);
  const [userSess, setUserSess] = useState<UserModels | null>(null);
  const [flightData, setFlightData] = useState<FlightModels[]>([]);
  const [bookingData, setBookingData] = useState<BookingModels[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const [seatCount, setSeatCount] = useState<number>(1);

  const [selectedFlight, setSelectedFlight] = useState<FlightModels | null>(null);
  const [openDetailPopup, setOpenDetailPopup] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    async function FetchSession() {
      const sessionUser: UserModels[] = await GetSessionData();

      if (sessionUser) {
        setUserSess(sessionUser[0]); // Set user if session exists
        if (sessionUser[0].userRole !== 'user') {
          router.replace('/homePage');
        }
      } else {
        router.replace('/sign-in'); // Redirect to login page if no session
      }
    }

    FetchSession();
  }, [router]);

  useEffect(() => {
    async function FetchData() {
      try {
        const [bookings, flightsPromise] = await Promise.allSettled([
          FetchBookings(userSess?.userID ?? ''),
          FetchFlights(),
        ]);

        if (bookings.status === 'fulfilled') setBookingData(bookings.value);
        else console.error('Failed to fetch booking:', bookings.reason);

        if (flightsPromise.status === 'fulfilled') setFlightData(flightsPromise.value);
        else console.error('Failed to fetch flights:', flightsPromise.reason);
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }

    FetchData();
  }, [userSess?.userID]);

  const filteredFlights = flights.filter(
    (flight) =>
      flight.flightFrom.toLowerCase().includes(from.toLowerCase()) &&
      flight.flightDestination.toLowerCase().includes(destination.toLowerCase()) &&
      (flightTime === '' || new Date(flight.flightTime).toISOString().startsWith(flightTime))
  );

  const handleBuyFlight = async (flight: FlightModels) => {
    if (!selectedFlight || !userSess) return;

    if (seatCount <= 0) {
      alert('Please select at least 1 seat to book.');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingDatas: BookingModels = {
        bookingID: '',
        userID: userSess.userID,
        flightID: flight.flightID,
        bookingPrice: flight.flightPrice * seatCount,
        paymentStatus: 'pending',
        bookingConfirmation: 'waiting for payment',
        seatAmount: seatCount,
      };
      
      await createBooking(bookingDatas);

      const updatedFlights = await FetchFlights();
      setFlightData(updatedFlights);

      setSnackbarMessage('Flight booked successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setOpenDetailPopup(false);
    } catch (error) {
      setSnackbarMessage(`Failed to book flight: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: '#1e40af' }}>
        <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: { xs: 1, sm: 0 } }}
            onClick={() => router.replace('/')}
          >
            <Typography variant="h6" fontWeight="bold">
              E Ticketing
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: { xs: 1, sm: 0 } }}>
            <Button color="inherit">Home</Button>
            <Button color="inherit">About</Button>
            <Button color="inherit">Service</Button>
            <Button color="inherit">Contact</Button>
            {userSess ? (
              <Box gap={1} display="flex" alignItems="center">
                <AccountPopover />
              </Box>
            ) : (
              <Button
                color="inherit"
                variant="outlined"
                sx={{ borderColor: 'white', color: 'white' }}
                onClick={() => {
                  router.replace('/sign-in');
                }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Banner Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: { xs: 6, md: 12 },
          backgroundColor: '#f5f5f5',
        }}
      >
        <Box
          sx={{
            backgroundImage: `url(${planeImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: { xs: '90%', sm: '85%', md: '75%' },
            borderRadius: 4,
            color: 'white',
            textAlign: 'center',
            p: { xs: 3, md: 6 },
            boxShadow: 4,
          }}
        >
          <Typography variant={isSmallScreen ? 'h4' : 'h3'} fontWeight="bold" gutterBottom>
            Find Your Destination
          </Typography>
          <Typography variant={isSmallScreen ? 'body1' : 'h6'}>
            Order your flight with ease
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: 'center',
              mt: 5,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              p: 3,
              borderRadius: 3,
              width: 'fit-content',
              mx: 'auto',
            }}
          >
            <TextField
              label="From"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              size="small"
            />
            <TextField
              label="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              size="small"
            />
            <TextField
              label="Departure"
              type="date"
              value={flightTime}
              onChange={(e) => setFlightTime(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" sx={{ px: 4 }}>
              Search
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Flight List */}
      <Container sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom fontWeight="medium">
          My Booked Flights
        </Typography>

        <Grid container spacing={3}>
          {filteredFlights.map((flight) => (
            <Grid item xs={12} sm={6} md={4} key={flight.flightID}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 4,
                  boxShadow: 3,
                  backgroundColor: '#fdfdfd',
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    {flight.flightFrom} ➔ {flight.flightDestination}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Flight ID: {flight.flightID}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Departure: {new Date(flight.flightTime).toUTCString()}
                  </Typography>
                  <Typography variant="body1">
                    Arrival: {new Date(flight.flightArrival).toUTCString()}
                  </Typography>
                  <Typography variant="body1">
                    Remaining Seats: {flight.flightSeat}
                  </Typography>
                  <Typography variant="body1">
                    Price:{' '}
                    {Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(flight.flightPrice)}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                      setSelectedFlight(flight);
                      setOpenDetailPopup(true);
                    }}
                  >
                    Book Flight
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{ py: 4, textAlign: 'center', backgroundColor: '#1e40af', color: 'white' }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} E Ticketing. All rights reserved.
        </Typography>
      </Box>

      {selectedFlight && (
        <FlightDetailPopup
          open={openDetailPopup}
          onClose={() => setOpenDetailPopup(false)}
          onBook={() => handleBuyFlight(selectedFlight)}
          flight={selectedFlight}
          airlineData={userData}
          seatCount={seatCount}
          onSeatCountChange={setSeatCount}
          bookingLoading={bookingLoading}
        />
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserBookTicketPage;
