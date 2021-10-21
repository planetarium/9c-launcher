import React from "react";
import CollectionButton from "../../components/Button/Button";
import './landing.scss';

export type Props = {
  handleNextButton: () => void;
}

const Landing: React.FC<Props> = (props: Props) => {
  const { handleNextButton } = props;

  const gotoIntro = () => handleNextButton();
  return (
    <div
      className={"IntroContainer"}
    >
      <div className={'IntroPageBorder'}>
        <div className={"IntroItems"}>
          <div className={"Title"}>
            Collect cute monsters! Then, you can earn special rewards!
      </div>
          <div className={"Subtitle"}>
            NCG is required to collect monsters. You can get rewards as many monsters as you collect.
      </div>
          <div className={"Button"} >
            <CollectionButton
              width={240}
              height={66}
              primary={true}
              onClick={() => { gotoIntro(); }}
            >
              Start
      </CollectionButton>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Landing;
