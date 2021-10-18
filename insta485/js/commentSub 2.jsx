import React from 'react';
import PropTypes from 'prop-types';

class CommentSubmission extends React.Component {
  constructor(props) {
    super(props);
    this.state = { newComment: '' };
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.triggerAddComment = this.triggerAddComment.bind(this);
  }

  handleCommentChange(event) {
    this.setState({
      newComment: event.target.value,
    });
  }

  triggerAddComment(event) {
    const { addFunc } = this.props;
    const { newComment } = this.state;
    addFunc(newComment);
    this.setState({
      newComment: '',
    });
    event.preventDefault();
  }

  render() {
    const { newComment } = this.state;
    return (
      <form className="comment-form" onSubmit={this.triggerAddComment}>
        <input
          type="text"
          value={newComment}
          onChange={this.handleCommentChange}
        />
      </form>
    );
  }
}

CommentSubmission.propTypes = {
  addFunc: PropTypes.func.isRequired,
};

export default CommentSubmission;
