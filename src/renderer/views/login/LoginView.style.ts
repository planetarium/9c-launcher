import { makeStyles } from "@material-ui/core";

const loginViewStyle = makeStyles({
  root: {
    margin: "15px",
  },
  cacheButton: {
    float: "right",
    color: "#929292",
  },
  downloadButton: {
    float: "right",
    color: "#929292",
  },
  loginButton: {
    display: "block",
    margin: "50px auto",
    borderRadius: "0",
    width: "60%",
    height: "60px",
    fontSize: "150%",
    fontWeight: "bold",
  },
});

export default loginViewStyle;
