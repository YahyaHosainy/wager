import React from "react";
import noop from "lodash/noop";
import { connect } from "react-redux";
import { pauseStory, playStory, updateDuration } from "./actions";
import { CurrentStoryState, Story } from "./types";
import StoryLoader from "./StoryLoader";
import Audio from "../layout/assets/audio.svg";
import Mute from "../layout/assets/mute.svg";
import "./StoryVideo.scss";
import { getStories } from "./selectors";

interface StoryVideo {
  story: Story;
  current: CurrentStoryState;
  updateDuration: typeof updateDuration;
  pauseStory: typeof pauseStory;
  playStory: typeof playStory;
}

export const StoryVideo: React.FC<StoryVideo> = ({ ...props }) => {
  const { story, current } = props;
  const [loaded, setLoaded] = React.useState(false);
  const [muted, setMuted] = React.useState(false);

  const vid = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (vid.current) {
      if (current.isPaused) {
        vid.current.pause();
      } else {
        vid.current.play().catch(noop);
      }
    }
  }, [current.isPaused]);

  const onWaiting = () => {
    props.pauseStory();
  };

  const onPlaying = () => {
    props.playStory();
  };

  const videoLoaded = () => {
    props.updateDuration(vid.current.duration * 1000);
    setLoaded(true);
    vid.current
      .play()
      .then(() => {
        props.playStory();
      })
      .catch((error) => {
        setMuted(true);
        vid.current.play().finally(() => {
          props.playStory();
        });
      });
  };

  const handleToggleAudio = (value: boolean) => {
    setMuted(value);
    vid.current.play().catch((error) => {
      setMuted(true);
      vid.current.play();
    });
  };

  return (
    <div className="StoryVideo__container">
      <StoryLoader loaded={loaded} />
      <video
        ref={vid}
        className="StoryVideo__video"
        src={story.media_url}
        controls={false}
        onLoadedData={videoLoaded}
        playsInline
        onWaiting={onWaiting}
        onPlaying={onPlaying}
        muted={muted}
        autoPlay
        webkit-playsinline="true"
      />
      <div className="StoryVideo__controls">
        {!muted ? (
          <img
            src={Audio}
            className="StoryVideo__control"
            onClick={handleToggleAudio.bind(null, true)}
          />
        ) : (
          <img
            src={Mute}
            className="StoryVideo__control"
            onClick={handleToggleAudio.bind(null, false)}
          />
        )}
      </div>
    </div>
  );
};
const mapDispatchToProps = { updateDuration, pauseStory, playStory };

const mapStateToProps = (state) => {
  return {
    stories: getStories(state),
    current: state.story.current,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(StoryVideo);
