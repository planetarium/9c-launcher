import { makeStyles } from "@material-ui/core";

const configurationViewStyle = makeStyles({
  root: {
    marginTop: "29px",
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
    width: "210px",
    height: "60px",
    fontSize: "1.5em",
    fontWeight: "bold",
  },
  textField: {
    paddingBottom: "10px",
  },
  selectDir: {
    marginBottom: "10px",
  },
  labelPath: {
    display: "block",
    marginTop: "6px",
  },
  openPath: {
    marginTop: "6px",
    marginBottom: "4px",
  },
  selectLocale: {
    marginTop: "6px",
    marginBottom: "4px",
  },
  newLine: {
    display: "block",
    marginTop: "20px",
  },
  line: {
    display: "block",
  },
  labelRelaunch: {
    display: "block",
    marginTop: "1em",
    textAlign: "center",
  },
  checkbox: {
    padding: "7px",
  },
  checkboxGroup: {
    marginTop: "6px",
    display: "block",
  },
  checkboxHelper: {
    margin: 0,
  },
});

export default configurationViewStyle;
