async function loadIndex(){
  const res = await fetch('/out/index');
  const data = await res.json();
  const tbody = document.querySelector('#list tbody');
  tbody.innerHTML='';
  const insFilter = document.getElementById('filterIns').value.trim();
  const authorFilter = document.getElementById('filterAuthor').value.trim();
  const dupFilter = document.getElementById('filterDup').value;
  for(const it of data.slice().reverse()){
    if (insFilter && !it.ins.includes(insFilter)) continue;
    if (authorFilter && !it.author.toLowerCase().includes(authorFilter.toLowerCase())) continue;
    if (dupFilter!=='any' && String(it.duplicate)!==dupFilter) continue;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><a href="/out/${it.filename}" target="_blank">${it.filename}</a></td><td>${it.ins}</td><td>${it.author}</td><td>${it.timestamp}</td><td><button data-file="${it.filename}" class="download">Télécharger</button></td>`;
    tbody.appendChild(tr);
  }
  document.querySelectorAll('.download').forEach(b=>b.addEventListener('click', (e)=>{ const f=e.target.dataset.file; window.open('/out/'+f,'_blank'); }));
}

document.getElementById('refresh').addEventListener('click', loadIndex);
window.addEventListener('load', loadIndex);
