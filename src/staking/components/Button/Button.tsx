import React from "react";
import './Button.scss';


export type Props = {
    width: number;
    height: number;
    fontSize: number;
    label: string;
    onClick: () => void
}

const Button: React.FC<Props> = (props: Props) => {
    const {width, height, fontSize, label, onClick} = props;
    return <div onClick={() => onClick()} style={{width: width, height: height, fontSize: fontSize}} className={'ButtonContainer'}>
        <div className={'Button'}>
        {label}
        </div>
    </div>
}

export default Button;
