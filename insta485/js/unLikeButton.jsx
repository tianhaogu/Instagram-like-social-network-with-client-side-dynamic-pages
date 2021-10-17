import React from 'react';
import PropTypes from 'prop-types';

function UnlikeButton(props) {
  const { onClick } = props;
  return (
    <button type="button" className="like-unlike-button" onClick={onClick}>
      UNLIKE
    </button>
  );
}

UnlikeButton.defaultProps = {
  onClick: PropTypes.func,
};

UnlikeButton.propTypes = {
  onClick: PropTypes.func,
};

export default UnlikeButton;
