// eslint-disable-next-line no-unused-vars
const components = (pallete) => ({
  MuiTextField: {
    defaultProps: {
      autoComplete: 'new-password',
    },
  },
  MuiFormLabel: {
    styleOverrides: {
      asterisk: {
        color: '#db3131',
        '&$error': {
          color: '#db3131',
        },
      },
    },
  },
});

export default components;
