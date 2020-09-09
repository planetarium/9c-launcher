import { makeStyles } from "@material-ui/core";

const miningViewStyle = makeStyles({
  root: {
    color: "white",
  },

  title: {
    fontSize: "1.17em",
    fontWeight: "bold",
  },

  button: {
    borderRadius: "0",
    width: "150px",
    height: "70px",
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
    position: "relative",
    bottom: "-5px",
  },

  requirement: {
    fontSize: "small",
    color: "darkgray",
    margin: 0,
  },

  jade: {
    width: "100%",
  },
});

export default miningViewStyle;
