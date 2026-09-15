const { buildPidSegment, generateAdtA04 } = require('../src/transformer');

describe('transformer', () => {
  it('builds a PID segment', () => {
    const patient = { identifier:[{value:'ID1'}], name:[{family:'Dupont', given:['Jean']}], birthDate:'1980-01-01', gender:'M' };
    const pid = buildPidSegment(patient);
    expect(pid).toContain('PID|1|ID1');
    expect(pid).toContain('Dupont^Jean');
  });

  it('generates ADT A04', () => {
    const patient = { identifier:[{system:'urn:oid:1.2.250.1.213.1.4.8', value:'1234567890123'}], name:[{family:'Dupont', given:['Jean']}], birthDate:'1980-01-01', gender:'male' };
    const adt = generateAdtA04(patient, { location: 'LBM' }, {name:'tester'}, { code: { coding: [{ system: 'http://loinc.org', code: '58410-2', display: 'CBC' }] } });
    expect(adt).toContain('MSH|');
    expect(adt).toContain('ADT^A04^ADT_A01');
    expect(adt).toContain('PID|1|1234567890123^^^INS-NIR&1.2.250.1.213.1.4.8&ISO^NI');
    expect(adt).toContain('PV1|1|O|LBM');
    expect(adt).toContain('OBR|1|||58410-2^CBC^LN');
    expect(adt).toContain('|19800101|M');
  });
});
