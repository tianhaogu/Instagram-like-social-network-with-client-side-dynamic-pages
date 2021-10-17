import React from "react";
import PropTypes from "prop-types";
import moment from 'moment';
import CommentSubmission from './commentSubmission';
import Comment from './comment';


class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      owner: "",
      ownerImgUrl: "",
      ownerShowUrl: "",
      imgUrl: "",
      postShowUrl: "",
      postid: "",
      created: "",
      comments: [],
      likes: { lognameLikesThis: false, numLikes: 0, url: null },
      commentUrl: "",
      likeUrl: ""
      //newComment: "",
    };
    this.handleUnlike = this.handleUnlike.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleDeleteComment = this.handleDeleteComment.bind(this);
    //this.handleCommentChange = this.handleCommentChange.bind(this);
    this.handleAddComment = this.handleAddComment.bind(this);
  }

  componentDidMount() {
    const fetch_url = this.props.posturl;
    fetch(fetch_url, { credentials: "same-origin", method: "GET" })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({
          owner: data.owner,
          ownerImgUrl: data.ownerImgUrl,
          ownerShowUrl: data.ownerShowUrl,
          imgUrl: data.imgUrl,
          postShowUrl: data.postShowUrl,
          postid: data.postid,
          created: data.created,
          comments: data.comments,
          likes: data.likes,
          commentUrl: "/api/v1/comments/?postid=" + data.postid.toString(),
          likeUrl: "/api/v1/likes/?postid=" + data.postid.toString(),
        });
      })
      .catch((error) => console.log(error));
  }

  handleUnlike() {
    const like_url = this.state.likes.url;
    let num_likes = this.state.likes.numLikes;
    fetch(like_url, { credentials: "same-origin", method: "DELETE" })
      .then((response) => {
        if (!(response.ok && response.status === 204))
          throw Error(response.statusText);
      })
      .then(() => {
        this.setState({
          likes: {
            lognameLikesThis: false,
            numLikes: num_likes - 1,
            url: null,
          },
        });
      })
      .catch((error) => console.log(error));
  }

  handleDoubleClick() {
    if (this.state.likes.lognameLikesThis === false) {
      const likeUrl = this.state.likeUrl;
      let num_likes = this.state.likes.numLikes;
      fetch(likeUrl, { credentials: "same-origin", method: "POST" })
        .then((response) => {
          if (!(response.ok && response.status === 201))
            throw Error(response.statusText);
          return response.json();
        })
        .then((like_data) => {
          this.setState({
            likes: {
              lognameLikesThis: true,
              numLikes: num_likes + 1,
              url: like_data.url,
            },
          });
        })
        .catch((error) => console.log(error));
    }
  }

  handleLike() {
    const likeUrl = this.state.likeUrl;
    let num_likes = this.state.likes.numLikes;
    fetch(likeUrl, { credentials: "same-origin", method: "POST" })
      .then((response) => {
        if (!(response.ok && response.status === 201))
          throw Error(response.statusText);
        return response.json();
      })
      .then((like_data) => {
        this.setState({
          likes: {
            lognameLikesThis: true,
            numLikes: num_likes + 1,
            url: like_data.url,
          },
        });
      })
      .catch((error) => console.log(error));
  }

  handleDeleteComment(comment_id) {
    const commentUrl = "/api/v1/comments/" + comment_id.toString() + "/";
    fetch(commentUrl, { credentials: "same-origin", method: "DELETE" })
      .then((response) => {
        if (!(response.ok && response.status === 204))
          throw Error(response.statusText);
      })
      .then(() => {
        let after_comments = this.state.comments.filter(
          (comment) => comment.commentid !== comment_id
        );
        this.setState({
          comments: after_comments,
        });
      })
      .catch((error) => console.log(error));
  }

  // handleCommentChange(event) {
  //   this.setState({
  //     newComment: event.target.value,
  //   });
  // }

  handleAddComment(newComment) {
    const commentUrl = this.state.commentUrl;
    const comment_text = { text: newComment };
    // console.log(this.state.newComment);
    // console.log(event.target.value);
    let curr_comments = this.state.comments;
    fetch(commentUrl, {
      credentials: "same-origin",
      method: "POST",
      body: JSON.stringify(comment_text),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!(response.ok && response.status === 201))
          throw Error(response.statusText);
        return response.json();
      })
      .then((comment_data) => {
        this.setState({
          comments: curr_comments.concat(comment_data),
        });
      })
      .catch((error) => console.log(error));
    // this.setState({
    //   newComment: "",
    // });
    // event.preventDefault();
  }

  render() {
    const {
      owner, ownerImgUrl, ownerShowUrl,
      imgUrl, postShowUrl, postid,
      created, comments, likes,
      commentUrl//, newComment,
    } = this.state;
    let numLikes = likes.numLikes;
    let likeComp;
    if (numLikes === 0 || numLikes >= 2) {
      likeComp = <p>{numLikes} likes</p>;
    } else {
      likeComp = <p>{numLikes} like</p>;
    }
    let likeButton;
    if (likes.lognameLikesThis === true) {
      likeButton = (
        <button className="like-unlike-button" onClick={this.handleUnlike}>
          Unlike
        </button>
      );
    } else {
      likeButton = (
        <button className="like-unlike-button" onClick={this.handleLike}>
          Like
        </button>
      );
    }
    // let commentComp = comments.map((comment) => (
    //   <div key={comment.commentid}>
    //     <a href={comment.ownerShowUrl}>
    //       <b>{comment.owner}</b>
    //     </a>
    //     <p>{comment.text}</p>
    //     {comment.lognameOwnsThis === true && (
    //       <button
    //         className="delete-comment-button"
    //         onClick={this.handleDeleteComment.bind(this, comment.commentid)}
    //       >
    //         delete
    //       </button>
    //     )}
    //   </div>
    // ));
    // let commentSubmission = (
    //   <form className="comment-form" onSubmit={this.handleAddComment}>
    //     <label>
    //       <input
    //         type="text"
    //         value={this.state.newComment}
    //         onChange={this.handleCommentChange}
    //       />
    //     </label>
    //   </form>
    // );
    const style_owner = { display: "inline-block", verticalAlign: "middle" };
    const style_time = { display: "inline-block", fontSize: "small" };

    return (
      <div className="post">
        <div className="postHeader">
          <a href={ownerShowUrl}>
            <div>
              <div style={style_owner}>
                <img src={ownerImgUrl} width="30" height="30" alt="Portrait" />
              </div>
              <b style={style_owner}>{owner}</b>
            </div>
          </a>
          <a href={postShowUrl}>
            <p style={style_time}>{timeCreated}</p>
          </a>
        </div>
        <div className="postPhoto">
          <button>
            <img
              src={imgUrl}
              alt="postPhoto"
              onDoubleClick={this.handleDoubleClick}
            />
          </button>
          {/* THIS IS WHERE THE DOUBLE CLICK LOCKED */}
        </div>
        <div className="postParagraph">
          {likeComp}
          {likeButton}
          {comments.map((comment) => (
            <div key={comment.commentid}>
              <Comment commentObj={comment} deleteFunc={this.handleDeleteComment}/>
              {/* <a href={comment.ownerShowUrl}>
                <b>{comment.owner}</b>
              </a>
              <p>{comment.text}</p>
              {comment.lognameOwnsThis === true && (
                <button 
                  className="delete-comment-button"
                  onClick={this.handleDeleteComment.bind(this, comment.commentid)}
                >
                  delete
                </button>
              )} */}
            </div>
          ))}
          {/* {commentComp} */}
          <div key={commentUrl}>
            <CommentSubmission addFunc={this.handleAddComment}/>
          </div>
          {/* {commentSubmission} */}
        </div>
      </div>
    );
  }
}

Post.propTypes = {
  posturl: PropTypes.string.isRequired,
};

export default Post;
