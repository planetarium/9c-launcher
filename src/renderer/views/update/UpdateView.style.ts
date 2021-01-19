import { makeStyles } from "@material-ui/core";
import backgroundImage from "../../resources/bg-character.png";

const UpdateViewStyle = makeStyles({
  root: {
    width: 800,
    height: 572,
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
  },
  planetariumLogo: {
    width: 118,
    height: 26,
    position: "absolute",
    top: 15,
    left: 16,
  },
  nineChroniclesLogo: {
    width: 216,
    height: 138,
    position: "absolute",
    bottom: 16,
    left: 5,
  },
  menu: {
    width: 44,
    height: 98,
    position: "absolute",
    top: 11,
    right: 13,
  },
  menuItem: {
    width: 44,
    height: 44,
    backgroundColor: "#1a1a1a",
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  progressMessage: {
    width: 470,
    height: 15,
    position: "absolute",
    right: 13,
    bottom: 22,
    color: "#1a1a1a",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    textShadow: "0 2px 3px rgba(0, 0, 0, 0.5)",
  },
});

export default UpdateViewStyle;