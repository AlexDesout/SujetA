function buildPidSegment(patient) {
  const id = (patient && patient.identifier && patient.identifier[0]) ? patient.identifier[0].value : '';
  const family = (patient && patient.name && patient.name[0] && patient.name[0].family) || '';
  const given = (patient && patient.name && patient.name[0] && patient.name[0].given) ? patient.name[0].given.join(' ') : '';
  const dob = (patient && patient.birthDate) || '';
  const sex = (patient && patient.gender) || '';

  // Simple PID v2 string builder (not a full HL7 generator)
  const pid = `PID|1|${id}||${family}^${given}||${dob}|${sex}`;
  return pid;
}

function generateAdtA04(patient, encounter = {}, author = {}) {
  const pid = buildPidSegment(patient);
  const msh = 'MSH|^~\\&|ADT_SYSTEM|HOSPITAL|DEST|LAB|'+ new Date().toISOString() +'||ADT^A04|MSG00001|P|2.5.1';
  const evn = `EVN|A04|${new Date().toISOString()}|${author.name || 'system'}`;
  return [msh, evn, pid].join('\r');
}

module.exports = { buildPidSegment, generateAdtA04 };
