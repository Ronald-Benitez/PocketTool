/* eslint-disable @typescript-eslint/no-require-imports */
import * as React from 'react';
import renderer, { act } from 'react-test-renderer';

import { Button } from '../actions/Button';
import { TextField } from '../forms/TextField';

jest.mock('../theme/ThemeProvider', () => {
  const { brightBase, buildColorScheme } = require('../theme/colors');
  return {
    useTheme: () => ({ colors: buildColorScheme(brightBase) }),
  };
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) => React.createElement(Text, null, name),
  };
});

describe('UI primitives', () => {
  it('renders a button with its label', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<Button label='Save' onPress={() => {}} />);
    });

    expect(JSON.stringify(tree!.toJSON())).toContain('Save');
  });

  it('renders a text field with label and error message', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <TextField
          label='Name'
          value=''
          onChangeText={() => {}}
          required
          error='This field is required'
        />
      );
    });

    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain('Name');
    expect(rendered).toContain('This field is required');
  });
});
