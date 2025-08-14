import { createTheme } from '@mui/material/styles';
import pallete from './pallete';
import typography from './typography';
import components from './components';

const theme = createTheme({
  palette: pallete,
  typography: typography(pallete),
  components: components(pallete),
});

export default theme;
