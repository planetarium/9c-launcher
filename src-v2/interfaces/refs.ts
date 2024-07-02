import YouTube from "react-youtube";

export interface YouTubeInternal extends YouTube {
  internalPlayer: {
    pauseVideo: () => void;
  };
}
