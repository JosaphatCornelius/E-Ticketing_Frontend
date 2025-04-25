import { SvgColor } from 'src/components/svg-color';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import GetSessionData from 'src/_mock/FetchSession';
import { UserModels } from 'src/models/UserModels';
import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';

import { _langs, _notifications } from 'src/_mock';

import { Iconify } from 'src/components/iconify';

import { Button } from '@mui/material';
import { Main } from './main';
import { layoutClasses } from '../classes';
import { NavMobile, NavDesktop } from './nav';
import { Searchbar } from '../components/searchbar';
import { _workspaces } from '../config-nav-workspace';
import { MenuButton } from '../components/menu-button';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
import { AccountPopover } from '../components/account-popover';
import { LanguagePopover } from '../components/language-popover';
import { NotificationsPopover } from '../components/notifications-popover';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  header?: {
    sx?: SxProps<Theme>;
  };
};

export function DashboardLayout({ sx, children, header }: DashboardLayoutProps) {
  const theme = useTheme();
  const router = useRouter();

  const [navOpen, setNavOpen] = useState(false);

  const layoutQuery: Breakpoint = 'lg';

  const [userSess, setUserSess] = useState<UserModels | null>(null);

  useEffect(() => {
    async function FetchSession() {
      const sessionUser: UserModels[] = await GetSessionData();

      if (sessionUser) {
        setUserSess(sessionUser[0]); // Set user if session exists
      }
    }

    FetchSession();
  }, [router]);

  const navData = useMemo(() => {
    const baseNav: NavItem[] = [];

    if (!userSess) return baseNav;

    const commonFlights = {
      title: 'Flights',
      path: '/flights',
      icon: icon('ic-cart'),
    };

    const dashboard = {
      title: 'Dashboard',
      path: '/homePage',
      icon: icon('ic-analytics'),
    };

    const userPage = {
      title: 'User',
      path: '/user',
      icon: icon('ic-user'),
    };

    const paymentConfirmation = {
      title: 'Payment Confirmation',
      path: '/paymentConfirmation',
      icon: icon('ic-blog'),
    };

    const paymentHistory = {
      title: 'Payment History',
      path: '/paymentHistory',
      icon: icon('ic-blog'),
    };

    switch (userSess.userRole) {
      case 'admin':
        return [dashboard, userPage, commonFlights, paymentConfirmation];
      case 'airline':
        return [dashboard, commonFlights, paymentHistory];
      case 'user':
        return [commonFlights];
      default:
        return baseNav;
    }
  }, [userSess]);

  return (
    <LayoutSection
      /** **************************************
       * Header
       *************************************** */
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          slotProps={{
            container: {
              maxWidth: false,
              sx: { px: { [layoutQuery]: 5 } },
            },
          }}
          sx={header?.sx}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                This is an info Alert.
              </Alert>
            ),
            leftArea: (
              <>
                <MenuButton
                  onClick={() => setNavOpen(true)}
                  sx={{
                    ml: -1,
                    [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                  }}
                />
                <NavMobile
                  data={navData}
                  open={navOpen}
                  onClose={() => setNavOpen(false)}
                  workspaces={_workspaces}
                />
              </>
            ),
            rightArea: (
              <>
                {userSess ? (
                  <Box gap={1} display="flex" alignItems="center">
                    <NotificationsPopover data={_notifications} />
                    <AccountPopover />
                  </Box>
                ) : (
                  <Button
                    color="inherit"
                    variant="outlined"
                    sx={{ borderColor: 'white', color: 'white' }}
                    onClick={() => {
                      router.replace('/sign-in');
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </>
            ),
          }}
        />
      }
      /** **************************************
       * Sidebar
       *************************************** */
      sidebarSection={
        <NavDesktop data={navData} layoutQuery={layoutQuery} workspaces={_workspaces} />
      }
      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
      cssVars={{
        '--layout-nav-vertical-width': '300px',
        '--layout-dashboard-content-pt': theme.spacing(1),
        '--layout-dashboard-content-pb': theme.spacing(8),
        '--layout-dashboard-content-px': theme.spacing(5),
      }}
      sx={{
        [`& .${layoutClasses.hasSidebar}`]: {
          [theme.breakpoints.up(layoutQuery)]: {
            pl: 'var(--layout-nav-vertical-width)',
          },
        },
        ...sx,
      }}
    >
      <Main>{children}</Main>
    </LayoutSection>
  );
}
