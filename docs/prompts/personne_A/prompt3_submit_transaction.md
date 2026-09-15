# Prompt 3 — Soumission du Bundle transactionnel

Original:
"Ajoute une fonction qui soumet le `Bundle` au serveur FHIR, lit la réponse `transaction-response`, traite `OperationOutcome` en cas d'erreur et renvoie les `Location` des ressources créées."

Amélioré / Final (à utiliser):
Écris la fonction `submit_transaction(bundle: dict, base_url: str='https://hapi.fhir.org/baseR4') -> dict` qui POSTe le `Bundle` (JSON) à l'URL de base, gère 200/201/4xx/5xx, parse la `transaction-response` pour collecter `Location` et `status` par entrée, détecte et journalise tout `OperationOutcome` (issue.severity, diagnostics) et lève une exception structurée en cas d'échec critique. Inclure tests mockés.


Prompt final:
Écris `async function submitTransaction(bundle, baseUrl = 'https://hapi.fhir.org/baseR4')` dans `src/fhirClient.js` : POSTe le bundle JSON à l'URL de base, parse la `transaction-response`, retourne un objet mappant `entryId -> { location, status }`, journalise tout `OperationOutcome` (issue.severity, diagnostics) et lance une erreur structurée en cas d'échec critique. Fournis tests `Jest`/`nock`.

Contexte CDC utile :
- Gérer deux types d'erreur technique indiqués dans le CDC : (T1) indisponibilité / HTTP 5xx / timeout, (T2) échec de la transaction (HTTP 400/422 + OperationOutcome). Dans les deux cas, ne pas générer de message ADT vers le SIL.
- La transaction doit retourner un `Bundle` `transaction-response` (HTTP 200) contenant les `Location` et `status` pour chaque entrée.
- Journaliser les `OperationOutcome.issue` (severity, diagnostics) pour audit COFRAC.

---

Claude-style prompt (standard):
```claude
Write an async function `submitTransaction(bundle, baseUrl = 'https://hapi.fhir.org/baseR4')` in `src/fhirClient.js`.
- POST the JSON `Bundle` to the FHIR base URL (transactional POST to base).
- Parse the `transaction-response` Bundle and return a mapping from each entry identifier to `{ location, status }`.
- Detect any `OperationOutcome` issues, log severity and diagnostics, and throw structured errors on critical failures.
```

Improved Claude-style prompt (amélioré):
```claude
Implement `async function submitTransaction(bundle, options = {})` in `src/fhirClient.js` where `options.baseUrl` defaults to `https://hapi.fhir.org/baseR4` and `options.timeoutMs` defaults to 10000.

Behavior:
- POST the `Bundle` JSON to `${baseUrl}` (not `/Bundle`) with `Content-Type: application/fhir+json`.
- On HTTP 200 parse the returned `Bundle` of `type=transaction-response`: for each response entry extract `response.location` and `response.status` and build a result map keyed by the request `fullUrl` or `urn:uuid` if present.
- For HTTP 4xx/422 where the body is an `OperationOutcome`, extract `issue[]` (severity, code, diagnostics), log them, and throw a custom `TransactionError` containing the `operationOutcome` and HTTP status.
- For transient errors (HTTP 5xx, network timeout) implement retry with exponential backoff; after retries fail, throw a `TransientError` and do NOT proceed with ADT generation.

Deliverables & tests:
- `src/fhirClient.js` with `submitTransaction` and structured error classes.
- `tests/submitTransaction.test.js` (Jest + nock) covering successful transaction, OperationOutcome failure, and transient 5xx retry exhaustion.
```

Ajout final (tests d'intégration):
Ajoutez un test d'intégration qui soumet un `Bundle` de test au serveur `HAPI_FHIR_BASE` (ou mock via `nock`) et vérifie le mapping entrée→Location/status ainsi que la journalisation `OperationOutcome` pour les erreurs; documentez l'exécution via `npm run test:integration`.
