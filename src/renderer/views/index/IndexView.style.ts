import { makeStyles } from "@material-ui/core";

const indexViewStyle = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  ncLogoImage: {
    width: 415,
    height: 265,
    marginTop: 69,
  },
  welcomeText: {
    marginTop: 27,
    fontSize: 24,
    fontWeight: "bold",
  },
  descriptionText: {
    marginTop: 25,
    textAlign: "center",
    fontSize: 18,
  },
  primaryButton: {
    width: 415,
    height: 72,
    marginTop: 35,
  },
  alreadyHaveAnAccountText: {
    marginTop: 16,
    fontSize: 18,
    color: "#888888",
  },
});

export default indexViewStyle;