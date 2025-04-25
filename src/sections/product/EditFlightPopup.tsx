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

type EditFlightPopupProps = {
  open: boolean;
  onClose: () => void;
  flightsData: FlightModels;
  onFlightDataUpdated: () => void;
};

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

const EditFlightPopup: React.FC<EditFlightPopupProps> = ({
  open,
  onClose,
  flightsData,
  onFlightDataUpdated,
}) => {
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
    if (open && flightsData) {
      setFlightData({
        ...flightsData,
        flightTime: new Date(flightsData.flightTime),
        flightArrival: new Date(flightsData.flightArrival),
      });
    }
  }, [open, flightsData]);

  useEffect(() => {
    async function FetchData() {
      try {
        const [users, flights, airlines] = await Promise.allSettled([
          FetchUsers(),
          FetchFlights('', '', ''),
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
        Number.isNaN(flightData.flightPrice) ||
        Number(flightData.flightPrice) <= 0
          ? 'Flight price must be greater than 0'
          : '',
      flightSeat:
        flightData.flightSeat === null ||
        flightData.flightSeat === undefined ||
        Number.isNaN(flightData.flightSeat) ||
        Number(flightData.flightSeat) <= 0
          ? 'Flight seat must be greater than 0'
          : '',
      bookedSeat: '',
    };

    // ✅ Add validation for H-1 restriction here:
    const today = new Date();
    today.setHours(0, 0, 0, 0); // remove time

    const hMinusOne = new Date(today);
    hMinusOne.setDate(today.getDate() + 1); // tomorrow

    if (flightData.flightTime <= hMinusOne) {
      newErrors.flightTime = 'Flight time must be at least tomorrow';
    }

    if (flightData.flightArrival <= hMinusOne) {
      newErrors.flightArrival = 'Flight arrival must be at tomorrow';
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      setLoading(false);
      return;
    }

    try {
      const backendURL = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${backendURL}/api/flight/update-flight?flightID=${flightData.flightID}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(flightData),
          mode: 'cors',
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to update flights');

      onFlightDataUpdated();
      onClose();
    } catch (error) {
      alert(`Error adding flights: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDateToLocalInput = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Flight Data</DialogTitle>
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
          type="datetime-local"
          value={formatDateToLocalInput(flightData.flightTime)}
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
          type="datetime-local"
          value={formatDateToLocalInput(flightData.flightArrival)}
          onChange={handleDateArrival}
          fullWidth
          margin="dense"
          required
          error={!!errors.flightArrival}
          helperText={errors.flightArrival}
          InputLabelProps={{ shrink: true }}
          sx={{ my: 2 }}
        />
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

export default EditFlightPopup;
