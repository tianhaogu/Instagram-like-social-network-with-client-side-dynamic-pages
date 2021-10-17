import React from 'react';
import PropTypes from 'prop-types';

function LikeButton(props) {
  const { onClick } = props;
  return (
    <button type="button" className="like-unlike-button" onClick={onClick}>
      LIKE
    </button>
  );
}

LikeButton.defaultProps = {
  onClick: PropTypes.func,
};
LikeButton.propTypes = {
  onClick: PropTypes.func,
};

export default LikeButton;
