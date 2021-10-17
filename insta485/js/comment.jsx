import React from "react";
import PropTypes from "prop-types";


class Comment extends React.Component {
  constructor(props) {
    super(props);
    this.triggerDeleteComment = this.triggerDeleteComment.bind(this);
  }

  triggerDeleteComment(comment_id) {
    let handleDeleteComment = this.props.deleteFunc;
    handleDeleteComment(comment_id);
  }

  render() {
    const comment = this.props.commentObj;
    return (
      <div>
        <a href={comment.ownerShowUrl}>
          <b>{comment.owner}</b>
        </a>
        <p>{comment.text}</p>
        {comment.lognameOwnsThis === true && (
          <button 
            className="delete-comment-button"
            onClick={this.triggerDeleteComment.bind(this, comment.commentid)}
          >
            delete
          </button>
        )}
      </div>
    );
  }
}

Comment.propTypes = {
  commentObj: PropTypes.shape(
    {
      commentid: PropTypes.number.isRequired,
      lognameOwnsThis: PropTypes.bool.isRequired,
      owner: PropTypes.string.isRequired,
      ownerShowUrl: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired
    }
  ),
  deleteFunc: PropTypes.func.isRequired,
};

export default Comment;