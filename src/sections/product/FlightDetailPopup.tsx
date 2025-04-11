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

interface FlightDetailPopupProps {
  open: boolean;
  flight: FlightModels;
  onClose: () => void;
  onBook: (bookedSeat: number) => void;
  airlineData: UserModels[];
  seatCount: number;
  onSeatCountChange: (value: number) => void;
  bookingLoading: boolean;
}

const FlightDetailPopup: React.FC<FlightDetailPopupProps> = ({
  open,
  flight,
  onClose,
  onBook,
  airlineData,
  seatCount,
  onSeatCountChange,
  bookingLoading,
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
      <Typography variant="body1">Seat Remaining: {flight.flightSeat}</Typography>
      <Typography variant="body1">
        Price:{' '}
        {Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(flight.flightPrice)}
      </Typography>

      <TextField
        fullWidth
        label="Amount of Seat"
        type="number"
        inputProps={{ min: 1, max: flight.flightSeat }}
        value={Number.isNaN(seatCount) ? '' : seatCount}
        onChange={(e) => {
          const val = e.target.value;
          if (val === '') {
            onSeatCountChange(NaN);
          } else {
            onSeatCountChange(Number(val));
          }
        }}
        sx={{ mt: 2 }}
      />

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
      <Button onClick={() => onBook(seatCount)} disabled={bookingLoading}>
        Book
      </Button>
    </DialogActions>
  </Dialog>
);

export default FlightDetailPopup;
