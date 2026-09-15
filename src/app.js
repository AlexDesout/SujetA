const express = require('express');
const bodyParser = require('body-parser');
const { searchPatientByIns, submitTransaction } = require('./fhirClient');
const { generateAdtA04 } = require('./transformer');

const app = express();
app.use(bodyParser.json());

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
    const hl7 = generateAdtA04(patient, encounter, author);
    // In a real system we'd send/emit this to an HL7 sink. For now return it.
    res.json({ hl7 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

module.exports = app;
