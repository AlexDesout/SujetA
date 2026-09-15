const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { searchPatientByIns, submitTransaction } = require('./fhirClient');
const { generateAdtA04 } = require('./transformer');
// Optional S3 upload (requires AWS credentials in env to be set)
let s3Client = null;
if (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  const AWS = require('aws-sdk');
  s3Client = new AWS.S3({ region: process.env.AWS_REGION || 'eu-west-1' });
}

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
    // Validate simple INS/NIR format (digits only, 13-15 chars)
    const insVal = (patient.identifier && patient.identifier[0] && patient.identifier[0].value) ? String(patient.identifier[0].value) : null;
    if (insVal && !/^[0-9]{13,15}$/.test(insVal)) {
      return res.status(400).json({ error: 'INS/NIR must be 13-15 digits' });
    }
    const hl7 = generateAdtA04(patient, encounter, author);

    // Sauvegarder le HL7 dans out/ avec horodatage
    const ins = insVal || 'noins';
    const ts = new Date().toISOString().replace(/[:.]/g, '');
    const filename = `adt_${ins}_${ts}.hl7`;
    const fullpath = path.join(OUT_DIR, filename);
    fs.writeFileSync(fullpath, hl7 + '\n');

    // Mettre à jour index.json et détecter duplicata récent
    const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    // duplicate if same ins and last entry within 60 seconds
    const lastSame = [...index].reverse().find(it => it.ins === ins);
    let duplicate = false;
    if (lastSame) {
      const lastTs = new Date(lastSame.timestamp).getTime();
      if ((Date.now() - lastTs) < 60 * 1000) duplicate = true;
    }

    const entry = { filename, ins, timestamp: new Date().toISOString(), author: (author && author.name) || 'unknown', duplicate };
    index.push(entry);
    fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));

    // Optional upload to S3
    if (s3Client) {
      (async () => {
        try {
          const bucket = process.env.AWS_S3_BUCKET;
          const body = fs.createReadStream(fullpath);
          await s3Client.upload({ Bucket: bucket, Key: filename, Body: body }).promise();
          entry.s3 = `s3://${process.env.AWS_S3_BUCKET}/${filename}`;
          fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
        } catch (e) {
          console.error('S3 upload failed', e.message);
        }
      })();
    }

    res.json({ hl7, savedFilename: filename, duplicate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

module.exports = app;
