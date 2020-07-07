import { Container, makeStyles } from "@material-ui/core";
import React from "react";
import logo from "../resources/logo.png";

const useStyles = makeStyles({
  img: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
  },
});

export const NineChroniclesLogo: React.FC<{}> = ({}) => {
  const classes = useStyles();
  return (
    <Container>
      <img src={logo} className={classes.img} />
    </Container>
  );
};
