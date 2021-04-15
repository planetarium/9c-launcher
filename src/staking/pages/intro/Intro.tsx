import React from "react";
import Button from "../../components/Button/Button";
import BackgroundImage from "../../common/resources/intro.png"

const Intro: React.FC = () => {
    return <div style={{backgroundImage: BackgroundImage}}>
    <div className={'IntroContainer'}>
        <div className={'Title'}>
        Colllect cute monsters! <br/>
        Then, you can earn various rewards!
        </div>
        <Button width={164} height={45} fontSize={24} label='Start' onClick={() => {}} />
        </div>
    </div>
}

export default Intro;
