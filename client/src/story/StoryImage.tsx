import React, { useState } from "react";
import { Story } from "./types";
import StoryLoader from "./StoryLoader";
import "./StoryImage.scss";

interface StoryImageProps {
  story: Story;
}

export const StoryImage: React.FC<StoryImageProps> = ({ ...props }) => {
  const { story } = props;
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="StoryImage">
      <StoryLoader loaded={loaded} />
      <img
        className="StoryImage__image"
        src={story.media_url}
        onLoad={setLoaded.bind(null, true)}
      />
    </div>
  );
};

export default StoryImage;
