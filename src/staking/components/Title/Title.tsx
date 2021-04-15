import React from "react"

import './Title.scss'

const BannerComponent: React.FC = () => {

  return <div className={'TitleContainer'}>
    <h2 className={'Title'}>The reason why you can get rewards is that you are staking NCG.</h2>
    <p className={'Subtitle'}>
      'Staking' is similar to savings. <br/>
      it allows you to leave your NCG to be used for blockchain network operation <br />
      for a certain period of time and receive compensation in return.
    </p>
  </div>
}

export default BannerComponent
