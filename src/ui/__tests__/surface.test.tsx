/* eslint-disable @typescript-eslint/no-require-imports */
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { Surface } from '../primitives/Surface';
import { AppText } from '../primitives/AppText';

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: (props: Record<string, unknown>) =>
      React.createElement(View, props, props.children as React.ReactNode),
  };
});

jest.mock('../theme/ThemeProvider', () => {
  const { brightBase, buildColorScheme } = require('../theme/colors');
  return {
    useTheme: () => ({
      colors: buildColorScheme(brightBase),
      resolvedMode: 'light',
    }),
  };
});

describe('Surface glass', () => {
  it('renders a translucent background with a border and keeps children', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <Surface variant='glass'>
          <AppText>Glass content</AppText>
        </Surface>
      );
    });

    const view = tree!.root.findAllByType(View)[0];
    const style = StyleSheet.flatten(view.props.style);

    expect(style.borderWidth).toBe(1);
    expect(style.backgroundColor).toMatch(/^#[0-9A-F]{8}$/);
    expect(JSON.stringify(tree!.toJSON())).toContain('Glass content');
  });

  it('keeps the flat surface opaque and borderless', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <Surface>
          <AppText>Flat content</AppText>
        </Surface>
      );
    });

    const view = tree!.root.findAllByType(View)[0];
    const style = StyleSheet.flatten(view.props.style);

    expect(style.borderWidth).toBe(0);
    expect(style.backgroundColor).toMatch(/^#[0-9A-F]{6}$/);
    expect(JSON.stringify(tree!.toJSON())).toContain('Flat content');
  });
});
