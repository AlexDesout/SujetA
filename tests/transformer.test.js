const { buildPidSegment, generateAdtA04 } = require('../src/transformer');

describe('transformer', () => {
  it('builds a PID segment', () => {
    const patient = { identifier:[{value:'ID1'}], name:[{family:'Dupont', given:['Jean']}], birthDate:'1980-01-01', gender:'M' };
    const pid = buildPidSegment(patient);
    expect(pid).toContain('PID|1|ID1');
    expect(pid).toContain('Dupont^Jean');
  });

  it('generates ADT A04', () => {
    const adt = generateAdtA04({ identifier:[{value:'ID1'}], name:[{family:'Dupont', given:['Jean']}], birthDate:'1980-01-01', gender:'M' }, {}, {name:'tester'});
    expect(adt).toContain('MSH|');
    expect(adt).toContain('PID|1|ID1');
  });
});
