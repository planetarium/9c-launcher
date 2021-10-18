import { makeStyles } from "@material-ui/core";

const loginViewStyle = makeStyles({
  root: {
    margin: "20px",
  },
  labelContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  label: {
    padding: "6px 0",
  },
  cacheButton: {
    float: "right",
    color: "#929292",
  },
  submitWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "50px",
  },
  loginButton: {
    display: "block",
    borderRadius: "0",
    width: "210px",
    height: "60px",
    fontSize: "1.5em",
    fontWeight: "bold",
  },
  resetLink: {
    marginTop: "10px !important",
    color: "white !important",
  },
});

export default loginViewStyle;
