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
import FetchUsers from 'src/_mock/FetchUsers';
import planeImg from './images/plane_wing1.jpg';
import FlightDetailPopup from '../product/FlightDetailPopup';
import PayFlightPopup from '../product/PayFlightPopup';

interface UserFlightTicketsProps {
  flights: FlightModels[];
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'denied':
      return 'error';
    default:
      return 'default';
  }
};

async function updateBooking(booking: BookingModels) {
  try {
    const backendURL = import.meta.env.VITE_API_URL;

    const response = await fetch(`${backendURL}/api/booking/patch-booking`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    });

    const data: ResponseModels<BookingModels> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update booking');
    }

    return data;
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
}

const UserFlightTickets: React.FC<UserFlightTicketsProps> = ({ flights }) => {
  const router = useRouter();

  const [from, setFrom] = useState('');
  const [destination, setDestination] = useState('');
  const [flightTime, setFlightTime] = useState('');

  const [userSess, setUserSess] = useState<UserModels | null>(null);
  const [userData, setUserData] = useState<UserModels[]>([]);
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
        const [users, bookings, flightsPromise] = await Promise.allSettled([
          FetchUsers(),
          FetchBookings(userSess?.userID ?? ''),
          FetchFlights(),
        ]);

        if (users.status === 'fulfilled') setUserData(users.value);
        else console.error('Failed to fetch users:', users.reason);

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

  const handlePayFlight = async (flight: FlightModels) => {
    if (!selectedFlight || !userSess) return;

    setBookingLoading(true);
    try {
      const bookingDatas: BookingModels = {
        bookingID:
          bookingData.find((x) => x.flightID === flight.flightID && x.userID === userSess.userID)
            ?.bookingID || '',
        userID: '',
        flightID: '',
        bookingPrice: 0,
        paymentStatus: 'confirmed',
        bookingConfirmation: '',
        seatAmount: 0,
      };

      await updateBooking(bookingDatas);

      const updatedFlights = await FetchFlights();
      setFlightData(updatedFlights);

      const updatedBookings = await FetchBookings(userSess.userID);
      setBookingData(updatedBookings); // <- Auto-refresh here!

      setSnackbarMessage('Ticket paid successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setOpenDetailPopup(false);
    } catch (error) {
      setSnackbarMessage(`Failed to pay ticket: ${error.message}`);
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
            <Button
              variant="contained"
              sx={{ px: 4 }}
              onClick={() => {
                router.replace('book-ticket');
              }}
            >
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
          {bookingData
            .filter((booking) => booking.userID === userSess?.userID)
            .map((booking) => {
              const flight = flightData.find((f) => f.flightID === booking.flightID);
              if (!flight) return null;

              return (
                <Grid item xs={12} sm={6} md={4} key={booking.bookingID}>
                  <Box
                    onClick={() => {
                      setSelectedFlight(flight);
                      setOpenDetailPopup(true);
                    }}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 4,
                      boxShadow: 3,
                      backgroundColor: '#fdfdfd',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      },
                    }}
                  >
                    <Card sx={{ boxShadow: 'none', borderRadius: 0 }}>
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
                          Seats Booked: {booking.seatAmount} / {flight.flightSeat}
                        </Typography>
                        <Typography variant="body1">
                          Price:{' '}
                          {Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                          }).format(booking.bookingPrice)}
                        </Typography>

                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={`Payment: ${booking.paymentStatus}`}
                            color={getStatusColor(booking.paymentStatus)}
                          />
                          <Chip
                            label={`Status: ${booking.bookingConfirmation}`}
                            color={getStatusColor(booking.bookingConfirmation)}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              );
            })}
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
        <PayFlightPopup
          open={openDetailPopup}
          onClose={() => setOpenDetailPopup(false)}
          onPay={() => handlePayFlight(selectedFlight)}
          flight={selectedFlight}
          airlineData={userData}
          seatCount={
            bookingData.find(
              (x) => x.flightID === selectedFlight.flightID && x.userID === userSess?.userID
            )?.seatAmount || 0
          }
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

export default UserFlightTickets;
