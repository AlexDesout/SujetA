const { generateAdtA04 } = require('../src/transformer');

describe('generateAdtA04 reliability segment', () => {
  it('adds ZID when patient.insReliability present', () => {
    const patient = { identifier:[{value:'ID1'}], name:[{family:'Dupont', given:['Jean']}], birthDate:'1980-01-01', gender:'M', insReliability: 'valid' };
    const adt = generateAdtA04(patient, {}, {name:'tester'});
    expect(adt).toMatch(/ZID\|valid/);
  });
});
