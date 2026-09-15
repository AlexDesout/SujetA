document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const ins = document.getElementById('ins').value;
  const res = await fetch(`/api/patient?ins=${encodeURIComponent(ins)}`);
  const data = await res.json();
  document.getElementById('result').textContent = JSON.stringify(data, null, 2);
});
