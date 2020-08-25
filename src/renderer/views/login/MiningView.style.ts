import { makeStyles } from "@material-ui/core";

const miningViewStyle = makeStyles({
  root: {
    color: "white",
  },
  title: {
    fontWeight: "bold",
  },

  button: {
    borderRadius: "0",
    width: "150px",
    height: "70px",
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

  emphasize: {
    fontWeight: "bold",
    fontSize: "larger",
    margin: "0px",
  },

  requirement: {
    fontSize: "small",
    color: "darkgray",
  },

  jade: {
    width: "100%",
  },
});

export default miningViewStyle;
