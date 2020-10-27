import { makeStyles } from "@material-ui/core";

const mainViewStyle = makeStyles({
  root: {
    color: "white",
    textAlign: "center",
    margin: "5px",
  },
  button: {
    width: "310px",
    height: "72px",
    fontWeight: "bold",
    fontSize: "larger",
    borderRadius: "0",
  },
  title: {
    fontWeight: "bold",
    fontSize: "1.17em",
  },
  body: {
    "& p": {
      fontSize: "16px",
    },
  },
  buttonContainer: {
    position: "relative",
    bottom: "-106px",
  },
  revoke: {
    marginTop: "15px",
  },
});

export default mainViewStyle;
