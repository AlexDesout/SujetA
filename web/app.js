document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const ins = document.getElementById('ins').value;
  const res = await fetch(`/api/patient?ins=${encodeURIComponent(ins)}`);
  const data = await res.json();
  document.getElementById('result').textContent = JSON.stringify(data, null, 2);
});

document.getElementById('admissionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    patient: {
      identifier: [{ system: 'urn:oid:1.2.250.1.213.1', value: document.getElementById('p_ins').value, type: { text: 'INS' } }],
      name: [{ family: document.getElementById('p_family').value, given: [document.getElementById('p_given').value] }],
      birthDate: document.getElementById('p_birth').value,
      gender: document.getElementById('p_gender').value,
      telecom: [],
      address: [{ line: [document.getElementById('p_address').value || ''] }]
    },
    encounter: { id: document.getElementById('encounter_id').value, service: document.getElementById('encounter_service').value },
    author: { name: document.getElementById('author_name').value }
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
