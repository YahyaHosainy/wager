import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";
import ExternalHeader from "../layout/ExternalHeader";
import BackButton from "../layout/assets/graybackbutton.png";
import "./Article.scss";
import moment from "moment";

type ArticleProps = {
  match: any;
};

type ArticleState = {
  newsData: any;
  requestFailed: boolean;
};

const newsURL = "https://kelsonquanwagerblog.com/wp-json/wp/v2/posts?slug=";
class Article extends React.Component<ArticleProps, ArticleState> {
  state: ArticleState = {
    newsData: [],
    requestFailed: false,
  };

  componentDidMount() {
    const blogURL = newsURL + this.props.match.params.slug;
    axios.get(blogURL).then(
      (response) => {
        this.setState({
          newsData: response.data[0],
        });
      },
      (error) => {
        // pass
      }
    );
  }

  render() {
    const articleData = this.state.newsData;
    const randomNumber = Math.floor(Math.random() * 200);
    const url = "https://picsum.photos/300/200?random=" + randomNumber;
    const url2 = "https://picsum.photos/300/200?random=" + (randomNumber + 1);

    return !this.state.newsData.title ? (
      <p>Loading...</p>
    ) : (
      <div>
        <ExternalHeader />
        <div className="Back__btn Article__button-back">
          <Link to="/blog">
            <div>
              <img src={BackButton} alt="Back" />
            </div>

            <span>Back to blog</span>
          </Link>
        </div>
        <div className="Article__content">
          <img src={url} alt="" className="Article__hero-banner" />
          <h5 className="Article__title">{articleData.title.rendered}</h5>
          <div className="Article__container">
            <div className="Article__text-container">
              <span className="article-date">
                {moment(articleData.date).format("YYYY-MM-DD")}
              </span>
              <div
                dangerouslySetInnerHTML={{
                  __html: articleData.content.rendered,
                }}
                className="Article__text"
              />
            </div>
          </div>
          <img src={url2} alt="" className="Article__second-banner" />
        </div>
      </div>
    );
  }
}

export default Article;
