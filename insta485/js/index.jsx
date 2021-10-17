import React from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from './post';

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      next: '',
      results: [],
      hasMore: true,
    };
    this.fetchMoreData = this.fetchMoreData.bind(this);
  }

  componentDidMount() {
    const { url } = this.props;
    fetch(url, { credentials: 'same-origin', method: 'GET' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({
          next: data.next,
          results: data.results,
        });
      })
      .catch((error) => console.log(error));
  }

  fetchMoreData() {
    const { next, results } = this.state;
    if (next === '') {
      this.setState({ hasMore: false });
      return;
    }

    fetch(next, { credentials: 'same-origin', method: 'GET' })
      .then((nextResponse) => {
        if (!nextResponse.ok) throw Error(nextResponse.statusText);
        return nextResponse.json();
      })
      .then((nextData) => {
        this.setState({
          next: nextData.next,
          results: results.concat(nextData.results),
        });
      })
      .catch((nextError) => console.log(nextError));
  }

  render() {
    if (String(window.performance.getEntriesByType('navigation')[0].type) === 'back_forward') {
      this.state = window.history.state;
    }
    window.history.replaceState(this.state, '', '/');
    const { results, hasMore } = this.state;
    return (
      <div className="posts">
        <InfiniteScroll
          dataLength={results.length}
          next={this.fetchMoreData}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
          scrollThreshold="200px"
          endMessage={(
            <p style={{ textAlign: 'center' }}>
              <b>That is all of the posts!</b>
            </p>
          )}
        >
          {results.map((result) => (
            <div key={result.postid}>
              <Post posturl={result.url} />
              <br />
            </div>
          ))}
        </InfiniteScroll>
      </div>
    );
  }
}

Index.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Index;
