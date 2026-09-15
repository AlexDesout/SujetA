const axios = require('axios');

const HAPI_BASE = process.env.HAPI_FHIR_BASE || 'https://hapi.fhir.org/baseR4';
const { validateBundleStructure } = require('./validator');

class TransactionError extends Error {
  constructor(message, status, operationOutcome) {
    super(message);
    this.name = 'TransactionError';
    this.status = status;
    this.operationOutcome = operationOutcome;
  }
}

class TransientError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TransientError';
  }
}

async function searchPatientByIns(ins, options = {}) {
  const params = { identifier: ins };
  const url = `${HAPI_BASE}/Patient`;
  const resp = await axios.get(url, { params, timeout: options.timeout || 5000 });
  return resp.data;
}

async function submitTransaction(bundle, options = {}) {
  const baseUrl = options.baseUrl || HAPI_BASE;
  const timeout = options.timeout || 10000;
  const maxRetries = options.maxRetries != null ? options.maxRetries : 3;

  let attempt = 0;
  const makeRequest = async () => {
    attempt++;
    try {
      // Optional local validation before sending
      if (options.validateBundle) {
        const check = validateBundleStructure(bundle);
        if (!check.valid) {
          const oo = { resourceType: 'OperationOutcome', issue: check.issues };
          throw new TransactionError('Bundle validation failed locally', 422, oo);
        }
      }
      const resp = await axios.post(baseUrl, bundle, {
        headers: { 'Content-Type': 'application/fhir+json' },
        timeout
      });

      // HTTP 2xx
      if (resp && resp.data && resp.data.resourceType === 'Bundle' && resp.data.type === 'transaction-response') {
        const mapping = {};
        for (const entry of resp.data.entry || []) {
          const reqFullUrl = (entry.request && entry.request.url) || entry.fullUrl || (entry.response && entry.response.location) || null;
          const key = reqFullUrl || (entry.response && entry.response.location) || `entry_${Math.random().toString(36).slice(2,8)}`;
          mapping[key] = { location: (entry.response && entry.response.location) || null, status: (entry.response && entry.response.status) || null };
        }
        return mapping;
      }

      // If body is OperationOutcome (error encoded despite 2xx) handle
      if (resp && resp.data && resp.data.resourceType === 'OperationOutcome') {
        throw new TransactionError('OperationOutcome returned', resp.status, resp.data);
      }

      // Unexpected response shape
      return resp.data;
    } catch (err) {
      // If axios response exists
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        if (data && data.resourceType === 'OperationOutcome') {
          throw new TransactionError('Transaction failed with OperationOutcome', status, data);
        }

        // 5xx -> transient retry
        if (status >= 500 && status < 600) {
          if (attempt <= maxRetries) {
            const backoff = 200 * Math.pow(2, attempt - 1);
            await new Promise(r => setTimeout(r, backoff));
            return makeRequest();
          }
          throw new TransientError(`Server error ${status} after ${attempt} attempts`);
        }

        // Other HTTP errors -> TransactionError
        throw new TransactionError(`HTTP error ${status}`, status, data);
      }

      // Network / timeout
      if (attempt <= maxRetries) {
        const backoff = 200 * Math.pow(2, attempt - 1);
        await new Promise(r => setTimeout(r, backoff));
        return makeRequest();
      }
      throw new TransientError(err.message || 'Network error');
    }
  };

  return makeRequest();
}

module.exports = { searchPatientByIns, submitTransaction, TransactionError, TransientError };
