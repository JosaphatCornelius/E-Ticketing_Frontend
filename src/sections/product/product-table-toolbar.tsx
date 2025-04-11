import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

type ProductTableToolbarProps = {
  numSelected: number;
  filterFrom: string;
  filterDestination: string;
  onFilterFromChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterDestinationChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ProductTableToolbar({
  numSelected,
  filterFrom,
  filterDestination,
  onFilterFromChange,
  onFilterDestinationChange,
}: ProductTableToolbarProps) {
  return (
    <Toolbar
      sx={{
        height: 96,
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        p: (theme) => theme.spacing(0, 1, 0, 3),
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            flexGrow: 1, // biar input tetap fleksibel
            maxWidth: '100%',
          }}
        >
          <OutlinedInput
            value={filterDestination}
            onChange={onFilterDestinationChange}
            placeholder="Search by Destination..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            sx={{
              flex: '1 1 300px',
              minWidth: 240,
              height: 48,
              fontSize: '1rem',
            }}
          />

          <OutlinedInput
            value={filterFrom}
            onChange={onFilterFromChange}
            placeholder="Search by From..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            sx={{
              flex: '1 1 300px', // grow, shrink, basis
              minWidth: 240,
              height: 48,
              fontSize: '1rem',
            }}
          />
        </Box>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}
