import { makeStyles } from "@material-ui/core";

const reviewPrivateKeyViewStyle = makeStyles({
  root: {
    color: "white",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    margin: "0 35px",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: "18px",
    lineHeight: 1.25,
  },
  label: {
    marginLeft: "14px",
  },
  submit: {
    display: "block",
    marginTop: "50px",
    borderRadius: "0",
    width: "210px",
    height: "60px",
    fontSize: "1.5em",
    fontWeight: "bold",
  },
  revoke: {
    marginTop: "10px",
  },
  floatingHeader: {
    margin: "20px",
    display: "block",
    position: "absolute",
    left: "0px",
    top: "0px",
  },
});

export default reviewPrivateKeyViewStyle;
