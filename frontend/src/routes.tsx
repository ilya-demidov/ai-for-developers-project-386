import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from './App';
import { HomePage } from './pages/HomePage';
import { EventTypesListPage } from './pages/public/EventTypesListPage';
import { BookSlotPage } from './pages/public/BookSlotPage';
import { BookConfirmPage } from './pages/public/BookConfirmPage';
import { BookingSuccessPage } from './pages/public/BookingSuccessPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminEventTypesPage } from './pages/admin/AdminEventTypesPage';

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/event-types',
        element: <EventTypesListPage />,
      },
      {
        path: '/book/:id',
        element: <BookSlotPage />,
      },
      {
        path: '/book/:id/confirm',
        element: <BookConfirmPage />,
      },
      {
        path: '/book/success',
        element: <BookingSuccessPage />,
      },
      {
        path: '/admin',
        element: <Navigate to="/admin/bookings" replace />,
      },
      {
        path: '/admin/bookings',
        element: <AdminBookingsPage />,
      },
      {
        path: '/admin/event-types',
        element: <AdminEventTypesPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
