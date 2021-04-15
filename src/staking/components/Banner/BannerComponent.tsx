import React from "react"
import './BannerComponent.scss'


type Props = {

}

const BannerComponent: React.FC<Props> = (props: Props) => {
  return <div className={'ComponentContainer'}>
    <h2>total staking</h2>
    <input className={'InfoBox'}></input>
    <h2>Reward</h2>
    <input className={'InfoBox'}></input>
    <input className={'InfoBox'}></input>
    <p>
      Remaining time <br />
      About 6d
    </p>
    <h2>
      progress
    </h2>
    <p>
      20%
    </p>
  </div>
}

export default BannerComponent
