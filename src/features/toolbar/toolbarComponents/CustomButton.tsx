import { withStyles } from "@material-ui/core/styles";
import ToggleButton from "@material-ui/lab/ToggleButton";

const CustomButton = withStyles({
  root: {
    backgroundColor: "rgba(0, 0, 0, 0)",
    border: "0",
    color: "#e5e5e5",
    fontSize: 5, 
    "&:hover": {
      color: "#fff",
      backgroundColor: "rgba(0, 0, 0, 0)",
    },
    "&.Mui-selected": {
      borderBottom: "2px solid #10cfe3",
      background: "rgba(0, 0, 0, 0)",
      "&:hover": {
        color: "#fff",
        backgroundColor: "rgba(0, 0, 0, 0)",
      },
  
    },
  },
  selected: {},
})(ToggleButton);

export default CustomButton;
