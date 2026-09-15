document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const ins = document.getElementById('ins').value;
  const res = await fetch(`/api/patient?ins=${encodeURIComponent(ins)}`);
  const data = await res.json();

  // Normalize: find Patient resource inside bundle or accept patient resource
  let patient = null;
  if (data && data.resourceType === 'Bundle' && Array.isArray(data.entry)) {
    for (const e of data.entry) {
      if (e.resource && e.resource.resourceType === 'Patient') { patient = e.resource; break; }
    }
  } else if (data && data.resourceType === 'Patient') {
    patient = data;
  }

  const details = document.getElementById('patientDetails');
  const jsonPre = document.getElementById('patientJson');
  const fillBtn = document.getElementById('fillFromSearch');
  if (!patient) {
    details.textContent = 'Aucun patient trouvé.';
    jsonPre.style.display = 'none';
    fillBtn.style.display = 'none';
    return;
  }

  // Build display
  const id = (patient.identifier && patient.identifier[0] && patient.identifier[0].value) || '';
  const family = (patient.name && patient.name[0] && patient.name[0].family) || '';
  const given = (patient.name && patient.name[0] && patient.name[0].given) ? patient.name[0].given.join(' ') : '';
  const dob = patient.birthDate || '';
  const gender = patient.gender || '';
  const reliability = (patient.extension || []).find(extension => extension.url && extension.url.includes('ins-reliability'));
  const insStatus = (reliability && (reliability.valueCode || reliability.valueString)) || 'non renseigné';
  const addr = (patient.address && patient.address[0]) ? [ (patient.address[0].line || []).join(' '), patient.address[0].city, patient.address[0].postalCode ].filter(Boolean).join(', ') : '';
  const telecom = (patient.telecom || []).map(t => `${t.system}:${t.value}`).join(' | ');

  details.innerHTML = `
    <div><strong>${family} ${given}</strong></div>
    <div><small>INS: ${id}</small></div>
    <div><small>Statut INS: ${insStatus}</small></div>
    <div><small>Né(e): ${dob} — ${gender}</small></div>
    <div><small>Adresse: ${addr}</small></div>
    <div><small>Contacts: ${telecom}</small></div>
  `;

  jsonPre.textContent = JSON.stringify(patient, null, 2);
  jsonPre.style.display = 'none';
  fillBtn.style.display = 'inline-block';

  // Wire fill button
  fillBtn.onclick = () => {
    document.getElementById('p_ins').value = id;
    document.getElementById('p_family').value = family;
    document.getElementById('p_given').value = given;
    if (dob) document.getElementById('p_birth').value = dob;
    if (gender) document.getElementById('p_gender').value = (gender==='female'||gender==='F'||gender==='f') ? 'female' : (gender==='male'||gender==='M'||gender==='m') ? 'male' : 'other';
    document.getElementById('p_phone').value = (patient.telecom && patient.telecom.find(t=>t.system==='phone')) ? patient.telecom.find(t=>t.system==='phone').value : '';
    document.getElementById('p_email').value = (patient.telecom && patient.telecom.find(t=>t.system==='email')) ? patient.telecom.find(t=>t.system==='email').value : '';
    if (patient.address && patient.address[0]) document.getElementById('p_address').value = (patient.address[0].line || []).join(' ')+ (patient.address[0].city? ', '+patient.address[0].city : '');
    document.getElementById('toast').textContent = 'Formulaire rempli à partir de la recherche';
    // highlight changed fields
    const changed = ['p_ins','p_family','p_given','p_birth','p_gender','p_phone','p_email','p_address'];
    for(const cid of changed){
      const el = document.getElementById(cid);
      if(!el) continue;
      el.classList.remove('field-highlight');
      // trigger reflow to restart animation
      void el.offsetWidth;
      el.classList.add('field-highlight');
    }
    document.getElementById('toast').classList.add('show'); setTimeout(()=>document.getElementById('toast').classList.remove('show'),1500);
  };

  // Wire view JSON toggle
  document.getElementById('viewJson').onclick = ()=>{
    if (jsonPre.style.display==='none') jsonPre.style.display='block'; else jsonPre.style.display='none';
  };

  // Expose helper for console testing: window.fillFromPatient(patient)
  window.fillFromPatient = function(p){
    try{
      const patientObj = p;
      const id = (patientObj.identifier && patientObj.identifier[0] && patientObj.identifier[0].value) || '';
      const family = (patientObj.name && patientObj.name[0] && patientObj.name[0].family) || '';
      const given = (patientObj.name && patientObj.name[0] && patientObj.name[0].given) ? patientObj.name[0].given.join(' ') : '';
      const dob = patientObj.birthDate || '';
      const gender = patientObj.gender || '';
      document.getElementById('p_ins').value = id;
      document.getElementById('p_family').value = family;
      document.getElementById('p_given').value = given;
      if(dob) document.getElementById('p_birth').value = dob;
      if(gender) document.getElementById('p_gender').value = (gender==='female'||gender==='F'||gender==='f') ? 'female' : (gender==='male'||gender==='M'||gender==='m') ? 'male' : 'other';
      document.getElementById('p_phone').value = (patientObj.telecom && patientObj.telecom.find(t=>t.system==='phone')) ? patientObj.telecom.find(t=>t.system==='phone').value : '';
      document.getElementById('p_email').value = (patientObj.telecom && patientObj.telecom.find(t=>t.system==='email')) ? patientObj.telecom.find(t=>t.system==='email').value : '';
      if (patientObj.address && patientObj.address[0]) document.getElementById('p_address').value = (patientObj.address[0].line || []).join(' ')+ (patientObj.address[0].city? ', '+patientObj.address[0].city : '');
      // add highlight
      const changed = ['p_ins','p_family','p_given','p_birth','p_gender','p_phone','p_email','p_address'];
      for(const cid of changed){
        const el = document.getElementById(cid);
        if(!el) continue; el.classList.remove('field-highlight'); void el.offsetWidth; el.classList.add('field-highlight');
      }
      return true;
    }catch(e){console.error('fillFromPatient error', e); return false}
  };
});

