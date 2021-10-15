import React from 'react';
import PropTypes from 'prop-types';


class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      owner: '', ownerImgUrl: '', ownerShowUrl: '', imgUrl: '', 
      postShowUrl: '', postid: '', created: '', comments: [],
      likes: {lognameLikesThis: false, numLikes: 0, url: null},
      commentUrl: '', likeUrl: '', newComment
    };
    this.handleAddComment = this.handleAddComment.bind(this);
    this.handleDeleteComment = this.handleDeleteComment.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleUnlike = this.handleUnlike.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const fetch_url = this.props.posturl;
    fetch(fetch_url, {credentials: 'same-origin', method="GET"})
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
          commentUrl = "/api/v1/comments/?postid=" + (data.postid).toString(),
          likeUrl = "/api/v1/likes/?postid=" + (data.postid).toString()
        });
      })
      .catch((error) => console.log(error));
  }

  handleUnlike(like_url) {
    let num_likes = this.state.likes.numLikes;
    fetch(like_url, {credentials: 'same-origin', method: "DELETE"})
      .then((response) => {
        if (!(response.ok && response.status === 204)) throw Error(response.statusText);
        return response.json();
      })
      .then(() => {
        this.setState({
          likes: {
            lognameLikesThis: false,
            numLikes: num_likes - 1,
            url: null
          }
        });
      })
      .error((error) => console.log(error));
  }

  handleLike() {
    const likeUrl = this.state.likeUrl;
    let num_likes = this.state.likes.numLikes;
    fetch(likeUrl, {credentials: 'same-origin', method: "POST"})
      .then((response) => {
        if (!(response.ok && response.status === 201)) throw Error(response.statusText);
        return response.json();
      })
      .then((like_data) => {
        this.setState({
          likes: {
            lognameLikesThis: true, 
            numLikes: num_likes + 1, 
            url: like_data.url
          }
        });
      })
      .catch((error) => console.log(error));
  }

  handleDeleteComment(comment_id) {
    const commentUrl = "/api/v1/comments/" + comment_id.toString() + '/';
    fetch(commentUrl, {credentials: 'same-origin', method="DELETE"})
      .then((response) => {
        if (!(response.ok && response.status === 204)) throw Error(response.statusText);
        return response.json();
      })
      .then(() => {
        let after_comments = comments.filter((comment) => comment.commentid !== comment_id);
        this.setState({
          comments: after_comments
        });
      })
      .catch((error) => console.log(error));
  }

  handleAddComment(event) {
    const commentUrl = this.state.commentUrl;
    const comment_text = {text: event.target.value};
    const curr_comments = this.state.comments;
    fetch(commentUrl, {
      credentials: 'same-origin',
      method: "POST", 
      body: JSON.stringify(comment_text),
      headers: {'Content-Type': 'application/json'}
    })
      .then((response) => {
        if (!(response.ok && response.status === 201)) throw Error(response.statusText);
        return response.json();
      })
      .then((comment_data) => {
        this.setState({
          comments: curr_comments.concat(comment_data),
          newComment: comment_text
        });
      })
      .catch((error) => console.log(error));
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    const {
      owner, ownerImgUrl, ownerShowUrl, imgUrl, postShowUrl, postid, 
      created, comments, likes
    } = this.state;
    let numLikes = likes.numLikes;
    let likeComp;
    if (numLikes === 0 || numLikes >= 2) {
      likeComp = <p>{numLikes} likes</p>;
    }
    else {
      likeComp = <p>{numLikes} like</p>;
    }
    let likeButton;
    if (likes.lognameLikesThis === true) {
      likeButton = <button className="like-unlike-button" onClick={this.handleUnlike(likes.url)}>
        Unlike
      </button>;
    }
    else {
      likeButton = <button className="like-unlike-button" onClick={this.handleLike}>
        Like
      </button>;
    }
    let commentComp = comments.map((comment) => (
      <div key={comment.commentid}>
        <a href={comment.ownerShowUrl}>
          <b>{comment.owner}</b>
        </a>
        <p>{comment.text}</p>
        {comment.lognameOwnsThis === true &&
          <button className="delete-comment-button" onClick={this.handleDeleteComment(comment.commentid)}>
            delete
          </button>
        }
      </div>
    ));
    let commentSubmission = <form className="comment-form" onSubmit={this.handleSubmit}>
      <label>
        <input type="text" value={this.state.newComment} onChange={this.handleAddComment} />
      </label>
      <input type="submit" name="comment" value="comment"/>
    </form>;

    const style_owner = {display: "inline-block", verticalAlign: "middle"};
    const style_time = {display: "inline-block", fontSize: "small"};

    return (
      <div className="post">
        <div className="postHeader">
          <a href={ownerShowUrl}>
            <div>
              <div style={style_owner}>
                <img src={ownerImgUrl} width="30" height="30" alt="Portrait"/>
              </div>
              <b style={style_owner}>
                {owner}
              </b>
            </div>
          </a>
          <a href={postShowUrl}>
            <p style={style_time}>
              {created}
            </p>
          </a>
        </div>
        <div className="postPhoto">
          <img src={imgUrl} alt="postPhoto"/>
        </div>
        <div className="postParagraph">
          {likeComp}
          {likeButton}
          {commentComp}
          {commentSubmission}
        </div>
      </div>
    );
  }
}


Post.propTypes = {
  posturl: PropTypes.string.isRequired,
};

export default Post;