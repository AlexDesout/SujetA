const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { searchPatientByIns, submitTransaction } = require('./fhirClient');
const { generateAdtA04 } = require('./transformer');

const app = express();
app.use(bodyParser.json());
// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '..', 'web')));

// Préparer dossier de sortie pour HL7
const OUT_DIR = path.join(__dirname, '..', 'out');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const INDEX_FILE = path.join(OUT_DIR, 'index.json');
if (!fs.existsSync(INDEX_FILE)) fs.writeFileSync(INDEX_FILE, JSON.stringify([]));
// Servir les fichiers HL7 et l'index
app.use('/out', express.static(OUT_DIR));
app.get('/out/index', (req, res) => {
  const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  res.json(data);
});

app.get('/api/patient', async (req, res) => {
  try {
    const { ins } = req.query;
    const data = await searchPatientByIns(ins);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admission', async (req, res) => {
  try {
    const { patient, encounter, author } = req.body;
    // Basic server-side validation
    if (!patient || !patient.name || !patient.name[0] || !patient.name[0].family) {
      return res.status(400).json({ error: 'Patient name (family) is required' });
    }
    const hl7 = generateAdtA04(patient, encounter, author);

    // Sauvegarder le HL7 dans out/ avec horodatage
    const ins = (patient.identifier && patient.identifier[0] && patient.identifier[0].value) ? patient.identifier[0].value : 'noins';
    const ts = new Date().toISOString().replace(/[:.]/g, '');
    const filename = `adt_${ins}_${ts}.hl7`;
    const fullpath = path.join(OUT_DIR, filename);
    fs.writeFileSync(fullpath, hl7 + '\n');

    // Mettre à jour index.json
    const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    index.push({ filename, ins, timestamp: new Date().toISOString(), author: (author && author.name) || 'unknown' });
    fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));

    res.json({ hl7, savedFilename: filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

module.exports = app;
