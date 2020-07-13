import { makeStyles } from "@material-ui/core";

const createAccountViewStyle = makeStyles({
  root: {
    marginLeft: "30px",
    marginRight: "29px",
    marginTop: "78px",
  },
  title: {
    typeface: "Montserrat",
    fontWeight: "bold",
    fontSize: "19px",
    lineHeight: 1.25,
    color: "#FFFFFF",
  },
  description: {
    color: "white",
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
    color: "white",
    fontSize: "16px",
    marginBottom: "10px",
  },
  privateKey: {
    marginBottom: "40px;",
    "& .Mui-focused": {
      color: "#ffffff",
    },
    "::after": {
      content: "",
    },
    height: "48px",
    borderRadius: 0,
  },
  copyButton: {
    color: "white",
    height: "55px",
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
