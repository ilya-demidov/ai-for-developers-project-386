import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import { HeaderNav } from './components/HeaderNav';

export function App() {
  return (
    <AppShell
      header={{ height: 'auto', offset: false }}
      styles={{
        header: {
          position: 'relative',
        },
      }}
    >
      <AppShell.Header>
        <HeaderNav />
      </AppShell.Header>

      <AppShell.Main style={{ minHeight: 'calc(100dvh - 62px)' }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
