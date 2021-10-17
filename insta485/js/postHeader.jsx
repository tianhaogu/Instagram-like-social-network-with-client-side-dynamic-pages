import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';

class PostHeader extends React.Component {
  constructor(props) {
    super(props);
    this.convertime = this.convertime.bind(this);
  }

  convertime() {
    const { created } = this.props;
    const sqlDateTime = created.split(' ');
    const momentInput = `${sqlDateTime[0]}T${sqlDateTime[1]}`;
    const utcTime = moment.utc(momentInput);
    const timeCreated = moment(utcTime).fromNow();
    return timeCreated;
  }

  render() {
    const styleOwner = { display: 'inline-block', verticalAlign: 'middle' };
    const styleTime = { display: 'inline-block', fontSize: 'small' };
    const {
      ownerShowUrl, ownerImgUrl, owner, postShowUrl,
    } = this.props;
    const timeCreated = this.convertime();

    return (
      <div className="postHeader">
        <a href={ownerShowUrl}>
          <div>
            <div style={styleOwner}>
              <img
                src={ownerImgUrl}
                width="30"
                height="30"
                alt="Portrait"
              />
            </div>
            <b style={styleOwner}>{owner}</b>
          </div>
        </a>
        <a href={postShowUrl}>
          <p style={styleTime}>{timeCreated}</p>
          {' '}
        </a>
      </div>
    );
  }
}
PostHeader.propTypes = {
  created: PropTypes.string.isRequired,
  ownerShowUrl: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
  postShowUrl: PropTypes.string.isRequired,
  ownerImgUrl: PropTypes.string.isRequired,
};
export default PostHeader;
