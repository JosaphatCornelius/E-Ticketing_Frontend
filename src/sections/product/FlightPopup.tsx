import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import { FlightModels } from 'src/models/FlightModels';
import FetchUsers from 'src/_mock/FetchUsers';
import FetchFlights from 'src/_mock/FetchFlights';
import FetchAirlines from 'src/_mock/FetchAirlines';
import { AirlineModels } from 'src/models/AirlineModels';
import { UserModels } from 'src/models/UserModels';
import GetSessionData from 'src/_mock/FetchSession';
import { useRouter } from 'src/routes/hooks';

interface FlightPopupProps {
  open: boolean;
  onClose: () => void;
  onAddFlight: () => void;
}

type FlightErrors = {
  [K in keyof FlightModels]: string;
};

const initialFormState: FlightModels = {
  flightID: '',
  flightDestination: '',
  flightTime: new Date(),
  flightArrival: new Date(),
  flightFrom: '',
  airlineID: '',
  flightPrice: 0,
  flightSeat: 0,
  bookedSeat: 0,
};

const FlightPopup: React.FC<FlightPopupProps> = ({ open, onClose, onAddFlight }) => {
  const router = useRouter();

  const [userSess, setUserSess] = useState<UserModels | null>(null);
  const [userData, setUserData] = useState<UserModels[]>([]);
  const [flightDataBackend, setFlightDataBackend] = useState<FlightModels[]>([]);
  const [airlineData, setAirlineData] = useState<AirlineModels[]>([]);

  const [flightData, setFlightData] = useState<FlightModels>(initialFormState);
  const [errors, setErrors] = useState<FlightErrors>({
    flightID: '',
    flightDestination: '',
    flightTime: '',
    flightArrival: '',
    flightFrom: '',
    airlineID: '',
    flightPrice: '',
    flightSeat: '',
    bookedSeat: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function FetchData() {
      try {
        const [users, flights, airlines] = await Promise.allSettled([
          FetchUsers(),
          FetchFlights(),
          FetchAirlines(),
        ]);

        if (users.status === 'fulfilled') setUserData(users.value);
        else console.error('Failed to fetch users:', users.reason);

        if (flights.status === 'fulfilled') setFlightDataBackend(flights.value);
        else console.error('Failed to fetch flights:', flights.reason);

        if (airlines.status === 'fulfilled') setAirlineData(airlines.value);
        else console.error('Failed to fetch airlines:', airlines.reason);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false); // ✅ Stop loading regardless of success or failure
      }
    }

    FetchData();
  }, []);

  useEffect(() => {
    async function FetchSession() {
      const sessionUser: UserModels[] = await GetSessionData();

      if (sessionUser) {
        setUserSess(sessionUser[0]); // Set user if session exists

        // Properly update the flightData state with airlineID
        setFlightData((prev) => ({
          ...prev,
          airlineID: sessionUser[0].userID,
        }));
      }
    }

    FetchSession();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFlightData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateArrival = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlightData((prev) => ({
      ...prev,
      flightArrival: e.target.value ? new Date(e.target.value) : new Date(),
    }));
  };

  const handleDateTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlightData((prev) => ({
      ...prev,
      flightTime: e.target.value ? new Date(e.target.value) : new Date(),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const newErrors: FlightErrors = {
      flightID: '',
      flightDestination:
        flightData.flightDestination.trim() === '' ? 'Destination cannot be empty' : '',
      flightTime:
        !flightData.flightTime || Number.isNaN(flightData.flightTime.getTime())
          ? 'Departure time cannot be empty'
          : '',
      flightArrival:
        !flightData.flightArrival || Number.isNaN(flightData.flightArrival.getTime())
          ? 'Flight arrival time cannot be empty'
          : '',
      flightFrom: flightData.flightFrom.trim() === '' ? 'Departure location cannot be empty' : '',
      airlineID: flightData.airlineID.trim() === '' ? 'Airline ID cannot be empty' : '',
      flightPrice:
        flightData.flightPrice === null ||
        flightData.flightPrice === undefined ||
        // flightData.flightPrice === '' ||
        Number.isNaN(flightData.flightPrice) ||
        Number(flightData.flightPrice) <= 0
          ? 'Flight price must be greater than 0'
          : '',
      flightSeat:
        flightData.flightSeat === null ||
        flightData.flightSeat === undefined ||
        // flightData.flightSeat === '' ||
        Number.isNaN(flightData.flightSeat) ||
        Number(flightData.flightSeat) <= 0
          ? 'Flight seat must be greater than 0'
          : '',
      bookedSeat: '',
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      setLoading(false);
      return;
    }

    try {
      const backendURL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${backendURL}/api/flight/post-flight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightData),
        mode: 'cors',
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to add flights');

      onAddFlight();
      onClose();
    } catch (error) {
      alert(`Error adding flights: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Flight</DialogTitle>
      <DialogContent>
        <TextField
          label="Flight Destination"
          name="flightDestination"
          value={flightData.flightDestination}
          onChange={handleChange}
          fullWidth
          margin="dense"
          required
          error={!!errors.flightDestination}
          helperText={errors.flightDestination}
          sx={{ my: 2 }}
        />
        <TextField
          label="Flight From"
          name="flightFrom"
          value={flightData.flightFrom}
          onChange={handleChange}
          fullWidth
          margin="dense"
          required
          error={!!errors.flightFrom}
          helperText={errors.flightFrom}
          sx={{ my: 2 }}
        />
        <TextField
          label="Departure"
          name="flightTime"
          type="date"
          value={flightData.flightTime.toISOString().split('T')[0]}
          onChange={handleDateTime}
          fullWidth
          margin="dense"
          required
          error={!!errors.flightTime}
          helperText={errors.flightTime}
          InputLabelProps={{ shrink: true }}
          sx={{ my: 2 }}
        />
        <TextField
          label="Flight Arrival"
          name="flightArrival"
          type="date"
          value={flightData.flightArrival.toISOString().split('T')[0]}
          onChange={handleDateArrival}
          fullWidth
          margin="dense"
          required
          error={!!errors.flightArrival}
          helperText={errors.flightArrival}
          InputLabelProps={{ shrink: true }}
          sx={{ my: 2 }}
        />
        {/* <TextField
          select
          label="Airline ID"
          name="airlineID"
          value={flightData.airlineID}
          onChange={handleChange}
          fullWidth
          margin="dense"
          required
          error={!!errors.airlineID}
          helperText={errors.airlineID}
          sx={{ my: 2 }}
        >
          {userData.map((users) =>
            users.userRole === 'airline' ? <MenuItem value="">{users.username}</MenuItem> : null
          )}
        </TextField> */}
        <TextField
          label="Flight Seat"
          name="flightSeat"
          type="number"
          value={flightData.flightSeat}
          onChange={handleChange}
          fullWidth
          margin="dense"
          required
          error={!!errors.flightSeat}
          helperText={errors.flightSeat}
          sx={{ my: 2 }}
        />
        <TextField
          label="Flight Price"
          name="flightPrice"
          type="number"
          value={flightData.flightPrice}
          onChange={handleChange}
          fullWidth
          margin="dense"
          required
          error={!!errors.flightPrice}
          helperText={errors.flightPrice}
          sx={{ my: 2 }}
        />
        {/* <TextField
          select
          label="Payment Status"
          name="paymentStatus"
          value={flightData.paymentStatus}
          onChange={handleChange}
          fullWidth
          margin="dense"
          required
          error={!!errors.paymentStatus}
          helperText={errors.paymentStatus}
          sx={{ my: 2 }}
        >
          <MenuItem value="y">Paid</MenuItem>
          <MenuItem value="n">Not Paid</MenuItem>
        </TextField> */}
        {/* <TextField
          select
          label="Flight Confirmation"
          name="flightConfirmation"
          value={flightData.flightConfirmation}
          onChange={handleChange}
          fullWidth
          margin="dense"
          required
          error={!!errors.flightConfirmation}
          helperText={errors.flightConfirmation}
          sx={{ my: 2 }}
        >
          <MenuItem value="y">Confirmed</MenuItem>
          <MenuItem value="n">Not Confirmed</MenuItem>
        </TextField> */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlightPopup;
