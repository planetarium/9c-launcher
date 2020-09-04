import { makeStyles } from "@material-ui/core";

const createAccountViewStyle = makeStyles({
  root: {
    marginLeft: "30px",
    marginRight: "29px",
    marginTop: "78px",
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
    fontSize: "13px",
    lineHeight: 1.375,
  },
  warning: {
    color: "#FF7171",
    fontSize: "12px",
    lineHeight: 1.375,
  },
  privateKeyContainer: {
    marginTop: "33px",
    marginBottom: "30px",
  },
  privateKeyText: {
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
