import React from 'react';
import PropTypes from 'prop-types';

class Comment extends React.Component {
  constructor(props) {
    super(props);
    this.triggerDeleteComment = this.triggerDeleteComment.bind(this);
  }

  triggerDeleteComment(commentId) {
    const { deleteFunc } = this.props;
    deleteFunc(commentId);
  }

  render() {
    const { commentObj } = this.props;
    return (
      <div>
        <a href={commentObj.ownerShowUrl}>
          <b>{commentObj.owner}</b>
        </a>
        <p>{commentObj.text}</p>
        {commentObj.lognameOwnsThis === true && (
          <button
            type="button"
            className="delete-comment-button"
            onClick={this.triggerDeleteComment.bind(this, commentObj.commentid)}
          >
            delete
          </button>
        )}
      </div>
    );
  }
}

Comment.propTypes = {
  commentObj: PropTypes.shape({
    commentid: PropTypes.number.isRequired,
    lognameOwnsThis: PropTypes.bool.isRequired,
    owner: PropTypes.string.isRequired,
    ownerShowUrl: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  deleteFunc: PropTypes.func.isRequired,
};

export default Comment;
