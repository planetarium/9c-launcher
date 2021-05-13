import React from "react"
import Introduce from "../introduce/introduce";
import Landing from "../landing/landing";
import Main from "../main/main";

export type Props = {
    isIntro: boolean,
    handleClick: () => void;
}

const IntroFacade: React.FC<Props> = (props: Props) => {
    const {isIntro, handleClick} = props;
    if(!isIntro) return <Landing handleNextButton={handleClick}/>
    else return <Main />
}

export default IntroFacade
