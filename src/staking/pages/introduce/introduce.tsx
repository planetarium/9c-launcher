import React from "react";
import './introduce.scss';
import IntroduceImage from '../../common/resources/introduce.png';
import TitleComponent from "../../components/Title/Title";

const Introduce: React.FC = () => {
  return <div className={'IntroduceContainer'} style={{backgroundImage: `url(${IntroduceImage})`}}>
    <TitleComponent />
  </div>
}

export default Introduce;
