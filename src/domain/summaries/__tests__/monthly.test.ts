import { isMonthlyCashRecord } from '../monthly';

describe('isMonthlyCashRecord', () => {
  it('counts records without a saving source', () => {
    expect(isMonthlyCashRecord({ saving_id: null })).toBe(true);
    expect(isMonthlyCashRecord({})).toBe(true);
  });

  it('excludes records paid from a saving', () => {
    expect(isMonthlyCashRecord({ saving_id: 3 })).toBe(false);
  });
});
