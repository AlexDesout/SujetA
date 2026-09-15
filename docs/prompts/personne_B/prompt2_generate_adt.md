# Prompt 2 — Génération complète ADT^A04

Original:
"Écris la génération complète d'un message ADT^A04 (MSH, EVN, PID, PV1) à partir de `Patient` + `Encounter`, avec `MSH-9 = ADT^A04^ADT_A01` et `PV1-2 = O`."

Amélioré / Final (à utiliser):
Fournis une fonction `generate_adt_a04(patient: dict, encounter: dict, author: dict) -> str` qui compose un message HL7 v2.5.1 complet avec : MSH (timestamp, sending/receiving app/inst), EVN (A04+timestamp+author), PID (via `build_pid_segment`), PV1 (classe `O`), et retourne le message texte. Documente les conventions pour PID-3 (INS) et PID-32 (Identity Reliability if used). Fournis tests pour parser via `hl7apy`.

- Message cible : `ADT^A04` version v2.5.1 avec segments obligatoires `MSH, EVN, PID, PV1` (PV1-2 = `O` pour outpatient).
- MSH-9 doit être `ADT^A04^ADT_A01`, MSH-12 `2.5.1`.
- Traçabilité : inclure auteur (agent d'accueil) et horodatage dans `EVN` et/ou `MSH` conformément aux exigences COFRAC.
Prompt final:
Écris `generateAdtA04(patient, encounter, author)` (Node.js) générant un ADT^A04 v2.5.1 testable avec un parseur JS (`hl7` ou `hl7-standard`), et documente conventions PID-3/PID-32.

Contexte CDC utile :
- Message cible : `ADT^A04` version v2.5.1 avec segments obligatoires `MSH, EVN, PID, PV1` (PV1-2 = `O` pour outpatient).
- MSH-9 doit être `ADT^A04^ADT_A01`, MSH-12 `2.5.1`.
- Traçabilité : inclure auteur (agent d'accueil) et horodatage dans `EVN` et/ou `MSH` conformément aux exigences COFRAC.
- Message cible : `ADT^A04` version v2.5.1 avec segments obligatoires `MSH, EVN, PID, PV1` (PV1-2 = `O` pour outpatient).
- MSH-9 doit être `ADT^A04^ADT_A01`, MSH-12 `2.5.1`.
- Traçabilité : inclure auteur (agent d'accueil) et horodatage dans `EVN` et/ou `MSH` conformément aux exigences COFRAC.

---

Claude-style prompt (standard):
```claude
Produce a Node.js function `generateAdtA04(patient, encounter, author)` that composes a HL7 v2.5.1 ADT^A04 message with MSH, EVN, PID, PV1 segments. Ensure MSH-9 = 'ADT^A04^ADT_A01' and PV1-2 = 'O'.
```

Improved Claude-style prompt (amélioré):
```claude
Implement `generateAdtA04(patient, encounter, author)` in Node.js (file `src/transformer.js`):
- Build MSH segment with sendingApp, sendingFacility, receivingApp, receivingFacility, current timestamp, MSH-9=`ADT^A04^ADT_A01`, MSH-12=`2.5.1`.
- Build EVN segment with event type `A04`, timestamp and `author` identifier (agent login or id).
- Use `buildPidSegment(patient)` to construct PID.
- Build PV1 with PV1-2 = `O` and include location/department placeholders.
- Optionally include PID-32 for identity reliability when available in `patient` extensions.

Requirements:
- Return full HL7 message as a text string with CR separators.
- Provide a small example and unit tests `tests/hl7Transform.test.js` (Jest) that parse the generated message with an HL7 JS parser and assert MSH-9, PID-5, PID-3 and PV1-2 values.
```

Ajout final (tests d'intégration):
Ajouter un test d'intégration qui génère un ADT^A04 complet et le valide via un parseur HL7 JS, puis exécuter ce test dans la suite d'intégration `npm run test:integration`.
