import React from "react";
import PropTypes from "prop-types";
class LikeSum extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let likeComp;
    if (this.props.numLikes === 0 || this.props.numLikes >= 2) {
      likeComp = <p>{this.props.numLikes} likes</p>;
    } else {
      likeComp = <p>{this.props.numLikes} like</p>;
    }
    return likeComp;
  }
}

export default LikeSum;
