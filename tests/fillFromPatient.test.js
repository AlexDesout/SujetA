/**
 * @jest-environment jsdom
 */

beforeEach(() => {
  document.body.innerHTML = `
    <form id="searchForm"></form>
    <input id="ins" />
    <div id="patientDetails"></div>
    <pre id="patientJson"></pre>
    <button id="fillFromSearch"></button>
    <button id="viewJson"></button>
    <input id="p_ins" />
    <input id="p_family" />
    <input id="p_given" />
    <input id="p_birth" />
    <input id="p_gender" />
    <input id="p_phone" />
    <input id="p_email" />
    <input id="p_address" />
    <div id="toast"></div>
    <form id="admissionForm"></form>
    <input id="encounter_id" />
    <input id="encounter_service" />
    <input id="author_name" />
    <pre id="hl7result"></pre>
    <a id="savedLink"></a>
    <button id="resetForm"></button>
    <button id="copyHl7"></button>
    <button id="downloadHl7"></button>
    <button id="openGit"></button>
    <button id="fillExample"></button>
    <header><div class="toolbar"><div></div><div></div></div></header>
  `;
});

test('window.fillFromPatient fills form fields and returns true', async () => {
  // mock fetch to return a Patient resource when searchForm is submitted
  global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({
    resourceType: 'Patient',
    identifier: [{ value: '12345' }],
    name: [{ family: 'Dupont', given: ['Jean'] }],
    birthDate: '1990-01-01',
    gender: 'male',
    telecom: [{ system: 'phone', value: '+33123456789' }, { system: 'email', value: 'jean@example.com' }],
    address: [{ line: ['1 rue Test'], city: 'Paris' }]
  }) }));

  require('../web/app.js');

  // trigger the searchForm submit handler which defines window.fillFromPatient
  const form = document.getElementById('searchForm');
  form.dispatchEvent(new Event('submit'));

  // wait for async handler to complete
  await new Promise(r => setTimeout(r, 0));

  const patient = {
    identifier: [{ value: '12345' }],
    name: [{ family: 'Dupont', given: ['Jean'] }],
    birthDate: '1990-01-01',
    gender: 'male',
    telecom: [{ system: 'phone', value: '+33123456789' }, { system: 'email', value: 'jean@example.com' }],
    address: [{ line: ['1 rue Test'], city: 'Paris' }]
  };

  const res = window.fillFromPatient(patient);
  expect(res).toBe(true);
  expect(document.getElementById('p_ins').value).toBe('12345');
  expect(document.getElementById('p_family').value).toBe('Dupont');
  expect(document.getElementById('p_given').value).toBe('Jean');
  expect(document.getElementById('p_birth').value).toBe('1990-01-01');
  expect(document.getElementById('p_gender').value).toBe('M');
  expect(document.getElementById('p_phone').value).toBe('+33123456789');
  expect(document.getElementById('p_email').value).toBe('jean@example.com');
  expect(document.getElementById('p_address').value).toContain('1 rue Test');
});
