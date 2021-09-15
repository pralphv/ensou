import { createTheme } from "@material-ui/core/styles";

export const THEME = createTheme({
  palette: {
    type: "dark",
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    primary: {
      main: "#757575",
    },
    secondary: {
      main: "#F6F6F6",
    },
  },
  overrides: {},
});
