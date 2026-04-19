import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import { HeaderNav } from './components/HeaderNav';

export function App() {
  return (
    <AppShell
      header={{ height: 'auto', offset: false }}
      styles={{
        root: {
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        },
        header: {
          position: 'relative',
        },
      }}
    >
      <AppShell.Header>
        <HeaderNav />
      </AppShell.Header>

      <AppShell.Main style={{ flex: 1 }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
