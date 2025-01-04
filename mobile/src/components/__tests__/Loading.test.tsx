import React from 'react';
import { render } from '@testing-library/react-native';
import Loading from '../Loading';

describe('Loading', () => {
  it('renders activity indicator', () => {
    const { getByTestId } = render(<Loading />);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });
});
