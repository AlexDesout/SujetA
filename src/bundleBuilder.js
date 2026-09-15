function uuidTag() {
  return 'urn:uuid:' + Math.random().toString(36).slice(2, 10);
}

function buildAdmissionBundle(patient, encounter = {}, serviceRequest = {}) {
  const patientFull = uuidTag();
  const encounterFull = uuidTag();
  const srFull = uuidTag();

  const patientRes = Object.assign({}, patient);
  patientRes.resourceType = 'Patient';

  const encounterRes = Object.assign({}, encounter);
  encounterRes.resourceType = 'Encounter';
  // link to patient by reference
  encounterRes.subject = { reference: patientFull };

  const serviceRequestRes = Object.assign({}, serviceRequest);
  serviceRequestRes.resourceType = 'ServiceRequest';
  serviceRequestRes.subject = { reference: patientFull };
  // link to encounter if id present
  serviceRequestRes.encounter = { reference: encounterFull };

  const bundle = {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [
      {
        fullUrl: patientFull,
        resource: patientRes,
        request: { method: 'POST', url: 'Patient' }
      },
      {
        fullUrl: encounterFull,
        resource: encounterRes,
        request: { method: 'POST', url: 'Encounter' }
      },
      {
        fullUrl: srFull,
        resource: serviceRequestRes,
        request: { method: 'POST', url: 'ServiceRequest' }
      }
    ]
  };

  return bundle;
}

module.exports = { buildAdmissionBundle };
