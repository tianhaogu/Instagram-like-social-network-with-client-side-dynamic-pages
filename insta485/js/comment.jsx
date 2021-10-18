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
        <p>
          <span>
            <a href={commentObj.ownerShowUrl}>
              <b>{commentObj.owner}</b>
            </a>
          </span>
          <span> : </span>
          <span>{commentObj.text}</span>
          <span>      </span>
          <span>
            {commentObj.lognameOwnsThis === true && (
            <button
              type="button"
              className="delete-comment-button"
              onClick={this.triggerDeleteComment.bind(this, commentObj.commentid)}
            >
              delete
            </button>
            )}
          </span>
        </p>
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
