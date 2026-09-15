# Prompt 4 — Tests unitaires pour le client FHIR

Original:
"Propose des tests unitaires (pytest) pour : recherche par INS retournant résultat, recherche vide, et soumission de transaction réussie (mocked responses)."

Amélioré / Final (à utiliser):
Fournis un fichier `tests/test_fhir_client.py` avec `pytest` couvrant : (a) `search_patient_by_ins` retourne dict quand `Bundle` contient un Patient (mock `requests.get`), (b) retourne `None` pour `total=0`, (c) `submit_transaction` gère `transaction-response` et extrait `Location` correctement, (d) cas d'`OperationOutcome` provoquant exception. Utilise `responses` ou `requests-mock` pour simuler HTTP.

- Scénarios Gherkin pertinents : création de patient, recherche par INS, création d'Encounter et ServiceRequest, transaction réussie, patient introuvable (`total=0`) et 404 sur GET /Patient/{id} retournant `OperationOutcome`.
- Utiliser des données fictives conformes (INS fictif, LOINC 58410-2) et logger les horodatages pour vérification de traçabilité.
Prompt final:
Crée `tests/fhirClient.test.js` (Jest) testant `searchPatientByIns` et `submitTransaction` avec HTTP mocké (`nock`).

Contexte CDC pour les tests :
- Scénarios Gherkin pertinents : création de patient, recherche par INS, création d'Encounter et ServiceRequest, transaction réussie, patient introuvable (`total=0`) et 404 sur GET /Patient/{id} retournant `OperationOutcome`.
- Utiliser des données fictives conformes (INS fictif, LOINC 58410-2) et logger les horodatages pour vérification de traçabilité.
- Scénarios Gherkin pertinents : création de patient, recherche par INS, création d'Encounter et ServiceRequest, transaction réussie, patient introuvable (`total=0`) et 404 sur GET /Patient/{id} retournant `OperationOutcome`.
- Utiliser des données fictives conformes (INS fictif, LOINC 58410-2) et logger les horodatages pour vérification de traçabilité.

---

Claude-style prompt (standard):
```claude
Create Jest tests `tests/fhirClient.test.js` that mock HTTP using `nock` to validate `searchPatientByIns` and `submitTransaction` behaviors: successful search, empty search (total=0), successful transaction-response parsing, and handling of OperationOutcome errors.
```

Improved Claude-style prompt (amélioré):
```claude
Provide `tests/fhirClient.test.js` (Jest + nock) containing:
- Test: `searchPatientByIns` returns patient object when mocked GET returns a Bundle with `total>0`.
- Test: `searchPatientByIns` returns `null` when mocked GET returns `Bundle` with `total=0`.
- Test: `submitTransaction` returns mapping of entry->location/status when transaction-response is returned.
- Test: `submitTransaction` throws `TransactionError` when mocked response is `OperationOutcome` (4xx/422) and logs issues.

Include fixtures (JSON) with fictitious INS and LOINC values, ensure tests assert logs capture ISO timestamps for COFRAC traceability. Document how to run tests: `npm install` then `npm test`.
```

Ajout final (tests d'intégration):
Ajoutez un script d'intégration qui exécute tous les tests (unit + integration) et un rapport sommaire; fournir la commande `npm run test:all` dans la documentation.
