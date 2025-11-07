import { createTheme, MantineColorsTuple, rem } from '@mantine/core'

const deepVarianceOrange: MantineColorsTuple = [
  '#FFF5F4',
  '#FFE8E6',
  '#FFD4D0',
  '#FFBFBA',
  '#FFA9A3',
  '#FF5C4D',
  '#E65443',
  '#CC4B3B',
  '#B34333',
  '#993A2B',
]

export const theme = createTheme({
  primaryColor: 'orange',
  colors: {
    orange: deepVarianceOrange,
  },

  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: rem(36), lineHeight: '1.2' },
      h2: { fontSize: rem(24), lineHeight: '1.3' },
      h3: { fontSize: rem(20), lineHeight: '1.4' },
    },
  },

  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(15),
    lg: rem(16),
    xl: rem(18),
  },

  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
  },

  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(20),
    xl: rem(24),
  },

  defaultRadius: 'md',
  primaryShade: 5,

  components: {
    Text: {
      styles: {
        root: {
          lineHeight: '1.6',
        },
      },
    },

    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },

    Card: {
      defaultProps: {
        padding: 'lg',
        radius: 'md',
        withBorder: true,
      },
    },

    TextInput: {
      defaultProps: {
        size: 'md',
      },
    },

    Select: {
      defaultProps: {
        size: 'md',
      },
    },

    Table: {
      styles: {
        th: {
          fontWeight: 600,
        },
      },
    },
  },
})
