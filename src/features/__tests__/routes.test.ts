import { resolveRouteFeature } from '../routes';

describe('feature routes', () => {
  it('maps disabled drawer groups', () => {
    expect(resolveRouteFeature(['(credits)'])).toEqual({
      feature: 'credits',
      redirect: '/',
    });
    expect(resolveRouteFeature(['(savings)'])).toEqual({
      feature: 'savings',
      redirect: '/',
    });
    expect(resolveRouteFeature(['(budget)'])).toEqual({
      feature: 'budget',
      redirect: '/',
    });
  });

  it('maps the financings tab inside commitments', () => {
    expect(resolveRouteFeature(['(fixeds)'])).toEqual({
      feature: 'fixeds',
      redirect: '/',
    });
    expect(resolveRouteFeature(['(fixeds)', 'FinancingsScreen'])).toEqual({
      feature: 'financings',
      redirect: '/',
    });
  });

  it('maps advanced catalog tabs in financials', () => {
    expect(resolveRouteFeature(['(financials)', 'PaymentTypesScreen'])).toEqual({
      feature: 'advancedCatalogs',
      redirect: '/',
    });
    expect(resolveRouteFeature(['(financials)', 'RecordTypesScreen'])).toEqual({
      feature: 'advancedCatalogs',
      redirect: '/',
    });
    expect(resolveRouteFeature(['(financials)', 'RecordsScreen'])).toBeNull();
  });

  it('leaves always-visible routes alone', () => {
    expect(resolveRouteFeature([])).toBeNull();
    expect(resolveRouteFeature(['index'])).toBeNull();
    expect(resolveRouteFeature(['(settings)'])).toBeNull();
    expect(resolveRouteFeature(['(help)'])).toBeNull();
  });
});
