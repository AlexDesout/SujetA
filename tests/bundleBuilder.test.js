const { buildAdmissionBundle } = require('../src/bundleBuilder');

describe('admission bundle', () => {
  it('builds linked ambulatory resources with a NFS request', () => {
    const bundle = buildAdmissionBundle(
      { identifier: [{ system: 'urn:oid:1.2.250.1.213.1.4.8', value: '1234567890123' }] },
      {},
      { requester: { display: 'Dr Martin' } }
    );

    expect(bundle.type).toBe('transaction');
    expect(bundle.entry).toHaveLength(3);
    expect(bundle.entry[1].resource.class.code).toBe('AMB');
    expect(bundle.entry[1].resource.subject.reference).toBe(bundle.entry[0].fullUrl);
    expect(bundle.entry[2].resource.subject.reference).toBe(bundle.entry[0].fullUrl);
    expect(bundle.entry[2].resource.encounter.reference).toBe(bundle.entry[1].fullUrl);
    expect(bundle.entry[2].resource.code.coding[0].code).toBe('58410-2');
  });
});

describe('buildAdmissionBundle', () => {
  it('creates a transaction bundle with Patient, Encounter, ServiceRequest', () => {
    const patient = { identifier: [{ value: '285033155504217', system: 'urn:oid:1.2.250.1.213.1.4.8' }], name: [{ family: 'Dupont', given: ['Jean'] }] };
    const encounter = { class: { code: 'AMB' }, location: 'LBM' };
    const sr = { code: { coding: [{ system: 'http://loinc.org', code: '58410-2', display: 'CBC panel' }] } };

    const bundle = buildAdmissionBundle(patient, encounter, sr);
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('transaction');
    expect(Array.isArray(bundle.entry)).toBe(true);
    expect(bundle.entry.length).toBe(3);
    const urls = bundle.entry.map(e => e.request.url);
    expect(urls).toContain('Patient');
    expect(urls).toContain('Encounter');
    expect(urls).toContain('ServiceRequest');
  });
});
