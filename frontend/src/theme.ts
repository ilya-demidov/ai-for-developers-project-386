import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'orange',
  primaryShade: 6,
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    sizes: {
      h1: { fontSize: '48px', fontWeight: '700', lineHeight: '1.2' },
      h2: { fontSize: '28px', fontWeight: '600', lineHeight: '1.3' },
      h3: { fontSize: '22px', fontWeight: '600', lineHeight: '1.4' },
    },
  },
  components: {
    Card: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
      },
      styles: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});
