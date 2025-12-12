import { createTheme, MantineColorsTuple } from '@mantine/core';

// Color palette based on Lubrizen branding
// Green (primary), Yellow (accent), Red (secondary), White
const green: MantineColorsTuple = [
  '#e6f7e6',
  '#b3e6b3',
  '#80d580',
  '#4dc34d',
  '#1ab01a', // Primary green
  '#0d800d',
  '#0a660a',
  '#074d07',
  '#053305',
  '#021a02',
];

const yellow: MantineColorsTuple = [
  '#fff9e6',
  '#ffedb3',
  '#ffe180',
  '#ffd54d',
  '#ffc91a', // Accent yellow
  '#e6b50d',
  '#b38f0a',
  '#806807',
  '#4d4005',
  '#1a1902',
];

const red: MantineColorsTuple = [
  '#ffe6e6',
  '#ffb3b3',
  '#ff8080',
  '#ff4d4d',
  '#ff1a1a', // Secondary red
  '#e60d0d',
  '#b30a0a',
  '#800707',
  '#4d0505',
  '#1a0202',
];

export const theme = createTheme({
  primaryColor: 'green',
  colors: {
    green,
    yellow,
    red,
  },
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    fontWeight: '600',
  },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
        size: 'lg', // Default size for all buttons
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'md',
        padding: 'xl',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
        size: 'lg',
      },
    },
    TextInput: {
      defaultProps: {
        size: 'lg',
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        size: 'lg',
        radius: 'md',
      },
    },
  },
});

