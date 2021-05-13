import Button from "@material-ui/core/Button";
import React from "react";
import BackgroundImage from "../../common/resources/intro.png";
import './landing.scss';

export type Props = {
  handleNextButton: () => void;
}

const Landing: React.FC<Props> = (props: Props) => {
  const {handleNextButton} = props;

  const gotoIntro = () => handleNextButton();
  return (
    <div
      className={"IntroContainer"}
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <div className={"Title"}>
        Colllect cute monsters! <br />
        Then, you can earn various rewards!
      </div>
      <div className={"Button"} >
      <Button
        color="primary"
        variant="contained"
        style={{
          width: 164,
          height: 45,
          fontSize: 24
        }}
        onClick={(e) => {e.preventDefault(); gotoIntro();}}
      >
        Start
      </Button>
      </div>
    </div>
  );
};

export default Landing;
