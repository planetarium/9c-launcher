import React from "react";

type Props = {
    className: string
}

const CircleAddIcon:React.FC<Props> = (props: Props) => {
    const {className} = props;
    return <svg className={className} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 1000 1000" xmlSpace="preserve">
    <g><path d="M549,255h-98v196H255v98h196v196h98V549h196v-98H549V255L549,255z M500,10C230.5,10,10,230.5,10,500s220.5,490,490,490s490-220.5,490-490S769.5,10,500,10L500,10z M500,892c-215.6,0-392-176.4-392-392c0-215.6,176.4-392,392-392c215.6,0,392,176.4,392,392C892,715.6,715.6,892,500,892L500,892z"/></g>
    </svg>
}

export default CircleAddIcon;
