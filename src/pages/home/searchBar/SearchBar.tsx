import React from "react";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Paper from "@mui/material/Paper";

interface ISearchBarProps {
  onChange:
    | React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
    | undefined;
}

const SearchBar = ({ onChange }: ISearchBarProps): JSX.Element => (
  <Paper
    component="form"
    sx={{
      py: 0.5,
      px: 1,
      display: "flex",
      alignItems: "center",
      marginTop: 2,
      marginBottom: 4,
    }}
    variant="outlined"
  >
    <InputBase
      placeholder="Search for a song"
      onChange={onChange}
      sx={{
        marginLeft: 1,
        flex: 1,
      }}
    />
    <IconButton>
      <SearchIcon />
    </IconButton>
  </Paper>
);

export default SearchBar;
