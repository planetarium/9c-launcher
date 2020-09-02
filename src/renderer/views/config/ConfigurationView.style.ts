import { makeStyles } from "@material-ui/core";

const configurationViewStyle = makeStyles({
  root: {
    margin: "15px",
    color: "white",
  },
  title: {
    fontWeight: "bold",
    fontSize: "1.5em",
    "padding-bottom": "10px",
  },
  submit: {
    display: "block",
    margin: "122px auto 0 auto",
    borderRadius: "0",
    width: "60%",
    height: "60px",
    fontSize: "150%",
    fontWeight: "bold",
  },
  textField: {
    "padding-bottom": "10px",
  },
  exit: {
    display: "block",
    "margin-right": "0px",
    "margin-left": "auto",
    "font-weight": "bold",
  },
  select: {
    margin: "4px auto",
  },
  label: {
    color: "#f50057",
  },
});

export default configurationViewStyle;
