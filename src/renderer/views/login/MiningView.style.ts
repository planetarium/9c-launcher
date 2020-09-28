import { makeStyles } from "@material-ui/core";

const miningViewStyle = makeStyles({
  root: {
    color: "white",
    margin: "5px",
  },

  title: {
    fontSize: "1.17em",
    fontWeight: "bold",
  },

  button: {
    borderRadius: "0",
    width: "150px",
    height: "60px",
    fontWeight: "bold",
    fontSize: "larger",
  },

  buttonLeft: {
    marginRight: "15px",
  },

  buttonRight: {
    marginLeft: "15px",
  },

  buttonContainer: {
    position: "absolute",
    bottom: "32px",
    display: "flex",
    justifyContent: "space-between",
  },
  description: {
    height: "133px",
    marginBottom: "0.5em",
  },
  requirement: {
    fontSize: "small",
    color: "darkgray",
    margin: 0,
    height: "64px",
  },
  jade: {
    width: "100%",
  },
});

export default miningViewStyle;
