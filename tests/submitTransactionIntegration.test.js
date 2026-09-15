const nock = require('nock');
const { submitTransaction } = require('../src/fhirClient');
const { buildAdmissionBundle } = require('../src/bundleBuilder');

describe('submitTransaction integration (mock)', () => {
  beforeAll(() => nock.disableNetConnect());
  afterAll(() => nock.enableNetConnect());

  it('submits a built bundle and parses transaction-response', async () => {
    const base = 'https://hapi.fhir.org';
    const bundle = buildAdmissionBundle({ name: [{ family: 'Dupont', given: ['Jean'] }] });

    const respBundle = {
      resourceType: 'Bundle',
      type: 'transaction-response',
      entry: [
        { response: { location: 'Patient/abc/_history/1', status: '201' } },
        { response: { location: 'Encounter/def/_history/1', status: '201' } },
        { response: { location: 'ServiceRequest/ghi/_history/1', status: '201' } }
      ]
    };

    nock(base).post('/baseR4').reply(200, respBundle);

    const mapping = await submitTransaction(bundle, { baseUrl: base + '/baseR4' });
    const vals = Object.values(mapping);
    expect(vals.length).toBeGreaterThanOrEqual(3);
    expect(vals[0].location).toMatch(/Patient\//);
  });
});
