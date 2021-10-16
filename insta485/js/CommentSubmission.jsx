import React from "react";
import PropTypes from "prop-types";

class CommentSubmission extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: "" };
  }

  render() {
    return (
      <div>
        <form className="comment-form" onSubmit={this.handleSubmit}>
          <label>
            <input
              type="text"
              value={this.props.newComment}
              onChange={this.handleAddComment}
            />
          </label>
          <input type="submit" name="comment" value="comment" />
        </form>
      </div>
    );
  }
}
