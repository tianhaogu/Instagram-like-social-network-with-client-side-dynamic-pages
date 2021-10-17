import React from 'react';
import PropTypes from 'prop-types';

class LikeSum extends React.Component {
  render() {
    const { numLikes } = this.props;
    let likeComp;
    if (numLikes === 0 || numLikes >= 2) {
      likeComp = (
        <p>
          { numLikes }
          {' '}
          likes
        </p>
      );
    } else {
      likeComp = (
        <p>
          {numLikes}
          {' '}
          like
        </p>
      );
    }
    return likeComp;
  }
}

LikeSum.propTypes = {
  numLikes: PropTypes.number.isRequired,
};
export default LikeSum;
