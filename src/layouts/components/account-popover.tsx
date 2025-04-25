import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import EditUserPopup from 'src/sections/user/EditUserPopup';

import { useRouter, usePathname } from 'src/routes/hooks';

import { _myAccount } from 'src/_mock';
import { UserModels } from 'src/models/UserModels';
import GetSessionData from 'src/_mock/FetchSession';

// ----------------------------------------------------------------------

export type AccountPopoverProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

async function Logout() {
  try {
    const backendURL = import.meta.env.VITE_API_URL;
    const response = await fetch(`${backendURL}/api/auth/logout`, {
      method: 'DELETE',
      credentials: 'include', // Important for retrieving session cookies
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Failed to logout');
    }

    const data = await response.json();

    if (!data.data) {
      return null;
    }

    return data.data;
  } catch (error) {
    console.log('Logout error:', error);
  }
}

export function AccountPopover({ data = [], sx, ...other }: AccountPopoverProps) {
  const router = useRouter();
  const [userSess, setUserSess] = useState<UserModels | null>(null);
  const [openEditPopup, setOpenEditPopup] = useState(false);

  const pathname = usePathname();

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    async function FetchSession() {
      const sessionUser: UserModels[] = await GetSessionData();

      if (sessionUser) {
        setUserSess(sessionUser[0]);
      }
    }

    FetchSession();
  }, [router]);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleClickItem = useCallback(
    (path: string) => {
      handleClosePopover();
      router.push(path);
    },
    [handleClosePopover, router]
  );

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        sx={{
          p: '2px',
          width: 40,
          height: 40,
          background: (theme) =>
            `conic-gradient(${theme.vars.palette.primary.light}, ${theme.vars.palette.warning.light}, ${theme.vars.palette.primary.light})`,
          ...sx,
        }}
        {...other}
      >
        <Avatar src={_myAccount.photoURL} alt={_myAccount.displayName} sx={{ width: 1, height: 1 }}>
          {_myAccount.displayName.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 200 },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {userSess?.username}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {userSess?.userEmail}
          </Typography>
        </Box>

        {userSess?.userRole !== 'user' ? (
          <Box sx={{ p: 1 }}>
            <Button
              fullWidth
              color="info"
              size="medium"
              variant="text"
              onClick={() => {
                handleClosePopover();
                setOpenEditPopup(true);
              }}
            >
              Edit Account
            </Button>
          </Box>
        ) : null}

        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            color="error"
            size="medium"
            variant="text"
            onClick={() => {
              Logout();
              router.replace('/sign-in'); // Redirect to login page if no session
            }}
          >
            Logout
          </Button>
        </Box>
      </Popover>

      {openEditPopup && (
        <EditUserPopup
          open={openEditPopup}
          onClose={() => setOpenEditPopup(false)}
          userData={userSess}
          onUserUpdated={async () => {
            const updatedSession = await GetSessionData();
            if (updatedSession) {
              setUserSess(updatedSession[0]);
            }
          }}
        />
      )}
    </>
  );
}
