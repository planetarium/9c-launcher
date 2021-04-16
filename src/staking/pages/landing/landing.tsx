import React from "react";
import Button from "../../components/Button/Button";
import BackgroundImage from "../../common/resources/intro.png";
import './landing.scss';

const Landing: React.FC = () => {
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
        width={164}
        height={45}
        fontSize={24}
        label="Start"
        onClick={() => {}}
      />
      </div>
    </div>
  );
};

export default Landing;
