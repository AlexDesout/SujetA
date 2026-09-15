const nock = require('nock');
const { searchPatientByIns } = require('../src/fhirClient');

describe('fhirClient', () => {
  beforeAll(() => nock.disableNetConnect());
  afterAll(() => nock.enableNetConnect());

  it('searchPatientByIns should call HAPI and return bundle', async () => {
    const base = 'https://hapi.fhir.org';
    nock(base).get('/baseR4/Patient').query({ identifier: '123' }).reply(200, { resourceType: 'Bundle' });
    const data = await searchPatientByIns('123');
    expect(data.resourceType).toBe('Bundle');
  });
});
