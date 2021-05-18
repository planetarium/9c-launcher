import { ipcRenderer } from "electron";
import React, { useState } from "react"
import Landing from "../landing/landing";
import Main from "../main/main";

export type Props = {
    isFirst: boolean,
}

const IntroFacade: React.FC<Props> = (props: Props) => {
    const {isFirst} = props;
    const [isIntro, setIsIntro] = useState<boolean>(isFirst);
    if(!isIntro) return <Landing handleNextButton={() => {setIsIntro(true)}}/>
    else return <Main />
}

export default IntroFacade
