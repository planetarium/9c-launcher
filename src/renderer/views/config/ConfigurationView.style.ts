import { makeStyles } from "@material-ui/core";

const configurationViewStyle = makeStyles({
  root: {
    marginTop: "24px",
    color: "white",
  },
  titleWarp: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: "45px",
    marginRight: "45px",
    marginBottom: "10px",
  },
  fields: {
    height: "350px",
    overflow: "hidden auto",
    marginBottom: "16px",
    padding: "0 45px",
  },
  title: {
    fontWeight: "bold",
    fontSize: "1.5em",
    paddingTop: "12px",
  },
  submit: {
    display: "block",
    margin: "0 auto 0 auto",
    borderRadius: "0",
    width: "60%",
    height: "60px",
    fontSize: "150%",
    fontWeight: "bold",
  },
  textField: {
    "padding-bottom": "10px",
  },
  selectDir: {
    marginBottom: "10px",
  },
  selectLocale: {
    marginTop: "6px",
    marginBottom: "4px",
  },
  newLine: {
    display: "block",
  },
  label: {
    display: "block",
    marginTop: "1em",
    textAlign: "center",
  },
  checkbox: {
    padding: "7px",
  },
  checkboxGroup: {
    marginTop: "6px",
  },
  checkboxHelper: {
    margin: 0,
  },
});

export default configurationViewStyle;
