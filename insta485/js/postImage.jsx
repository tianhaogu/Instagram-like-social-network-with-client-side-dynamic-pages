import React from "react";
import PropTypes from "prop-types";

class PostImage extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="postPhoto">
        <button>
          <img
            src={this.props.imgUrl}
            alt="postPhoto"
            onDoubleClick={this.props.handleDoubleClick}
          />
        </button>
        {/* THIS IS WHERE THE DOUBLE CLICK LOCKED */}
      </div>
    );
  }
}
