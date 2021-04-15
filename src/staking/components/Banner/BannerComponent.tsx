import React from "react"
import './BannerComponent.scss'


export type Props = {
  remaining: string;
  progress: number;
}

const BannerComponent: React.FC<Props> = (props: Props) => {
  const {remaining, progress} = props;

  return <div className={'ComponentContainer'}>
    <h2>total staking</h2>
    <input className={'InfoBox'}></input>
    <h2>Reward</h2>
    <input className={'InfoBox'}></input>
    <input className={'InfoBox'}></input>
    <p>
      Remaining time <br />
      About {remaining}
    </p>
    <h2>
      progress
    </h2>
    <p>
      {progress}%
    </p>
  </div>
}

export default BannerComponent
