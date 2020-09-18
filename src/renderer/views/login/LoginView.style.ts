import { makeStyles } from "@material-ui/core";

const loginViewStyle = makeStyles({
  root: {
    margin: "20px",
  },
  ID: {
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
  loginButton: {
    display: "block",
    margin: "50px auto 0 auto",
    borderRadius: "0",
    width: "210px",
    height: "60px",
    fontSize: "1.5em",
    fontWeight: "bold",
  },
  revokeLink: {
    margin: "10px auto",
    textAlign: "center",
    display: "block",
    width: "150px",
    color: "white",
  },
});

export default loginViewStyle;
