import { makeStyles } from "@material-ui/core";

const errorViewStyle = makeStyles({
  root: {
    color: "#FFFFFF",
    padding: "24px",
  },
  code: {
    fontFamily: "Consolas, monospace",
    overflowWrap: "anywhere",
  },
  title: {
    fontWeight: "bold",
    fontSize: "1.5em",
  },
  button: {
    marginTop: "20px",
  },
  link: {
    fontWeight: "bold",
    textDecoration: "underline",
    bold: "true",
    cursor: "pointer",
  },
});

export default errorViewStyle;
