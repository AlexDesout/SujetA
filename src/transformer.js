function buildPidSegment(patient) {
  const idObj = (patient && patient.identifier && patient.identifier[0]) ? patient.identifier[0] : null;
  const id = idObj ? idObj.value : '';
  // PID-3 uses the INS authority OID and the NI identifier type.
  let authorityOid = '';
  if (idObj && idObj.system) {
    const m = String(idObj.system).match(/urn:oid:(.+)$/);
    if (m) authorityOid = m[1];
  }

  const family = (patient && patient.name && patient.name[0] && patient.name[0].family) || '';
  const given = (patient && patient.name && patient.name[0] && patient.name[0].given) ? patient.name[0].given.join(' ') : '';
  const dob = ((patient && patient.birthDate) || '').replace(/-/g, '');
  const genderMap = { female: 'F', male: 'M', other: 'O', unknown: 'U' };
  const sex = genderMap[(patient && patient.gender) || ''] || ((patient && patient.gender) || '');

  const pid3 = authorityOid ? `${id}^^^INS-NIR&${authorityOid}&ISO^NI` : `${id}`;

  const pid = `PID|1|${pid3}||${family}^${given}||${dob}|${sex}`;
  return pid;
}

function generateAdtA04(patient, encounter = {}, author = {}, serviceRequest = null) {
  const pid = buildPidSegment(patient);
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, '');
  const msh = `MSH|^~\\&|ADT_SYSTEM|HOSPITAL|DEST|LAB|${timestamp}||ADT^A04^ADT_A01|MSG00001|P|2.5.1`;
  const evn = `EVN|A04|${timestamp}|||${author.name || 'system'}`;
  const pv1 = `PV1|1|O|${(encounter && encounter.location) || ''}`;

  const request = serviceRequest || (encounter && encounter.serviceRequest);
  let obr = null;
  if (request && request.code && Array.isArray(request.code.coding)) {
    const coding = request.code.coding.find(c => c.system === 'http://loinc.org');
    if (coding) {
      obr = `OBR|1|||${coding.code}^${coding.display || ''}^LN|||${timestamp}`;
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
