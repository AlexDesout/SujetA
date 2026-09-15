# Prompt 1 — Génération du segment PID

Original:
"Donne-moi une fonction Node.js ou Python qui prend un `Patient` FHIR et retourne le segment `PID` HL7 v2.5.1 correctement formaté (PID-5 nom, PID-7 naissance YYYYMMDD, PID-3 identifiant INS+OID)."

Amélioré / Final (à utiliser):
Écris une fonction Python `build_pid_segment(patient: dict) -> str` qui prend une ressource `Patient` FHIR (dict) et renvoie un segment `PID|...` conforme v2.5.1 : format PID-5 `Family^Given^Second^...`, PID-7 `YYYYMMDD`, PID-3 avec sous-composants `id^^^authorityOID&oid&ISO^NI`. Gère noms multiples, absence de champs et échappement des caractères réservés. Ajoute tests unitaires.

- Mapping important : `Patient.identifier` (INS) → `PID-3` (composants : id, namespace/OID en PID-3-4, type en PID-3-5 `NI`).
- Statut de fiabilité de l'INS (validée / non validée) n'a pas de champ natif en v2.5.1 ; prévoir convention PID-32 (Identity Reliability Code) ou segment Z pour transmettre ce statut.
- Gérer l'encodage des noms (nom de naissance vs nom usuel) et la perte potentielle d'information signalée dans le CDC.
Prompt final:
Écris `buildPidSegment(patient)` (Node.js) qui prend un objet `Patient` FHIR et renvoie une chaîne `PID|...` conforme v2.5.1 : PID-5 `Family^Given^Second^...`, PID-7 `YYYYMMDD`, PID-3 avec sous-composants `id^^^authorityOID&oid&ISO^NI`. Gère noms multiples, absence de champs et échappement des caractères réservés. Fournis tests `Jest`.

Contexte CDC pertinent :
- Mapping important : `Patient.identifier` (INS) → `PID-3` (composants : id, namespace/OID en PID-3-4, type en PID-3-5 `NI`).
- Statut de fiabilité de l'INS (validée / non validée) n'a pas de champ natif en v2.5.1 ; prévoir convention PID-32 (Identity Reliability Code) ou segment Z pour transmettre ce statut.
- Gérer l'encodage des noms (nom de naissance vs nom usuel) et la perte potentielle d'information signalée dans le CDC.
- Mapping important : `Patient.identifier` (INS) → `PID-3` (composants : id, namespace/OID en PID-3-4, type en PID-3-5 `NI`).
- Statut de fiabilité de l'INS (validée / non validée) n'a pas de champ natif en v2.5.1 ; prévoir convention PID-32 (Identity Reliability Code) ou segment Z pour transmettre ce statut.
- Gérer l'encodage des noms (nom de naissance vs nom usuel) et la perte potentielle d'information signalée dans le CDC.

---

Claude-style prompt (standard):
```claude
Write a Node.js function `buildPidSegment(patient)` that takes a FHIR `Patient` object and returns a HL7 v2.5.1 `PID|...` segment string.
- PID-5: Family^Given^Second...
- PID-7: birthdate in YYYYMMDD
- PID-3: identifier with subcomponents id^^^authorityOID&oid&ISO^NI
```

Improved Claude-style prompt (amélioré):
```claude
Implement `buildPidSegment(patient)` in Node.js:
- Input: FHIR R4 `Patient` JSON object.
- Output: string containing a HL7 v2.5.1 `PID` segment (`PID|...`).

Rules:
- PID-5 should assemble `family^given^second` from `patient.name[0]` with proper escaping of HL7 reserved chars.
- PID-7 must be `patient.birthDate` formatted `YYYYMMDD` or empty if missing.
- PID-3: find identifier where `system` equals `urn:oid:1.2.250.1.213.1.4.8` (NIR) or fallback; format `id^^^authorityOID&oid&ISO^NI`.
- If INS reliability status exists in `extension` use PID-32 to convey it; otherwise leave empty and note in logs.

Deliverables:
- `src/transformer.js` with `buildPidSegment` exported.
- `tests/transformer.test.js` (Jest) covering normal, missing identifier, and names with special characters.
```

Ajout final (tests d'intégration):
Ajoutez des tests d'intégration vérifiant que `buildPidSegment` est utilisé dans la chaîne complète de génération ADT et que les segments PID produits sont parsables par le parseur HL7 JS; documentez `npm test` et `npm run test:integration`.
