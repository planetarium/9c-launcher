import React from "react"
import './BannerComponent.scss'
import bannerImage from '../../common/resources/banner.png'


export type Props = {
  remaining: string;
  progress: number;
}

const BannerComponent: React.FC<Props> = (props: Props) => {
  const {remaining, progress} = props;

  return <div className={'ComponentContainer'}>
    <img src={bannerImage}>
      
    </img>
    <div  className={'TotalStakingDisplay'}>50</div>
    <div  className={'RewardDisplay'}>50</div>
    <div className={'ProgressDisplay'}>
      {progress}%
    </div>
  </div>
}

export default BannerComponent
