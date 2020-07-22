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
    "&:disabled": {
      backgroundColor: "transparent",
    },
  },
  loginButton: {
    display: "block",
    margin: "50px auto 0 auto",
    borderRadius: "0",
    width: "60%",
    height: "60px",
    fontSize: "150%",
    fontWeight: "bold",
  },
  revokeLink: {
    margin: "10px auto",
    display: "block",
    width: "150px",
    color: "white",
  },
});

export default loginViewStyle;
