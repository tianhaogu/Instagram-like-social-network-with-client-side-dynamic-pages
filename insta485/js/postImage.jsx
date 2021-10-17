import React from 'react';
import PropTypes from 'prop-types';

function PostImage(props) {
  const { imgUrl, handleDoubleClick } = props;
  return (
    <div className="postPhoto">
      <button type="button">
        <img
          src={imgUrl}
          alt="postPhoto"
          onDoubleClick={handleDoubleClick}
        />
      </button>
    </div>
  );
}

PostImage.propTypes = {
  handleDoubleClick: PropTypes.func.isRequired,
  imgUrl: PropTypes.string.isRequired,
};

export default PostImage;
