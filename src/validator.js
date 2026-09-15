function validateBundleStructure(bundle) {
  const issues = [];
  if (!bundle || bundle.resourceType !== 'Bundle') {
    issues.push({ severity: 'error', diagnostics: 'Bundle.resourceType must be "Bundle"' });
    return { valid: false, issues };
  }
  if (bundle.type !== 'transaction') {
    issues.push({ severity: 'warning', diagnostics: 'Bundle.type should be "transaction" for atomic operations' });
  }
  if (!Array.isArray(bundle.entry) || bundle.entry.length === 0) {
    issues.push({ severity: 'error', diagnostics: 'Bundle.entry must be a non-empty array' });
    return { valid: false, issues };
  }
  for (const [i, entry] of (bundle.entry || []).entries()) {
    if (!entry.resource || !entry.resource.resourceType) {
      issues.push({ severity: 'error', diagnostics: `entry[${i}] missing resource.resourceType` });
    }
    if (!entry.request || !entry.request.method || !entry.request.url) {
      issues.push({ severity: 'error', diagnostics: `entry[${i}] missing request.method or request.url` });
    }
  }
  const valid = !issues.some(it => it.severity === 'error');
  return { valid, issues };
}

module.exports = { validateBundleStructure };
