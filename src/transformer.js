function buildPidSegment(patient) {
  const idObj = (patient && patient.identifier && patient.identifier[0]) ? patient.identifier[0] : null;
  const id = idObj ? idObj.value : '';
  // try extract OID from system if urn:oid:... else leave blank
  let authorityOid = '';
  if (idObj && idObj.system) {
    const m = String(idObj.system).match(/urn:oid:(.+)$/);
    if (m) authorityOid = m[1];
  }

  const family = (patient && patient.name && patient.name[0] && patient.name[0].family) || '';
  const given = (patient && patient.name && patient.name[0] && patient.name[0].given) ? patient.name[0].given.join(' ') : '';
  const dob = (patient && patient.birthDate) || '';
  const sex = (patient && patient.gender) || '';

  // PID-3: id^^^authorityOID&oid&ISO^NI when authorityOid present
  const pid3 = authorityOid ? `${id}^^^${authorityOid}&${authorityOid}&ISO^NI` : `${id}`;

  const pid = `PID|1|${pid3}||${family}^${given}||${dob}|${sex}`;
  return pid;
}

function generateAdtA04(patient, encounter = {}, author = {}) {
  const pid = buildPidSegment(patient);
  const msh = 'MSH|^\\\&|ADT_SYSTEM|HOSPITAL|DEST|LAB|' + new Date().toISOString() + '||ADT^A04^ADT_A01|MSG00001|P|2.5.1';
  const evn = `EVN|A04|${new Date().toISOString()}|${author.name || 'system'}`;
  const pv1 = `PV1|1|O|${(encounter && encounter.location) || ''}`;

  // Optionally include OBR if encounter.serviceRequest has LOINC coding 58410-2
  let obr = null;
  if (encounter && encounter.serviceRequest && encounter.serviceRequest.code && Array.isArray(encounter.serviceRequest.code.coding)) {
    const coding = encounter.serviceRequest.code.coding.find(c => c.system === 'http://loinc.org' && c.code === '58410-2');
    if (coding) {
      obr = `OBR|1|||${coding.code}^${coding.display}^LN`;
    }
  }

  const parts = [msh, evn, pid, pv1];
  if (obr) parts.push(obr);

  // INS reliability: look for extension or custom field
  let insReliability = null;
  if (patient && Array.isArray(patient.extension)) {
    const ext = patient.extension.find(e => (e.url && e.url.toLowerCase().includes('ins')) || (e.url && e.url.toLowerCase().includes('identity')));
    if (ext && ext.valueString) insReliability = ext.valueString;
  }
  // also accept patient.insReliability for tests
  if (!insReliability && patient && patient.insReliability) insReliability = patient.insReliability;

  if (insReliability) {
    // add a custom Z segment to convey identity reliability
    parts.push(`ZID|${insReliability}`);
  }
  return parts.join('\r');
}

module.exports = { buildPidSegment, generateAdtA04 };
