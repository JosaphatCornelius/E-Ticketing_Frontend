import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import { UserModels } from 'src/models/UserModels';
import GetSessionData from 'src/_mock/FetchSession';
import { ResponseModels } from 'src/models/ResponseModels';
import { FlightModels } from 'src/models/FlightModels';
import FetchAirlines from 'src/_mock/FetchAirlines';
import FetchUsers from 'src/_mock/FetchUsers';
import { AirlineModels } from 'src/models/AirlineModels';
import FetchFlights from 'src/_mock/FetchFlights';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { TableEmptyRows } from 'src/sections/user/table-empty-rows';
import { TableNoData } from 'src/sections/user/table-no-data';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Alert, Snackbar } from '@mui/material';
import { ProductTableRow } from '../product-table-row';
import { applyFilter, emptyRows, getComparator } from '../utils';
import { ProductTableToolbar } from '../product-table-toolbar';
import { ProductTableHead } from '../product-table-head';

// Import FlightPopup
import FlightPopup from '../FlightPopup'; // Import the FlightPopup component
import FlightDetailPopup from '../FlightDetailPopup';

// ----------------------------------------------------------------------

async function patchFlightUserID(
  flightID: string,
  userID: string,
  flight: FlightModels,
  seatCount: number
) {
  try {
    const backendURL = import.meta.env.VITE_API_URL;

    const updatedFlight = {
      ...flight,
      userID,
      bookedSeat: seatCount, // include seat count
    };

    const response = await fetch(`${backendURL}/api/flight/update-flight?flightID=${flightID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedFlight),
    });

    const data: ResponseModels<FlightModels> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update flight');
    }

    return data;
  } catch (error) {
    console.error('Error updating flight userID:', error);
    throw error;
  }
}

export function ProductsView() {
  const table = useTable();
  const router = useRouter();

  // State for fetched users
  const [userData, setUserData] = useState<UserModels[]>([]);
  const [userSess, setUserSess] = useState<UserModels | null>(null);
  const [flightData, setFlightData] = useState<FlightModels[]>([]);
  const [airlineData, setAirlineData] = useState<AirlineModels[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const [filterFrom, setFilterFrom] = useState('');
  const [filterDestination, setFilterDestination] = useState('');

  const [seatCount, setSeatCount] = useState<number>(1);

  const [openPopup, setOpenPopup] = useState(false); // State to control the popup

  const [selectedFlight, setSelectedFlight] = useState<FlightModels | null>(null);
  const [openDetailPopup, setOpenDetailPopup] = useState(false);

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

        if (flights.status === 'fulfilled') setFlightData(flights.value);
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

  // Function to refresh flight list after adding a new flight
  const handleFlightAdded = async () => {
    setLoading(true);
    try {
      const updatedFlights = await FetchFlights();
      setFlightData(Array.isArray(updatedFlights) ? updatedFlights : []);
    } catch (error) {
      console.error('Failed to refresh flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleViewFlightDetails = (flight: FlightModels) => {
    setSelectedFlight(flight);
    setOpenDetailPopup(true);
  };

  const handleBuyFlight = async (flight: FlightModels) => {
    if (!selectedFlight || !userSess) return;

    if (seatCount <= 0) {
      alert('Please select at least 1 seat to book.');
      return;
    }

    setBookingLoading(true);
    try {
      await patchFlightUserID(selectedFlight.flightID, userSess.userID, flight, seatCount);

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

  useEffect(() => {
    async function FetchSession() {
      const sessionUser: UserModels[] = await GetSessionData();

      if (sessionUser) {
        setUserSess(sessionUser[0]); // Set user if session exists
        if (sessionUser?.[0]?.userRole === 'user') {
          router.replace('/');
        }
      } else {
        router.replace('/sign-in'); // Redirect to login page if no session
      }
    }

    FetchSession();
  }, [router]);

  // Apply filters to the fetched data
  const dataFiltered: FlightModels[] = applyFilter({
    inputData: flightData,
    comparator: getComparator(table.order, table.orderBy),
    filterName: '', // no longer used here
  }).filter((flight) => {
    const matchesFrom = filterFrom
      ? flight.flightFrom.toLowerCase().includes(filterFrom.toLowerCase())
      : true;

    const matchesDestination = filterDestination
      ? flight.flightDestination.toLowerCase().includes(filterDestination.toLowerCase())
      : true;

    return matchesFrom && matchesDestination;
  });

  const notFound = !dataFiltered.length && (!!filterFrom || !!filterDestination);

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Flights
        </Typography>

        {userSess?.userRole === 'airline' ? (
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setOpenPopup(true)} // Open the popup when clicked
          >
            New flight
          </Button>
        ) : null}
      </Box>
      <Card>
        <ProductTableToolbar
          numSelected={table.selected.length}
          filterFrom={filterFrom}
          filterDestination={filterDestination}
          onFilterFromChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterFrom(event.target.value);
            table.onResetPage();
          }}
          onFilterDestinationChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterDestination(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <ProductTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={flightData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    flightData.map((flight) => flight.flightID)
                  )
                }
                userRole={userSess?.userRole}
                headLabel={[
                  { id: 'destination', label: 'Destination' },
                  { id: 'from', label: 'From' },
                  { id: 'airline', label: 'Airline' },
                  // { id: 'user', label: 'User' },
                  { id: 'flightTime', label: 'Departure' },
                  { id: 'flightArrival', label: 'Flight Arrival' },
                  { id: 'flightSeat', label: 'Flight Seats' },
                  { id: 'flightPrice', label: 'Flight Price' },
                  // { id: 'isVerified', label: 'Verified', align: 'center' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                      Loading...
                    </td>
                  </tr>
                ) : flightData.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                      No flights available.
                    </td>
                  </tr>
                ) : (
                  dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <ProductTableRow
                        key={row.flightID}
                        row={row}
                        selected={table.selected.includes(row.flightID)}
                        onSelectRow={() => table.onSelectRow(row.flightID)}
                        onViewDetails={() => handleViewFlightDetails(row)} // 👈 Add this
                      />
                    ))
                )}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, flightData.length)}
                />

                {notFound && <TableNoData searchQuery={filterFrom} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={flightData.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
      {/* Integrate the FlightPopup */}
      <FlightPopup
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        onAddFlight={handleFlightAdded}
      />
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
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
