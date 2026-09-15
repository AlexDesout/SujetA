# Prompt 1 — Recherche Patient par INS

Original:
"Écris un client Python minimal pour interroger `https://hapi.fhir.org/baseR4` et rechercher un Patient par `identifier=urn:oid:1.2.250.1.213.1.4.8|{nir}`. Gère timeout et erreurs, et renvoie `None` si aucun résultat."

Amélioré / Final (à utiliser):
Écris un module Python `fhir_client.py` exposant une fonction `search_patient_by_ins(nir: str, base_url: str = 'https://hapi.fhir.org/baseR4') -> dict | None`. Utilise `requests` avec timeout (5s) et retries exponentiels (max 3), logge les appels (méthode, URL, code HTTP), gère `OperationOutcome` renvoyé par le serveur, retourne la première ressource `Patient` du `Bundle` ou `None` si `total=0`. Ajoute type hints et tests `pytest` (mock HTTP).


Prompt final:
Écris un module Node.js `src/fhirClient.js` exportant une fonction asynchrone `searchPatientByIns(nir, baseUrl = 'https://hapi.fhir.org/baseR4')` utilisant `axios` ou `node-fetch` avec timeout 5s et retries exponentiels (max 3). Logge les appels (méthode, URL, code HTTP), gère `OperationOutcome` renvoyé par le serveur, et retourne la première ressource `Patient` du `Bundle` ou `null` si `total=0`. Fournis tests avec `Jest` et `nock` (mocks HTTP).

Contexte extrait du cahier des charges (à intégrer dans la mise en œuvre) :
- Serveur de test recommandé : `https://hapi.fhir.org/baseR4` (FHIR R4).
- Ressource pivot : `Patient` (INS = `urn:oid:1.2.250.1.213.1.4.8` pour NIR, `...1.4.9` pour NIA).
- Comportement attendu : une recherche par `identifier` retourne un `Bundle` `searchset` (HTTP 200). Si `total = 0`, le front doit afficher le scénario « patient introuvable » (procédure d'identitovigilance).
- Exigences non fonctionnelles : journaliser les requêtes (méthode, URL, code HTTP), conserver les traces horodatées (COFRAC), ne pas exposer de données réelles (données fictives pour démo), et préparer l'usage d'un validateur FHIR (HAPI FHIR Validator) pour les payloads.

---

Claude-style prompt (standard):
```claude
Write a Node.js module `src/fhirClient.js` that exports an async function `searchPatientByIns(nir, baseUrl = 'https://hapi.fhir.org/baseR4')`.
- Use `axios` or `node-fetch` with a 5s timeout and exponential backoff retries (max 3).
- Perform GET on `${baseUrl}/Patient?identifier=urn:oid:1.2.250.1.213.1.4.8|${nir}` and parse the JSON `Bundle` response.
- If `total === 0` return `null`; otherwise return the first `Patient` resource object.
- Log method, URL and HTTP status; handle `OperationOutcome` payloads and throw structured errors for HTTP 4xx/5xx.
- Include Jest tests using `nock` to mock HTTP responses.
```

Improved Claude-style prompt (amélioré):
```claude
Create a Node.js file `src/fhirClient.js` exporting:
- `async function searchPatientByIns(nir, options = {})` where `options.baseUrl` defaults to `https://hapi.fhir.org/baseR4` and `options.timeoutMs` defaults to 5000.

Requirements:
- Use `axios` (or `node-fetch`) and implement exponential backoff retries (initial delay 200ms, factor 2, max 3 attempts).
- Request URL: `${baseUrl}/Patient?identifier=urn:oid:1.2.250.1.213.1.4.8|${nir}`.
- On HTTP 200 parse JSON: if `bundle.total === 0` return `null`; else return `bundle.entry[0].resource`.
- If server returns `OperationOutcome` (4xx/5xx), log `issue.severity` and `issue.diagnostics` and throw a structured Error containing `status` and `operationOutcome`.
- Log each request with ISO8601 timestamp, method, URL and status code for COFRAC traceability; do not log full PHI.

Deliverables:
- `src/fhirClient.js` implementation
- `tests/fhirClient.test.js` (Jest + nock): tests for successful search, empty search, and OperationOutcome error.

Constraints:
- Use only fictitious INS values in tests; make base URL configurable via env `HAPI_FHIR_BASE`.
```

Ajout final (tests d'intégration):
Veuillez aussi créer des tests d'intégration et E2E qui vérifient le fonctionnement bout-à-bout du module (unit tests + tests contre `HAPI_FHIR_BASE`), et documenter les commandes pour exécuter les tests (`npm test`, `npm run test:integration`).
