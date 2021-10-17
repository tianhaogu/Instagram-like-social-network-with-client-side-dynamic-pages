import React from 'react';
import ReactDOM from 'react-dom';
import Index from './index';

// This method is only called once
ReactDOM.render(
  // Insert the post component into the DOM
  <Index url="/api/v1/posts/" />,
  document.getElementById('reactEntry'),
);
