import React from "react";
import PropTypes from "prop-types";


class CommentSubmission extends React.Component {
  constructor(props) {
    super(props);
    this.state = {newComment: ""};
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.triggerAddComment = this.triggerAddComment.bind(this);
  }

  handleCommentChange(event) {
    this.setState({
      newComment: event.target.value,
    });
  }

  triggerAddComment(event) {
    let handleAddComment = this.props.addFunc;
    handleAddComment(this.state.newComment);
    this.setState({
      newComment: "",
    });
    event.preventDefault();
  }

  render() {
    return (
      <form className="comment-form" onSubmit={this.triggerAddComment}>
        <label>
          <input
            type="text"
            value={this.state.newComment}
            onChange={this.handleCommentChange}
          />
        </label>
      </form>
    );
  }
}

CommentSubmission.propTypes = {
  addFunc: PropTypes.func.isRequired,
};

export default CommentSubmission;
