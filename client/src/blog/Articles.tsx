import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";
import BlogBanner from "./BlogBanner";
import ExternalHeader from "../layout/ExternalHeader";
import "./Articles.scss";
import { url } from "inspector";
import moment from "moment";

type ArticlesState = {
  newsData: any;
  requestFailed: boolean;
};
const newsURL =
  "https://kelsonquanwagerblog.com/wp-json/wp/v2/posts/?per_page=100";

class Articles extends React.Component<{}, ArticlesState> {
  state: ArticlesState = {
    newsData: [],
    requestFailed: false,
  };

  componentDidMount() {
    axios.get(newsURL).then(
      (response) => {
        this.setState({
          newsData: response.data,
        });
      },
      (error) => {
        console.log("error", error);
      }
    );
  }

  render() {
    const articles = this.state.newsData.map((article, index) => {
      if (this.state.requestFailed) return <p>Failed!</p>;
      if (!this.state.newsData) return <p>Loading...</p>;
      const randomNumber = Math.floor(Math.random() * 200);
      const url = "https://picsum.photos/300/200?random=" + randomNumber;

      return (
        <div key={index} className="Articles__article-container">
          <div className="Articles__article-preview">
            <img src={url} alt="" />
            <div className="Articles__article-content">
              <h5 className="Articles__article-title">
                {article.title.rendered}
              </h5>
              <span className="Articles__article-date">
                Date: {moment(article.date).format("YYYY-MM-DD")}
              </span>
              <div
                className="Articles__article-text"
                dangerouslySetInnerHTML={{ __html: article.excerpt.rendered }}
              />
              <Link to={`/blogItem/${article.slug}`}>Read More...</Link>
            </div>
          </div>
        </div>
      );
    });

    return (
      <div className="Articles">
        <ExternalHeader />
        <BlogBanner />
        <div className="Articles__container">
          <h3 className="Articles__title">Articles</h3>
          {articles}
        </div>
      </div>
    );
  }
}

export default Articles;
