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
import { UserModels } from 'src/models/UserModels';
import { Alert, Snackbar } from '@mui/material';
import EditUserPopup from './EditUserPopup';

// ----------------------------------------------------------------------

type UserTableRowProps = {
  row: UserModels;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: (userID: string) => void; // baru
  onUserUpdated: () => void;
  onShowSnackbar: () => void; // ✅ NEW
};

export function UserTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onUserUpdated,
  onShowSnackbar
}: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleOpenEdit = () => {
    handleClosePopover(); // Tutup popover dulu
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell>{row.username}</TableCell>

        <TableCell>{row.userRole}</TableCell>

        <TableCell>{row.userEmail}</TableCell>

        <TableCell>{row.userAddress}</TableCell>

        <TableCell>{new Date(row.birthday.toString()).toLocaleString()}</TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

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
          <MenuItem onClick={handleOpenEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem
            onClick={() => {
              console.log('Delete clicked:', row.userID);
              handleClosePopover();
              onDeleteRow(row.userID);
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>

      <EditUserPopup
        open={editOpen}
        onClose={handleCloseEdit}
        userData={row}
        onUserUpdated={() => {
          handleCloseEdit();
          onUserUpdated();
          onShowSnackbar(); // 🎉 Trigger snackbar here!
        }}
      />
    </>
  );
}
