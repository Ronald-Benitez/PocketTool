/* eslint-disable @typescript-eslint/no-require-imports */
import * as React from 'react';
import { Pressable } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { IconButton } from '../actions/IconButton';
import { FloatingActions } from '../actions/FloatingActions';
import { QuickAction } from '../actions/QuickAction';
import { SectionCard } from '../data-display/SectionCard';
import { StatTile } from '../data-display/StatTile';
import { ProgressBar } from '../data-display/ProgressBar';
import { InfoHint } from '../overlays/InfoHint';
import { Modal } from '../overlays/Modal';
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

jest.mock('@/src/lang/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: string) => key,
  }),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    MaterialIcons: ({ name }: { name: string }) =>
      React.createElement(Text, null, name),
  };
});

const renderJson = (tree: renderer.ReactTestRenderer) =>
  JSON.stringify(tree.toJSON());

describe('InfoHint', () => {
  it('opens a modal with the title and body', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<InfoHint title='Goal' body='How the goal works' />);
    });

    expect(tree!.root.findByType(Modal).props.visible).toBe(false);

    act(() => {
      tree!.root.findByType(IconButton).props.onPress();
    });

    const modal = tree!.root.findByType(Modal);
    expect(modal.props.visible).toBe(true);
    expect(modal.props.title).toBe('Goal');
    expect(renderJson(tree!)).toContain('How the goal works');
  });
});

describe('SectionCard', () => {
  it('renders a header, action, tooltip and collapses its content', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <SectionCard
          title='Budget'
          action={<AppText>See all</AppText>}
          tooltip={{ title: 'Budget', body: 'Expected balance details' }}
          collapsible
        >
          <AppText>Budget content</AppText>
        </SectionCard>
      );
    });

    expect(renderJson(tree!)).toContain('Budget');
    expect(renderJson(tree!)).toContain('See all');
    expect(renderJson(tree!)).toContain('Budget content');
    expect(tree!.root.findByType(InfoHint)).toBeTruthy();

    const header = tree!.root.findAll(
      (node) => node.props.accessibilityState?.expanded === true
    )[0];
    act(() => {
      header.props.onPress();
    });

    expect(renderJson(tree!)).not.toContain('Budget content');
  });

  it('does not collapse when collapsible is false', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <SectionCard title='Static'>
          <AppText>Always visible</AppText>
        </SectionCard>
      );
    });

    expect(tree!.root.findAllByType(Pressable)).toHaveLength(0);
    expect(renderJson(tree!)).toContain('Always visible');
  });
});

describe('StatTile', () => {
  it('renders a money value, hint and press callback', () => {
    const onPress = jest.fn();
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <StatTile
          label='Consumption'
          cents={250000}
          hint='Current group'
          onPress={onPress}
        />
      );
    });

    const rendered = renderJson(tree!);
    expect(rendered).toContain('Consumption');
    expect(rendered).toContain('Current group');

    const pressable = tree!.root.findAllByProps({ accessibilityLabel: 'Consumption' })[0];
    act(() => {
      pressable.props.onPress();
    });
    expect(onPress).toHaveBeenCalled();
  });
});

describe('ProgressBar', () => {
  it('exposes an accessible clamped value', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <ProgressBar progress={1.4} label='Goal' valueLabel='100%' />
      );
    });

    const bar = tree!.root.findAllByProps({ accessibilityRole: 'progressbar' })[0];
    expect(bar.props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 100,
    });
    expect(renderJson(tree!)).toContain('Goal');
    expect(renderJson(tree!)).toContain('100%');
  });
});

describe('QuickAction', () => {
  it('renders its label and calls onPress', () => {
    const onPress = jest.fn();
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <QuickAction label='Add record' icon={<AppText>+</AppText>} onPress={onPress} />
      );
    });

    expect(renderJson(tree!)).toContain('Add record');

    const action = tree!.root.findAllByProps({ accessibilityLabel: 'Add record' })[0];
    act(() => {
      action.props.onPress();
    });
    expect(onPress).toHaveBeenCalled();
  });
});

describe('FloatingActions', () => {
  it('runs the main action directly and expands secondary actions', () => {
    const onMain = jest.fn();
    const onSecondary = jest.fn();
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <FloatingActions
          mainAction={{
            id: 'record',
            label: 'Add record',
            icon: <AppText>+</AppText>,
            onPress: onMain,
          }}
          actions={[
            {
              id: 'fixed',
              label: 'Add fixed',
              icon: <AppText>F</AppText>,
              onPress: onSecondary,
            },
          ]}
        />
      );
    });

    expect(renderJson(tree!)).not.toContain('Add fixed');

    const toggle = tree!.root
      .findAllByType(IconButton)
      .find((node) => node.props.label === 'expandActions');
    act(() => {
      toggle!.props.onPress();
    });

    expect(renderJson(tree!)).toContain('Add fixed');

    const secondary = tree!.root.findAllByProps({ accessibilityLabel: 'Add fixed' })[0];
    act(() => {
      secondary.props.onPress();
    });
    expect(onSecondary).toHaveBeenCalled();

    const main = tree!.root.findAllByProps({ accessibilityLabel: 'Add record' })[0];
    act(() => {
      main.props.onPress();
    });
    expect(onMain).toHaveBeenCalled();
  });
});
