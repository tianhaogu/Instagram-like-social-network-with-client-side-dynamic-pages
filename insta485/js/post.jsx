import React from 'react';
import PropTypes from 'prop-types';
import CommentSubmission from './CommentSubmission';
import Comment from './comment';
import PostImage from './postImage';
import LikeControl from './likeControl';
import LikeSum from './likeSum';
import PostHeader from './postHeader';

class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      owner: '',
      ownerImgUrl: '',
      ownerShowUrl: '',
      imgUrl: '',
      postShowUrl: '',
      postid: '',
      created: '',
      comments: [],
      likes: { lognameLikesThis: false, numLikes: 0, url: null },
      commentUrl: '',
      likeUrl: '',
    };
    this.handleUnlikeClick = this.handleUnlikeClick.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleLikeClick = this.handleLikeClick.bind(this);
    this.handleDeleteComment = this.handleDeleteComment.bind(this);
    this.handleAddComment = this.handleAddComment.bind(this);
  }

  componentDidMount() {
    const { posturl } = this.props;
    fetch(posturl, { credentials: 'same-origin', method: 'GET' })
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
          commentUrl: `/api/v1/comments/?postid=${data.postid.toString()}`,
          likeUrl: `/api/v1/likes/?postid=${data.postid.toString()}`,
        });
      })
      .catch((error) => console.log(error));
  }

  handleUnlikeClick() {
    const like_url = this.state.likes.url;
    const num_likes = this.state.likes.numLikes;
    fetch(like_url, { credentials: 'same-origin', method: 'DELETE' })
      .then((response) => {
        if (!(response.ok && response.status === 204)) { throw Error(response.statusText); }
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
      this.handleLikeClick();
    }
  }

  handleLikeClick() {
    const { likeUrl } = this.state;
    const num_likes = this.state.likes.numLikes;
    fetch(likeUrl, { credentials: 'same-origin', method: 'POST' })
      .then((response) => {
        if (!(response.ok && response.status === 201)) { throw Error(response.statusText); }
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
    const commentUrl = `/api/v1/comments/${comment_id.toString()}/`;
    fetch(commentUrl, { credentials: 'same-origin', method: 'DELETE' })
      .then((response) => {
        if (!(response.ok && response.status === 204)) { throw Error(response.statusText); }
      })
      .then(() => {
        const after_comments = this.state.comments.filter(
          (comment) => comment.commentid !== comment_id,
        );
        this.setState({
          comments: after_comments,
        });
      })
      .catch((error) => console.log(error));
  }

  handleAddComment(newComment) {
    const { commentUrl } = this.state;
    const comment_text = { text: newComment };
    const curr_comments = this.state.comments;
    fetch(commentUrl, {
      credentials: 'same-origin',
      method: 'POST',
      body: JSON.stringify(comment_text),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (!(response.ok && response.status === 201)) { throw Error(response.statusText); }
        return response.json();
      })
      .then((comment_data) => {
        this.setState({
          comments: curr_comments.concat(comment_data),
        });
      })
      .catch((error) => console.log(error));
  }

  render() {
    const {
      owner,
      ownerImgUrl,
      ownerShowUrl,
      imgUrl,
      postShowUrl,
      postid,
      created,
      comments,
      likes,
      commentUrl,
    } = this.state;

    return (
      <div className="post">
        <PostHeader
          ownerShowUrl={ownerShowUrl}
          ownerImgUrl={ownerImgUrl}
          owner={owner}
          postShowUrl={postShowUrl}
          created={created}
        />
        <PostImage imgUrl={imgUrl} handleDoubleClick={this.handleDoubleClick} />
        <div className="postParagraph">
          <LikeSum numLikes={likes.numLikes} />
          <LikeControl
            isLognameLikesThis={likes.lognameLikesThis}
            handleLikeClick={this.handleLikeClick}
            handleUnlikeClick={this.handleUnlikeClick}
          />
          {comments.map((comment) => (
            <div key={comment.commentid}>
              <Comment
                commentObj={comment}
                deleteFunc={this.handleDeleteComment}
              />
            </div>
          ))}
          <div key={commentUrl}>
            <CommentSubmission addFunc={this.handleAddComment} />
          </div>
        </div>
      </div>
    );
  }
}

Post.propTypes = {
  posturl: PropTypes.string.isRequired,
};

export default Post;
