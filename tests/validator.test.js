const { validateBundleStructure } = require('../src/validator');

describe('validateBundleStructure', () => {
  it('rejects non-bundle', () => {
    const res = validateBundleStructure(null);
    expect(res.valid).toBe(false);
    expect(res.issues.length).toBeGreaterThan(0);
  });

  it('accepts minimal transaction bundle', () => {
    const b = { resourceType: 'Bundle', type: 'transaction', entry: [{ resource: { resourceType: 'Patient' }, request: { method: 'POST', url: 'Patient' } }] };
    const r = validateBundleStructure(b);
    expect(r.valid).toBe(true);
  });
});
