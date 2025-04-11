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

// ----------------------------------------------------------------------

type Props = {
  row: FlightModels;
  booking: BookingModels;
  selected: boolean;
  onSelectRow: () => void;
  onConfirm: () => void;
  onDeny: () => void;
};

export default function FlightConfirmationTableRow({
  row,
  booking,
  selected,
  onSelectRow,
  onConfirm,
  onDeny,
}: Props) {
  return (
    <TableRow hover selected={selected}>
      <TableCell>{row.flightDestination}</TableCell>
      <TableCell>{row.flightFrom}</TableCell>
      <TableCell>{row.airlineID}</TableCell>
      <TableCell>{row.flightTime.toLocaleString()}</TableCell>
      <TableCell>{row.flightArrival.toLocaleString()}</TableCell>
      <TableCell align="right">
        <Typography variant="body2" color="text.secondary">
          Status: {booking.paymentStatus} / {booking.bookingConfirmation}
        </Typography>
        <Typography variant="body2">Price: ${booking.bookingPrice}</Typography>
        <Button onClick={onConfirm} size="small" variant="contained" color="success" sx={{ mr: 1 }}>
          Confirm
        </Button>
        <Button onClick={onDeny} size="small" variant="contained" color="error">
          Deny
        </Button>
      </TableCell>
    </TableRow>
  );
}

// import { useEffect, useState, useCallback } from 'react';

// import Box from '@mui/material/Box';
// import Avatar from '@mui/material/Avatar';
// import Popover from '@mui/material/Popover';
// import TableRow from '@mui/material/TableRow';
// import TableCell from '@mui/material/TableCell';
// import IconButton from '@mui/material/IconButton';
// import MenuList from '@mui/material/MenuList';
// import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

// import { Iconify } from 'src/components/iconify';
// import { FlightModels } from 'src/models/FlightModels';
// import { UserModels } from 'src/models/UserModels';
// import FetchUsers from 'src/_mock/FetchUsers';

// // ----------------------------------------------------------------------

// type FlightConfirmationTableRowProps = {
//   row: FlightModels;
//   selected: boolean;
//   onSelectRow: () => void;
//   onConfirm: () => void;
//   onDeny: () => void;
// };

// export default function FlightConfirmationTableRow({
//   row,
//   selected,
//   onSelectRow,
//   onConfirm,
//   onDeny,
// }: FlightConfirmationTableRowProps) {
//   const [userData, setUserData] = useState<UserModels[]>([]);

//   useEffect(() => {
//     async function fetchUsers() {
//       try {
//         const users = await FetchUsers();
//         setUserData(Array.isArray(users) ? users : []);
//       } catch (error) {
//         console.error('Failed to fetch users:', error);
//       }
//     }

//     fetchUsers();
//   }, []);

//   return (
//     <TableRow hover selected={selected} tabIndex={-1} role="checkbox">
//       <TableCell>{row.flightDestination}</TableCell>

//       <TableCell>{row.flightFrom}</TableCell>

//       <TableCell>
//         {userData.find((user) => user.userID === row.airlineID)?.username || 'Unknown'}
//       </TableCell>

//       <TableCell>{new Date(row.flightTime.toString()).toLocaleString()}</TableCell>

//       <TableCell>{new Date(row.flightArrival.toString()).toLocaleString()}</TableCell>

//       <TableCell align="right">
//         <Box display="flex" justifyContent="flex-end" gap={1}>
//           <IconButton color="success" onClick={onConfirm} title="Confirm Payment">
//             <Iconify icon="mdi:check-bold" />
//           </IconButton>
//           <IconButton color="error" onClick={onDeny} title="Deny Payment">
//             <Iconify icon="mdi:close-thick" />
//           </IconButton>
//         </Box>
//       </TableCell>
//     </TableRow>
//   );
// }
