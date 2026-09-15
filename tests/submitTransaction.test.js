const nock = require('nock');
const { submitTransaction, TransactionError, TransientError } = require('../src/fhirClient');

describe('submitTransaction', () => {
  beforeAll(() => nock.disableNetConnect());
  afterAll(() => nock.enableNetConnect());

  it('parses transaction-response and returns mapping', async () => {
    const base = 'https://hapi.fhir.org';
    const respBundle = {
      resourceType: 'Bundle',
      type: 'transaction-response',
      entry: [
        { response: { location: 'Patient/123/_history/1', status: '201' } }
      ]
    };
    nock(base).post('/baseR4').reply(200, respBundle);
    const res = await submitTransaction({ resourceType: 'Bundle' }, { baseUrl: base + '/baseR4' });
    const vals = Object.values(res);
    expect(vals[0].location).toBe('Patient/123/_history/1');
    expect(vals[0].status).toBe('201');
  });

  it('throws TransactionError on OperationOutcome 422', async () => {
    const base = 'https://hapi.fhir.org';
    const oo = { resourceType: 'OperationOutcome', issue: [{ severity: 'error', diagnostics: 'bad' }] };
    nock(base).post('/baseR4').reply(422, oo);
    await expect(submitTransaction({ resourceType: 'Bundle' }, { baseUrl: base + '/baseR4' })).rejects.toThrow(TransactionError);
  });

  it('retries on 5xx and eventually throws TransientError when exhausted', async () => {
    const base = 'https://hapi.fhir.org';
    // Reply 500 three times
    nock(base).post('/baseR4').times(4).reply(500, 'oops');
    await expect(submitTransaction({ resourceType: 'Bundle' }, { baseUrl: base + '/baseR4', maxRetries: 2 })).rejects.toThrow(TransientError);
  });
});
