import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  TextField,
} from '@mui/material';
import { FlightModels } from 'src/models/FlightModels';
import { UserModels } from 'src/models/UserModels';
import { BookingModels } from 'src/models/BookingModels';

interface PayFlightPopupProps {
  open: boolean;
  flight: FlightModels;
  onClose: () => void;
  onPay: (bookedSeat: number) => void;
  airlineData: UserModels[];
  seatCount: number;
  booking: BookingModels;
  bookingLoading: boolean;
}

const PayFlightPopup: React.FC<PayFlightPopupProps> = ({
  open,
  flight,
  onClose,
  onPay,
  airlineData,
  seatCount,
  bookingLoading,
  booking
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Flight Details</DialogTitle>
    <DialogContent>
      <Typography variant="h6" gutterBottom>
        {flight.flightDestination}
      </Typography>
      <Typography variant="body1">From: {flight.flightFrom}</Typography>
      <Typography variant="body1">
        Departure: {new Date(flight.flightTime).toLocaleString()}
      </Typography>
      <Typography variant="body1">
        Arrival: {new Date(flight.flightArrival).toLocaleString()}
      </Typography>
      <Typography variant="body1">Seat Booked: {booking.seatAmount}</Typography>
      <Typography variant="body1">
        Price:{' '}
        {Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(booking.bookingPrice)}
      </Typography>
      <Typography variant="body1">Amount of Seat: {seatCount}</Typography>

      <Divider sx={{ my: 2 }} />
      <Typography variant="body2" color="textSecondary">
        Flight ID: {flight.flightID}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Airline ID: {airlineData.find((x) => x.userID === flight.airlineID)?.username || 'Unknown'}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={() => onPay(seatCount)} disabled={bookingLoading}>
        Pay now
      </Button>
    </DialogActions>
  </Dialog>
);

export default PayFlightPopup;
