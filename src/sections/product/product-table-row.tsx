import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { FlightModels } from 'src/models/FlightModels';
import FetchUsers from 'src/_mock/FetchUsers';
import { UserModels } from 'src/models/UserModels';
import GetSessionData from 'src/_mock/FetchSession';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

type ProductTableRowProps = {
  row: FlightModels;
  selected: boolean;
  onSelectRow: () => void;
  onViewDetails: () => void; // 👈 Add this
};

export function ProductTableRow({
  row,
  selected,
  onSelectRow,
  onViewDetails, // 👈 Add this
}: ProductTableRowProps) {
  const router = useRouter();

  const [userData, setUserData] = useState<UserModels[]>([]);
  const [userSess, setUserSess] = useState<UserModels | null>(null);

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  useEffect(() => {
    async function FetchData() {
      try {
        const [users] = await Promise.allSettled([FetchUsers()]);

        if (users.status === 'fulfilled') setUserData(users.value);
        else console.error('Failed to fetch users:', users.reason);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        // setLoading(false); // ✅ Stop loading regardless of success or failure
      }
    }

    FetchData();
  }, []);

  useEffect(() => {
    async function FetchSession() {
      const sessionUser: UserModels[] = await GetSessionData();

      if (sessionUser) {
        setUserSess(sessionUser[0]); // Set user if session exists
      }
    }

    FetchSession();
  }, [router]);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        {userSess?.userRole === 'airline' && (
          <TableCell padding="checkbox">
            <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
          </TableCell>
        )}

        {/* 
        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
            <Avatar alt={row.username} src={row.avatarUrl} />
            {row.name}
          </Box>
        </TableCell> */}

        <TableCell>{row.flightDestination}</TableCell>

        <TableCell>{row.flightFrom}</TableCell>

        <TableCell>
          {userData.find((x) => x.userID === row.airlineID)?.username || 'Unknown'}
        </TableCell>

        <TableCell>{new Date(row.flightTime.toString()).toLocaleString()}</TableCell>

        <TableCell>{new Date(row.flightArrival.toString()).toLocaleString()}</TableCell>

        <TableCell>{row.flightSeat}</TableCell>

        <TableCell>
          {Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(row.flightPrice)}
        </TableCell>

        {/* <TableCell align="center">
          {row.isVerified ? (
            <Iconify width={22} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
          ) : (
            '-'
          )}
        </TableCell> */}
        {/* 
        <TableCell>
          <Label color={(row.status === 'banned' && 'error') || 'success'}>{row.status}</Label>
        </TableCell> */}

        {userSess?.userRole === 'airline' ? (
          <TableCell align="right">
            <IconButton onClick={handleOpenPopover}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </TableCell>
        ) : userSess?.userRole === 'user' ? (
          <TableCell align="right">
            <IconButton color="primary" onClick={onViewDetails} title="Buy Ticket">
              <Iconify icon="mdi:cart-arrow-down" />
            </IconButton>
          </TableCell>
        ) : null}
      </TableRow>

      {/* Airline Popover Actions */}
      {userSess?.userRole === 'airline' && (
        <Popover
          open={!!openPopover}
          anchorEl={openPopover}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuList
            disablePadding
            sx={{
              p: 0.5,
              gap: 0.5,
              width: 140,
              display: 'flex',
              flexDirection: 'column',
              [`& .${menuItemClasses.root}`]: {
                px: 1,
                gap: 2,
                borderRadius: 0.75,
                [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
              },
            }}
          >
            {/* <MenuItem
                onClick={() => {
                  onViewDetails();
                  handleClosePopover();
                }}
              >
                <Iconify icon="mdi:eye-outline" />
                View
              </MenuItem> */}

            <MenuItem onClick={handleClosePopover}>
              <Iconify icon="solar:pen-bold" />
              Edit
            </MenuItem>

            <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
              Delete
            </MenuItem>
          </MenuList>
        </Popover>
      )}
    </>
  );
}
