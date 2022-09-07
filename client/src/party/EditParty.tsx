import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "./PartySection.scss";
import Layout from "../layout/Layout";
import axios from "axios";
import { connect } from "react-redux";
import { AuthUser } from "../user/types";
import { logger } from "../helpers/winston";
import { createToastNotification } from "../helpers/toast";
import BackButton from "../layout/buttons/BackButton";
import FileUpload from "./FileUpload";
import ButtonWithLoader from "../layout/buttons/ButtonWithLoader";
import { Story } from "../story/types";
import {
  deleteStory,
  getStory,
  getStorySuccess,
  updateStorySuccess,
} from "../story/actions";
import { RouteComponentProps, withRouter } from "react-router";
import { getStories } from "../story/selectors";

interface EditPartyRouteProps {
  id: string;
}
interface EditPartyProps extends RouteComponentProps<EditPartyRouteProps> {
  user: AuthUser;
  token: string;
  stories: Story[];
  deleteStory: typeof deleteStory;
  getStory: typeof getStory;
  getStorySuccess: typeof getStorySuccess;
  updateStorySuccess: typeof updateStorySuccess;
}

const EditParty: React.FC<EditPartyProps> = ({ ...props }) => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [editSuccess, setEditSuccess] = useState(false);
  const history = useHistory();

  useEffect(() => {
    props.getStory({ partyID: props.match.params.id, token: props.token });
  }, []);

  const handleDeleteStory = (storyID) => {
    props.deleteStory({ storyID, userID: props.user._id, token: props.token });
  };

  const renderStories = () => {
    return props.stories?.map((story: Story, idx: number) => {
      return (
        <div className="EditParty__story" key={story._id}>
          <span>{idx + 1}</span>
          <div>
            {story.media_type === "image" ? (
              <img key={idx} src={story.media_url} alt="Story Image" />
            ) : (
              <video key={idx} controls src={story.media_url}></video>
            )}
            <ButtonWithLoader
              withAnimation={false}
              onClick={() => handleDeleteStory(story._id)}
            >
              Delete
            </ButtonWithLoader>
          </div>
          <div className="EditParty__story-content">
            <div>{story.caption}</div>
          </div>
        </div>
      );
    });
  };

  const handleUpdateFiles = (files) => {
    setFiles(files);
  };

  const updateParty = () => {
    setLoading(true);

    const form = new FormData();
    const header = {
      "content-type": "multipart/form-data",
      "x-access-token": `${props.token}`,
    };

    form.append("partyId", props.match.params.id);
    for (const file of files) {
      form.append("storyContent", file);
    }

    axios
      .post("/api/story/update", form, {
        headers: header,
      })
      .then((response) => {
        if (response.data.status === "success") {
          props.updateStorySuccess(response.data);
          createToastNotification("Party updated", "success");
          setEditSuccess(true);
        } else
          createToastNotification("Something went wrong. Try Again.", "error");
      })
      .catch((error) => {
        logger.log("error", error);
      })
      .finally(() => {
        setLoading(false);
        setFiles([]);
        if (editSuccess) {
          history.push(`/party/${props.match.params.id}`);
        }
      });
  };

  return (
    <Layout>
      <div className="Party__container">
        <div className="EditParty__header">
          <BackButton to={`/party/${props.match.params.id}`} />
          <h3>Edit your party</h3>
        </div>
        <hr />
        <div className="Party__contents">
          <h5 className="Party__uploadTitle">
            Upload Content <span>(Optional)</span>
          </h5>
          <FileUpload
            accept=".jpg,.png,.jpeg,.mp4,.mov"
            label={""}
            multiple
            updateFilesCb={(files) => handleUpdateFiles(files)}
          />
        </div>
        <div className="EditParty__current-stories ">
          <h4>Current Stories</h4>
          {renderStories()}
        </div>
        <h5 className="Party__linkTitle Party__linkEdit">Share link</h5>
        <p className="Party__linkInput">
          <input
            type="text"
            name="link"
            value={`https://www.wager.games/party/${props.match.params.id}`}
            readOnly
          />
        </p>
        <p className="EditParty__action-buttons">
          <ButtonWithLoader to="#">CANCEL</ButtonWithLoader>
          <ButtonWithLoader
            to="#"
            onClick={() => updateParty()}
            isLoading={loading}
            withAnimation
          >
            UPDATE
          </ButtonWithLoader>
        </p>
      </div>
    </Layout>
  );
};

const mapStateToProps = (state) => ({
  user: state.user.user,
  token: state.user.token,
  stories: getStories(state),
});

const mapDispatchToProps = {
  deleteStory,
  getStory,
  getStorySuccess,
  updateStorySuccess,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EditParty)
);
