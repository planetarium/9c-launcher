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

const NineChroniclesLogo = () => (
  <Container>
    <img src={logo} className={useStyles().img} />
  </Container>
);

export default NineChroniclesLogo;
