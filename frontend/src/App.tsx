import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import { HeaderNav } from './components/HeaderNav';

export function App() {
  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header>
        <HeaderNav />
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
