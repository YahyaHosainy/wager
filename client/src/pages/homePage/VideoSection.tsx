import React from "react";
import "./VideoSection.scss";
import Video1 from "./assets/video1.png";
import Video2 from "./assets/video2.png";
import Video3 from "./assets/video3.png";
import Play from "./assets/play.png";
import { Link } from "react-router-dom";

type MyProps = {};

type MyState = {
  showPopup: boolean;
  videoPos: number;
};

class VideoSection extends React.Component<MyProps, MyState> {
  state: MyState = {
    showPopup: false,
    videoPos: 0,
  };

  playVideo = (videoPos) => {
    this.setState({ showPopup: true, videoPos: videoPos });
  };

  videoURL = () => {
    switch (this.state.videoPos) {
      case 1:
        return (
          <iframe
            src="https://drive.google.com/file/d/1XVd2xm5276IA0PvqR5hspkd9wb1RDjjh/preview"
            width="100%"
            height="480"
            frameBorder="0"
            className="iframe"
          ></iframe>
        );
      case 2:
        return (
          <iframe
            src="https://drive.google.com/file/d/1IKfXjPBIHKAK87gkfsyWllglzVk0KPy-/preview"
            width="100%"
            height="480"
            frameBorder="0"
            className="iframe"
          ></iframe>
        );
      case 3:
        return (
          <iframe
            src="https://drive.google.com/file/d/1Sj7RqEKd2GdYzV9JgZZnjha3GCUAsJE-/preview"
            width="100%"
            height="480"
            frameBorder="0"
            className="iframe"
          ></iframe>
        );
      default:
        return "";
    }
  };

  render() {
    return (
      <>
        <div className="mainsection">
          <div className="videosection">
            <h2>Over 500+ members playing on Wager Games</h2>
            <h5>What do REAL customers have to say about WAGER?</h5>
            <div className="videos">
              <div className="video__single">
                <div className="single__video">
                  <Link to="#" onClick={() => this.playVideo(1)}>
                    <img src={Video1} alt="Claw" className="img-responsive" />
                    <div className="play">
                      <img src={Play} alt="Play" />
                    </div>
                  </Link>
                </div>
                <h4>Claw Betting Consultants</h4>
              </div>
              <div className="video__single">
                <div className="single__video">
                  <Link to="#" onClick={() => this.playVideo(2)}>
                    <img src={Video2} alt="Cody" className="img-responsive" />
                    <div className="play">
                      <img src={Play} alt="Play" />
                    </div>
                  </Link>
                </div>
                <h4>Cody G.</h4>
              </div>
              <div className="video__single">
                <div className="single__video">
                  <Link to="#" onClick={() => this.playVideo(3)}>
                    <img src={Video3} alt="KojoA" className="img-responsive" />
                    <div className="play">
                      <img src={Play} alt="Play" />
                    </div>
                  </Link>
                </div>
                <h4>Kojo A.</h4>
              </div>
            </div>
          </div>
        </div>
        <div
          className="video-overlay"
          style={{ display: this.state.showPopup ? "block" : "none" }}
        >
          <div className="popup">
            <Link
              to="#"
              className="close"
              onClick={() => this.setState({ showPopup: false, videoPos: 0 })}
            >
              ×
            </Link>
            <div className="content">{this.videoURL()}</div>
          </div>
        </div>
      </>
    );
  }
}

export default VideoSection;
