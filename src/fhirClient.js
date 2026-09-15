const axios = require('axios');

const HAPI_BASE = process.env.HAPI_FHIR_BASE || 'https://hapi.fhir.org/baseR4';

async function searchPatientByIns(ins, options = {}) {
  const params = { identifier: ins };
  const url = `${HAPI_BASE}/Patient`;
  const resp = await axios.get(url, { params, timeout: options.timeout || 5000 });
  return resp.data;
}

async function submitTransaction(bundle, options = {}) {
  const url = `${HAPI_BASE}`;
  const resp = await axios.post(url, bundle, {
    headers: { 'Content-Type': 'application/fhir+json' },
    timeout: options.timeout || 10000
  });
  return resp.data;
}

module.exports = { searchPatientByIns, submitTransaction };
