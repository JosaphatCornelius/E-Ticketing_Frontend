import { useEffect, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuList from '@mui/material/MenuList';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Iconify } from 'src/components/iconify';
import { FlightModels } from 'src/models/FlightModels';
import { UserModels } from 'src/models/UserModels';
import FetchUsers from 'src/_mock/FetchUsers';
import { Button, Typography } from '@mui/material';
import { BookingModels } from 'src/models/BookingModels';
import { formatDateUTCOffset } from 'src/utils/dateUtils';

// ----------------------------------------------------------------------

type Props = {
  row: FlightModels;
  booking: BookingModels;
  selected: boolean;
  onSelectRow: () => void;
  onConfirm: () => void;
  onDeny: () => void;
  userData: UserModels[];
};

export default function FlightConfirmationTableRow({
  row,
  booking,
  selected,
  onSelectRow,
  onConfirm,
  onDeny,
  userData,
}: Props) {
  return (
    <TableRow hover selected={selected}>
      <TableCell>{row.flightDestination}</TableCell>
      <TableCell>{userData.find((x) => x.userID === booking.userID)?.username}</TableCell>
      <TableCell>{row.flightFrom}</TableCell>
      <TableCell>{userData.find((x) => x.userID === row.airlineID)?.username}</TableCell>
      <TableCell>{formatDateUTCOffset(row.flightTime, 7)} WIB</TableCell>
      <TableCell>{formatDateUTCOffset(row.flightArrival, 7)} WIB</TableCell>
      <TableCell align="right">
        <Typography variant="body2" color="text.secondary">
          Status: {booking.paymentStatus} / {booking.bookingConfirmation}
        </Typography>
        {booking.bookingConfirmation === 'waiting for payment' ? (
          <>
            <Typography variant="body2">Price: Rp.{booking.bookingPrice}</Typography>
            <Button
              onClick={onConfirm}
              size="small"
              variant="contained"
              color="success"
              sx={{ mr: 1 }}
            >
              Confirm
            </Button>
            <Button onClick={onDeny} size="small" variant="contained" color="error">
              Deny
            </Button>
          </>
        ) : null}
      </TableCell>
    </TableRow>
  );
}
