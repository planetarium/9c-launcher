import { makeStyles } from "@material-ui/core";

const createAccountViewStyle = makeStyles({
  root: {
    marginLeft: "35px",
    marginRight: "35px",
    marginTop: "83px",
    color: "white",
  },
  title: {
    typeface: "Montserrat",
    fontWeight: "bold",
    fontSize: "18px",
    lineHeight: 1.25,
    "& span": {
      display: "block",
    },
  },
  description: {
    marginTop: "12px",
    lineHeight: 1.375,
    marginBottom: "1em",
    "& p": {
      fontSize: "13px",
    },
  },
  warning: {
    color: "#FF7171",
    lineHeight: 1.375,
    "& p": {
      fontSize: "12px",
    },
  },
  privateKeyContainer: {
    marginTop: "33px",
    marginBottom: "30px",
  },
  privateKeyText: {
    fontSize: "1.17em",
    fontWeight: "normal",
    marginBottom: "10px",
  },
  privateKey: {
    marginBottom: "40px;",
    width: "16em",
    "& .MuiOutlinedInput-root": {
      borderRadius: 0,
    },
  },
  copyButton: {
    height: "40px",
    borderRadius: 0,
  },
  done: {
    display: "block",
    margin: "0 auto 0 auto",
    width: "200px",
    height: "50px",
  },
});

export default createAccountViewStyle;
