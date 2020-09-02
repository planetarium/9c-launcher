import { makeStyles } from "@material-ui/core";

const preloadViewStyle = makeStyles({
  root: {
    color: "#FFFFFF",
  },

  title: {
    marginTop: "30px",
    fontWeight: "bold",
    fontSize: "1rem",
    lineHeight: 1.25,
    "& p": {
      margin: 0,
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
