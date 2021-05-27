import { ipcRenderer } from "electron";
import React, { useState } from "react"
import Landing from "../landing/landing";
import Main from "../main/main";

export type Props = {
    isFirst: boolean,
    onCreateFile: () => void,
}

const IntroFacade: React.FC<Props> = (props: Props) => {
    const {isFirst, onCreateFile} = props;
    const [isIntro, setIsIntro] = useState<boolean>(isFirst);
    const handleNextButton = () => {
        onCreateFile();
        setIsIntro(true);
    }

    if(!isIntro) return <Landing handleNextButton={handleNextButton}/>
    else return <Main />
}

export default IntroFacade