document.getElementById('admissionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    patient: {
      identifier: [{ system: 'urn:oid:1.2.250.1.213.1.4.8', value: document.getElementById('p_ins').value, type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'NI' }], text: 'INS-NIR' } }],
      name: [{ family: document.getElementById('p_family').value, given: [document.getElementById('p_given').value] }],
      birthDate: document.getElementById('p_birth').value,
      gender: document.getElementById('p_gender').value,
      extension: [{ url: 'https://example.org/fhir/StructureDefinition/ins-reliability', valueCode: document.getElementById('p_ins_status').value }],
      telecom: [],
      address: [{ line: [document.getElementById('p_address').value || ''] }]
    },
    encounter: { id: document.getElementById('encounter_id').value, service: document.getElementById('encounter_service').value },
    author: { name: document.getElementById('author_name').value },
    identityConfirmed: document.getElementById('identity_confirmed').checked,
    serviceRequest: {
      status: 'active',
      intent: 'order',
      code: {
        coding: [{ system: 'http://loinc.org', code: '58410-2', display: 'CBC panel - Blood by Automated count' }],
        text: 'NFS'
      },
      requester: {
        display: document.getElementById('prescriber_name').value,
        identifier: document.getElementById('prescriber_rpps').value ? { system: 'urn:oid:1.2.250.1.71.4.2.1', value: document.getElementById('prescriber_rpps').value } : undefined
      },
      authoredOn: document.getElementById('prescription_date').value
    }
  };
  const phone = document.getElementById('p_phone').value;
  const email = document.getElementById('p_email').value;
  if (phone) body.patient.telecom.push({ system: 'phone', value: phone, use: 'mobile' });
  if (email) body.patient.telecom.push({ system: 'email', value: email, use: 'home' });

  const res = await fetch('/api/admission', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json();
    const hl7 = data.hl7 || JSON.stringify(data, null, 2);
    document.getElementById('hl7result').textContent = hl7;
    document.getElementById('toast').classList.add('show');
    setTimeout(()=>document.getElementById('toast').classList.remove('show'),1500);
  // Show saved file link if server returned filename
  if (data.savedFilename) {
    const a = document.getElementById('savedLink');
    a.href = `/out/${data.savedFilename}`;
    a.style.display = 'inline-block';
    a.textContent = `Télécharger ${data.savedFilename}`;
  }
});

  document.getElementById('resetForm').addEventListener('click', ()=>{
    document.getElementById('admissionForm').reset();
    document.getElementById('hl7result').textContent='(aucun message)';
  });

  document.getElementById('copyHl7').addEventListener('click', async ()=>{
    const txt = document.getElementById('hl7result').textContent;
    try{ await navigator.clipboard.writeText(txt); document.getElementById('toast').classList.add('show'); setTimeout(()=>document.getElementById('toast').classList.remove('show'),1500);}catch(e){alert('Impossible de copier');}
  });

  document.getElementById('downloadHl7').addEventListener('click', ()=>{
    const txt = document.getElementById('hl7result').textContent;
    const blob = new Blob([txt], {type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='adt.hl7'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  document.getElementById('openGit').addEventListener('click', ()=>{
    window.open('https://github.com/AlexDesout/SujetA','_blank');
  });

  // Admin page quick-open
  const openAdminBtn = document.createElement('button');
  openAdminBtn.textContent = 'Administration';
  openAdminBtn.className = 'secondary';
  openAdminBtn.style.marginLeft = '8px';
  openAdminBtn.addEventListener('click', ()=> window.open('/admin.html','_blank'));
  document.querySelector('header .toolbar div:last-child').appendChild(openAdminBtn);

  // Fill example patient for quicker data entry
  document.getElementById('fillExample').addEventListener('click', ()=>{
    document.getElementById('p_ins').value='285033155504217';
    document.getElementById('p_family').value='Bernard';
    document.getElementById('p_given').value='Claire';
    document.getElementById('p_birth').value='1985-07-20';
    document.getElementById('p_gender').value='female';
    document.getElementById('p_ins_status').value='qualified';
    document.getElementById('p_phone').value='+33611223344';
    document.getElementById('p_email').value='claire.bernard@example.com';
    document.getElementById('p_address').value='12 rue de Test, Paris';
    document.getElementById('encounter_id').value='enc-042';
    document.getElementById('encounter_service').value='Consultation';
    document.getElementById('author_name').value='Secrétaire';
    document.getElementById('prescriber_name').value='Dr Martin';
    document.getElementById('prescriber_rpps').value='801234567';
    document.getElementById('prescription_date').value='2026-09-15';
    document.getElementById('identity_confirmed').checked=true;
  });

  // Simple client-side validation with friendly focus
  document.getElementById('admissionForm').addEventListener('submit', (e)=>{
    const required = ['p_family','p_given','p_birth'];
    for(const id of required){
      const el = document.getElementById(id);
      if(!el.value){
        e.preventDefault();
        el.focus();
        document.getElementById('toast').textContent = 'Merci de remplir les champs obligatoires.';
        document.getElementById('toast').classList.add('show');
        setTimeout(()=>document.getElementById('toast').classList.remove('show'),2000);
        return false;
      }
    }
    return true;
  });
