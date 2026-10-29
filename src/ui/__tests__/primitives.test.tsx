/* eslint-disable @typescript-eslint/no-require-imports */
import * as React from 'react';
import renderer, { act } from 'react-test-renderer';

import { Button } from '../actions/Button';
import { Badge } from '../data-display/Badge';
import { Card } from '../data-display/Card';
import { FinanceValue } from '../data-display/FinanceValue';
import { SummaryBlock } from '../data-display/SummaryBlock';
import { DateField } from '../forms/DateField';
import { InlineMessage } from '../feedback/InlineMessage';
import { MoneyField } from '../forms/MoneyField';
import { MonthField } from '../forms/MonthField';
import { SelectField } from '../forms/SelectField';
import { SwitchField } from '../forms/SwitchField';
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

jest.mock('@/src/lang/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: string) => key,
    getMonths: () =>
      Array.from({ length: 12 }, (_, index) => `Month ${index + 1}`),
  }),
}));

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

  it('renders specialized fields with their labels', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <>
          <MoneyField label='Amount' value={1250} onChangeCents={() => {}} />
          <SelectField
            label='Category'
            placeholder='Pick one'
            value={undefined}
            options={[{ label: 'Food', value: 'food' }]}
            onChange={() => {}}
          />
          <DateField label='Date' value={Date.now()} onChange={() => {}} />
          <MonthField label='Month' value={0} onChange={() => {}} />
          <SwitchField label='Notifications' value onChange={() => {}} />
        </>
      );
    });

    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain('Amount');
    expect(rendered).toContain('Category');
    expect(rendered).toContain('Date');
    expect(rendered).toContain('Month');
    expect(rendered).toContain('Notifications');
  });

  it('renders inline messages with their content', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <InlineMessage variant='error' title='Invalid form' message='Check the fields' />
      );
    });

    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain('Invalid form');
    expect(rendered).toContain('Check the fields');
  });

  it('renders data display components', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <>
          <Badge label='Active' tone='success' />
          <Card title='Summary' subtitle='Monthly totals'>
            <FinanceValue cents={-1250} />
            <SummaryBlock label='Balance' cents={250000} />
          </Card>
        </>
      );
    });

    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain('Active');
    expect(rendered).toContain('Summary');
    expect(rendered).toContain('Monthly totals');
    expect(rendered).toContain('Balance');
    expect(rendered).toContain('-12.50');
  });
});
