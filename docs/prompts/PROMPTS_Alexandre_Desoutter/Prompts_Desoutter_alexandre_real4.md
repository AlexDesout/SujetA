# Prompt 4 — Tests de transformation HL7

Original:
"Fournis des tests qui valident la structure HL7 v2 via un parseur (ex. `hl7apy` ou `hapi`), couvrant message valide et cas de champ manquant."

Amélioré / Final (à utiliser):
Crée `tests/test_hl7_transform.py` utilisant `hl7apy` pour : (a) parser le message ADT^A04 généré et vérifier la présence/valeur de MSH-9, PID-5, PID-3 et PV1-2, (b) cas où `Patient.identifier` est absent → vérifier comportement attendu (erreur explicite ou champ vide), (c) cas avec `ServiceRequest` → présence d'OBR. Fournis fixtures d'entrée FHIR et exemples attendus.

- Couvrir les pertes d'information documentées (statut INS non natif en v2 → vérifier PID-32 ou segment Z), et la réduction de `Encounter.class` (`AMB` → PV1-2 `O`).
- Utiliser fixtures avec INS fictif et prouver la conformité structurelle via `hl7apy` ou un parseur HL7 v2.

---

Claude-style prompt (standard):
```claude
Create Jest tests `tests/hl7Transform.test.js` that parse the generated ADT^A04 message using a JS HL7 parser and assert presence/values of MSH-9, PID-5, PID-3, PV1-2, and OBR when applicable.
```

Improved Claude-style prompt (amélioré):
```claude
Provide `tests/hl7Transform.test.js` (Jest) which:
- Uses fixtures: FHIR Patient, Encounter, ServiceRequest (with fictitious INS and LOINC).
- Generates ADT^A04 using `generateAdtA04` and parses it with a JS HL7 parser (`hl7` or `hl7-standard`).
- Asserts: MSH-9 == 'ADT^A04^ADT_A01', PID-5 matches patient name, PID-3 contains INS and OID, PV1-2 == 'O'.
- When ServiceRequest is present assert OBR exists and OBR-4 contains LOINC '58410-2'.
- Add test for missing identifier: generator should either leave PID-3 empty or throw a clear error; assert expected behavior.
```

Ajout final (tests d'intégration):
Ajouter une tâche d'intégration qui exécute la suite HL7 et signale un rapport de conformité; documenter l'exécution via `npm run test:integration`.
Prompt final:
Fais `tests/hl7Transform.test.js` (Jest) en Node.js utilisant un parseur HL7 JS (`hl7` ou `hl7-standard`) avec fixtures FHIR et assertions sur MSH/PID/PV1/OBR.

Contexte CDC pour les tests :
- Couvrir les pertes d'information documentées (statut INS non natif en v2 → vérifier PID-32 ou segment Z), et la réduction de `Encounter.class` (`AMB` → PV1-2 `O`).
- Utiliser fixtures avec INS fictif et prouver la conformité structurelle via un parseur HL7 JS.
- Couvrir les pertes d'information documentées (statut INS non natif en v2 → vérifier PID-32 ou segment Z), et la réduction de `Encounter.class` (`AMB` → PV1-2 `O`).
- Utiliser fixtures avec INS fictif et prouver la conformité structurelle via `hl7apy` ou un parseur HL7 v2.
