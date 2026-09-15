const { generateAdtA04 } = require('../src/transformer');

describe('hl7 transform', () => {
  it('ADT contains required segments', () => {
    const adt = generateAdtA04({ identifier:[{value:'ID1'}], name:[{family:'Dupont', given:['Jean']}], birthDate:'1980-01-01', gender:'M' }, {}, {name:'tester'});
    expect(adt.split('\r').length).toBeGreaterThanOrEqual(4);
    expect(adt).toMatch(/EVN\|A04/);
    expect(adt).toMatch(/PV1\|1\|O/);
    expect(adt).toMatch(/MSH\|.*\|ADT\^A04\^ADT_A01\|.*\|2\.5\.1/);
  });
});
