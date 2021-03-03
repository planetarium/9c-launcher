import { makeStyles } from "@material-ui/core";

const createAccountViewStyle = makeStyles({
  root: {
    margin: "20px",
  },
  info: {
    color: "white",
    marginTop: "70px",
    marginBottom: "30px",
    fontWeight: "bold",
    lineHeight: 1.25,
    fontSize: "1em",
    "& span": {
      display: "block",
    },
  },
});

export default createAccountViewStyle;
