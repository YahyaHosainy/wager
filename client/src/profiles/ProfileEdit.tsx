import axios from "axios";
import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import union from "../layout/assets/Union.png";
import Layout from "../layout/Layout";
import "./MainProfilePanel.scss";
import DefaultProfilePicture from "../layout/assets/user.svg";
import { nameOrUsername } from "../helpers/user";
import { AuthUser, UserActionTypes } from "../user/types";
import { UPLOAD_MAX_SIZE_IMAGE } from "../consts";
import { createToastNotification } from "../helpers/toast";

interface ProfileEditProps {
  updateProfile: any;
  user: AuthUser;
  token: string;
}

interface ProfileEditState {
  nameOrUsername: string;
  bio: string;
  profileImg: any;
  image: string;
  loading: boolean;
}

class ProfileEdit extends React.Component<ProfileEditProps, ProfileEditState> {
  state: ProfileEditState = {
    nameOrUsername: nameOrUsername(this.props.user),
    bio:
      this.props.user.bio === null || this.props.user.bio === undefined
        ? ""
        : this.props.user.bio,
    profileImg: "",
    image: "",
    loading: false,
  };

  async saveProfile(form: FormData) {
    const response = await axios.post(
      `/api/profile/${this.props.user._id}`,
      form,
      {
        headers: {
          "content-type": "multipart/form-data", // do not forget this
          "x-access-token": `${this.props.token}`,
        },
      }
    );
    try {
      if (response && response.status !== 500) {
        const userImage =
          response.data.url === "noimage"
            ? this.props.user.picture
            : response.data.url;
        this.props.updateProfile(
          response.data.user.username,
          response.data.user.bio,
          userImage,
          response.data.user.isFirstEdit
        );

        createToastNotification("Profile update success.", "success");
      } else {
        createToastNotification(
          `We couldn't save your profile. If you're uploading a photo, make sure it's less than 5mb and a jpg or jpeg or png.`,
          "error"
        );
      }
    } catch (error) {
      createToastNotification(
        `We couldn't save your profile. If you're uploading a photo, make sure it's less than 5mb and a jpg or jpeg or png.`,
        "error"
      );
    } finally {
      this.setState({ loading: false });
    }
  }

  handleSaveClick() {
    const form = new FormData();

    form.append("userID", this.props.user._id);
    form.append("username", this.state.nameOrUsername);
    form.append("bio", this.state.bio);
    form.append("image", this.state.profileImg);

    this.setState({ loading: true });
    this.saveProfile(form);
  }

  getProfileImage() {
    if (this.state.image !== "") {
      return this.state.image;
    } else if (this.props.user.picture) {
      return this.props.user.picture;
    }
    return DefaultProfilePicture;
  }

  selectFile(e) {
    const fileSize = e.target.files[0].size;
    const extension = e.target.files[0].type;
    let message = "";

    if (!["image/jpeg", "image/jpg", "image/png"].includes(extension)) {
      message = "The selected photo needs to be a jpeg or jpg or png.";
    } else if (fileSize > UPLOAD_MAX_SIZE_IMAGE) {
      message =
        "The selected photo needs to be less than 5mb. Resize or compress it.";
    } else {
      this.setState({
        profileImg: e.target.files[0],
        image: URL.createObjectURL(e.target.files[0]),
      });
    }

    if (message) {
      createToastNotification(message, "error");
    }
  }

  render() {
    return (
      <Layout>
        <div className="MainProfilePanel">
          <div className="MainProfilePanel__container ProfileEdit__panel">
            <Link to="/profile" className="ProfileEdit__back">
              <img src={union} className="Profile__union" alt="" />
            </Link>
            <div className="ProfileEdit__container">
              <div className="ProfileImage__wrap">
                <label>
                  <img
                    src={this.getProfileImage()}
                    alt={this.props.user.name}
                  />
                  <p>
                    Change<br></br>Photo
                  </p>
                  <input
                    type="file"
                    className="ProfileEdit__upload"
                    onChange={(e) => this.selectFile(e)}
                  />
                </label>
              </div>
            </div>
            <div className="ProfileEdit__next">
              <div className="ProfileEdit__single">
                <p>Name</p>
                <input
                  type="text"
                  name="name"
                  value={this.state.nameOrUsername}
                  onChange={(e) =>
                    this.setState({ nameOrUsername: e.target.value })
                  }
                />
              </div>
              <div className="ProfileEdit__single ProfileEdit__second">
                <p className="ProfileEdit__bio">Bio</p>
                <textarea
                  value={this.state.bio}
                  onChange={(e) => this.setState({ bio: e.target.value })}
                ></textarea>
              </div>
            </div>
          </div>
          <button
            className={`ProfileEdit__btn`}
            disabled={this.state.loading}
            onClick={this.handleSaveClick.bind(this)}
          >
            Save Changes
          </button>
        </div>
        <ToastContainer />
      </Layout>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  updateProfile: (username, bio, url, isFirstEdit) => {
    dispatch({
      type: UserActionTypes.UPDATE_PROFILE,
      payload: { username, bio, url, isFirstEdit },
    });
  },
});

const mapStateToProps = (state) => ({
  user: state.user.user,
  token: state.user.token,
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileEdit);
