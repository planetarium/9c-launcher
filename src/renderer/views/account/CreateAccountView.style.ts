import { makeStyles } from "@material-ui/core";

const createAccountViewStyle = makeStyles({
  root: {
    margin: "15px",
  },
  info: {
    color: "white",
    marginTop: "140px",
    marginBottom: "30px",
    fontWeight: "bold",
    lineHeight: 1.25,
    fontSize: "1em",
    "& span": {
      display: "block",
    },
  },
  textInput: {
    marginBottom: "40px;",
    "& .Mui-focused": {
      color: "#ffffff",
    },
  },
  submit: {
    display: "block",
    margin: "0 auto 0 auto",
    width: "200px",
    height: "50px",
  },
});

export default createAccountViewStyle;
