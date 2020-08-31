import React from 'react';
import App from './App';
import { shallow, mount } from 'enzyme';

it('renders without crashing', () => {
  shallow(<App />);
});

// it('full rendering without crashing', () => {
//   mount(<App />);
// });
