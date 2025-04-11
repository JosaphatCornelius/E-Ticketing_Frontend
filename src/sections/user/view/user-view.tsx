import { useState, useCallback, useEffect } from 'react';
import { UserModels } from 'src/models/UserModels';
import GetSessionData from 'src/_mock/FetchSession';
import { useRouter } from 'src/routes/hooks';
import FetchUsers from 'src/_mock/FetchUsers';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { Alert, Snackbar } from '@mui/material';
import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import AddUserPopup from '../AddUserPopup'; // Adjust the import path
// Import FetchUsers

// ----------------------------------------------------------------------

export function UserView() {
  const table = useTable();
  const router = useRouter();

  // State for fetched users
  const [users, setUsers] = useState<UserModels[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState('');
  const [openPopup, setOpenPopup] = useState(false); // Popup state
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Fetch users when the component mounts
  useEffect(() => {
    async function getUsers() {
      try {
        const fetchedUsers = await FetchUsers();
        setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
      } catch (error) {
        console.log('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    }

    getUsers();
  }, []);

  useEffect(() => {
    async function FetchSession() {
      const sessionUser: UserModels[] = await GetSessionData();

      if (sessionUser) {
        if (sessionUser[0].userRole === 'maskapai') {
          router.replace('/flights');
        }

        if (sessionUser[0].userRole === 'user') {
          router.replace('/');
        }
      } else {
        router.replace('/sign-in'); // Redirect to login page if no session
      }
    }

    FetchSession();
  }, [router]);

  // Function to refresh user list after adding a new user
  const handleUserAdded = async () => {
    setLoading(true);
    try {
      const updatedUsers = await FetchUsers();
      setUsers(Array.isArray(updatedUsers) ? updatedUsers : []);
    } catch (error) {
      console.error('Failed to refresh users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUsers = async () => {
    if (table.selected.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${table.selected.length} user(s)?`
    );
    if (!confirmed) return;

    try {
      const backendURL = import.meta.env.VITE_API_URL;
      await fetch(`${backendURL}/api/user/delete-multiple-users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(table.selected), // this is the list of userIDs
      });

      const updatedUsers = await FetchUsers(); // refresh the list
      setUsers(updatedUsers);
      table.onSelectAllRows(false, []);
    } catch (error) {
      console.error('Failed to delete users:', error);
    }
  };

  const handleDeleteSingleUser = async (userID: string) => {
    try {
      const backendURL = import.meta.env.VITE_API_URL;
      await fetch(`${backendURL}/api/user/delete-user?userID=${userID}`, { method: 'DELETE' });

      const updatedUsers = await FetchUsers();
      setUsers(updatedUsers);
      table.onSelectAllRows(false, []);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Apply filters to the fetched data
  const dataFiltered: UserModels[] = applyFilter({
    inputData: users,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Users
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setOpenPopup(true)} // Open popup
        >
          New user
        </Button>
      </Box>

      {/* Add User Popup */}
      <AddUserPopup
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        onAddUser={handleUserAdded}
      />

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
          onDeleteUsers={handleDeleteUsers}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={users.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    users.map((user) => user.userID)
                  )
                }
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'role', label: 'Role' },
                  { id: 'email', label: 'Email' },
                  { id: 'address', label: 'Address' },
                  { id: 'birthday', label: 'Birthday' },
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
                ) : (
                  dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRow
                        key={row.userID}
                        row={row}
                        selected={table.selected.includes(row.userID)}
                        onSelectRow={() => table.onSelectRow(row.userID)}
                        onDeleteRow={() => handleDeleteSingleUser(row.userID)}
                        onUserUpdated={handleUserAdded}
                        onShowSnackbar={() => setSnackbarOpen(true)}
                      />
                    ))
                )}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, users.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={users.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          User info successfully edited.
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
