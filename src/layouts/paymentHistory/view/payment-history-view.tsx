import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'src/routes/hooks';
import FetchFlights from 'src/_mock/FetchFlights';
import { FlightModels } from 'src/models/FlightModels';
import GetSessionData from 'src/_mock/FetchSession';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';

import { TableCell, TableHead, TableRow } from '@mui/material';
import { TableNoData } from 'src/sections/user/table-no-data';
import { TableEmptyRows } from 'src/sections/user/table-empty-rows';
import { ResponseModels } from 'src/models/ResponseModels';
import { BookingModels } from 'src/models/BookingModels';
import FetchBookings from 'src/_mock/FetchBookings';
import FetchUsers from 'src/_mock/FetchUsers';
import { UserModels } from 'src/models/UserModels';
import FlightConfirmationTableRow from '../FlightConfirmationTableRow';
import { applyFilter, emptyRows, getComparator } from '../utils';
import { HistoryToolbar } from '../history-toolbar';

// ----------------------------------------------------------------------

async function createBooking(booking: BookingModels) {
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
      throw new Error(data.message || 'Failed to create booking');
    }

    return data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

export function FlightPaymentHistory() {
  const table = useTable();
  const router = useRouter();

  const [userSess, setUserSess] = useState<UserModels | null>(null);
  const [userData, setUserData] = useState<UserModels[]>([]);
  const [bookingData, setBookingData] = useState<BookingModels[]>([]);
  const [flights, setFlights] = useState<FlightModels[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    async function FetchData() {
      try {
        const [users, bookings, flightsPromise] = await Promise.allSettled([
          FetchUsers(),
          FetchBookings(''),
          FetchFlights('', '', ''),
        ]);

        if (users.status === 'fulfilled') setUserData(users.value);
        else console.error('Failed to fetch users:', users.reason);

        if (bookings.status === 'fulfilled') setBookingData(bookings.value);
        else console.error('Failed to fetch booking:', bookings.reason);

        if (flightsPromise.status === 'fulfilled') setFlights(flightsPromise.value);
        else console.error('Failed to fetch flights:', flightsPromise.reason);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false); // <= Tambahkan ini
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

  useEffect(() => {
    async function checkSession() {
      const sessionUser = await GetSessionData();

      if (sessionUser?.[0]?.userRole === 'admin') {
        router.replace('/homePage');
      }
    }

    checkSession();
  }, [router]);

  const handleConfirm = async (flight: FlightModels, booking: BookingModels) => {
    try {
      const bookingDatas: BookingModels = {
        ...booking,
        bookingID:
          bookingData.find((x) => x.flightID === flight.flightID && x.userID === booking.userID)
            ?.bookingID || '',
        bookingConfirmation: 'confirmed',
      };

      await createBooking(bookingDatas);

      const updatedFlights = await FetchFlights('', '', '');
      setFlights(updatedFlights);

      const updatedBookings = await FetchBookings('');
      setBookingData(updatedBookings); // <- Auto-refresh here!
    } catch (err) {
      console.error('Payment patch failed:', err);
    }
  };

  const handleDeny = async (flight: FlightModels, booking: BookingModels) => {
    try {
      const bookingDatas: BookingModels = {
        ...booking,
        bookingID:
          bookingData.find((x) => x.flightID === flight.flightID && x.userID === booking.userID)
            ?.bookingID || '',
        bookingConfirmation: 'denied',
      };

      await createBooking(bookingDatas);

      const updatedFlights = await FetchFlights('', '', '');
      setFlights(updatedFlights);

      const updatedBookings = await FetchBookings('');
      setBookingData(updatedBookings); // <- Auto-refresh here!
    } catch (err) {
      console.error('Payment patch failed:', err);
    }
  };

  const getConfirmedOrDeniedFlights = () => {
    // Ambil hanya flightID yang memiliki paymentStatus !== 'pending'
    const validFlightIDs = bookingData
      .filter((b) => b.paymentStatus !== 'pending')
      .map((b) => b.flightID);

    // Ambil hanya flight yang flightID-nya ada di validFlightIDs
    return flights.filter((flight) => validFlightIDs.includes(flight.flightID));
  };

  const dataFiltered: FlightModels[] = applyFilter({
    inputData: getConfirmedOrDeniedFlights(),
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Flight Payment History
        </Typography>
      </Box>

      <Card>
        <HistoryToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Destination</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>Airline</TableCell>
                  <TableCell>Departure</TableCell>
                  <TableCell>Arrival</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {bookingData
                      .filter((booking) => booking.paymentStatus === 'confirmed')
                      .filter((booking) => flights.find((x) => booking.flightID === x.flightID)?.airlineID === userSess?.userID)
                      .filter((booking) => {
                        const flight = flights.find((f) => f.flightID === booking.flightID);
                        if (!flight) return false;
                        return (
                          flight.flightDestination
                            .toLowerCase()
                            .includes(filterName.toLowerCase()) ||
                          flight.flightFrom.toLowerCase().includes(filterName.toLowerCase())
                        );
                      })
                      .sort((a, b) => {
                        const flightA = flights.find((f) => f.flightID === a.flightID);
                        const flightB = flights.find((f) => f.flightID === b.flightID);

                        if (!flightA || !flightB) return 0;

                        const aValue = new Date(flightA.flightTime).getTime();
                        const bValue = new Date(flightB.flightTime).getTime();

                        return table.order === 'asc' ? aValue - bValue : bValue - aValue;
                      })
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((booking) => {
                        const flight = flights.find((f) => f.flightID === booking.flightID);
                        if (!flight) return null;

                        return (
                          <FlightConfirmationTableRow
                            key={booking.bookingID}
                            row={flight}
                            userData={userData}
                            booking={booking} // Kirim juga data booking jika diperlukan
                            selected={table.selected.includes(flight.flightID)}
                            onSelectRow={() => table.onSelectRow(flight.flightID)}
                            onConfirm={() => handleConfirm(flight, booking)}
                            onDeny={() => handleDeny(flight, booking)}
                          />
                        );
                      })}

                    <TableEmptyRows
                      height={68}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    {!dataFiltered.length && !loading && <TableNoData searchQuery={filterName} />}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={dataFiltered.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('flightTime');
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
    setSelected(checked ? newSelecteds : []);
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

  const onResetPage = useCallback(() => setPage(0), []);

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
