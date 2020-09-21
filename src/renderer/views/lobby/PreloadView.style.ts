import { makeStyles } from "@material-ui/core";

const preloadViewStyle = makeStyles({
  root: {
    color: "#FFFFFF",
  },

  title: {
    marginTop: "30px",
    marginBottom: "1em",
    fontWeight: "bold",
    fontSize: "1em",
    lineHeight: 1.25,
    "& span": {
      display: "block",
    },
  },

  listItemText: {
    textDecoration: "underline",
  },

  listItemIcon: {
    minWidth: "32px",
  },
});

export default preloadViewStyle;
