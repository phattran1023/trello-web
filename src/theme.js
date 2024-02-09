import { experimental_extendTheme as extendTheme } from '@mui/material/styles'
import { cyan, deepOrange, orange, teal } from '@mui/material/colors'
// Create a theme instance.
const theme = extendTheme({
  trelloCustom : {
    appBarHeight: '58px',
    boardBarHeight: '60px'
  },
  // colorSchemes: {
  //   light: {
  //     palette: {
  //       primary: {
  //         main: '#0076ff'
  //       },
  //       secondary: {
  //         main: '#a31c4b'
  //       }
  //     },
  //     spacing: (factor) => `${0.25 * factor}rem`// (Bootstrap strategy)
  //   },
  //   dark: {
  //     primary: {
  //       main: '#0C2D57'
  //     },
  //     secondary: {
  //       main: '#f50057'
  //     },
  //     spacing: (factor) => `${0.25 * factor}rem`// (Bootstrap strategy)
  //   }
  // },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: '#dcdde1',
            borderRadius: '8px'
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'white',
            borderRadius: '8px'
          }
        }
      }
    },
    // Name of the component
    MuiButton: {
      styleOverrides: {
        // Name of the slot
        root: {
          textTransform: 'none',
          borderWidth: '0.5px',
          // '&:hover' : { borderWidth: '1px' }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // color: theme.palette.primary.main,
          fontSize: '0.875rem',
          // '.MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.light },

          // '&:hover': {
          //   '.MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }
          // },
          '& fieldset': {
            borderWidth: '0.5px !important'
          },
          '&:hover fieldset': {
            borderWidth: '1px !important'
          },
          '&.Mui-focused fieldset': {
            borderWidth: '1px !important'
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        // Name of the slot
        root: {
          // color: theme.palette.primary.main,
          fontSize: '0.875rem'
        }
      }
    }
  }
})

export default theme
