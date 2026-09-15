# Prompt 2 — Exemple de Bundle transactionnel

Original:
"Génère un exemple de `Bundle` transactionnel en JSON (Patient, Encounter class=AMB, ServiceRequest avec LOINC 58410-2) en utilisant des `urn:uuid:` pour les références internes."

Amélioré / Final (à utiliser):
Fournis un fichier JSON `bundle_example.json` représentant un `Bundle` FHIR `type=transaction` contenant : 1) un `Patient` avec `identifier` INS (OID 1.2.250.1.213.1.4.8), 2) un `Encounter` (`class.code='AMB'`) référant le Patient via `urn:uuid:...`, 3) un `ServiceRequest` avec `code` LOINC `58410-2` lié à l'Encounter et au Patient. Utilise `urn:uuid:` cohérents, ajoute `request.method`/`request.url` pour chaque entrée, et un exemple de payload minimal valide R4.


Prompt final:
Fournis `bundle_example.json` (Bundle type=transaction) avec `Patient`, `Encounter(class=AMB)` et `ServiceRequest(code=58410-2)`, références `urn:uuid:`, et `request.method`/`request.url` pour chaque entrée. Indique aussi comment ce JSON sera consommé par `src/fhirClient.js` (POST transactionnel).

Contexte CDC utile :
- Le Bundle doit garantir l'atomicité (POST sur la base `https://hapi.fhir.org/baseR4`).
- Ressources minimales : `Patient` (avec INS), `Encounter` (`class=AMB` pour ambulatoire), `ServiceRequest` (`code` LOINC `58410-2` ou `57021-8` suivant arbitrage métier).
- Utiliser `urn:uuid:` pour références internes et prévoir `If-None-Exist` si création conditionnelle pour éviter doublons.

---

Claude-style prompt (standard):
```claude
Provide a JSON file `bundle_example.json` representing a FHIR `Bundle` of type `transaction` that contains three entries: a `Patient` (with INS identifier `urn:oid:1.2.250.1.213.1.4.8`), an `Encounter` with `class.code='AMB'` referencing the Patient via `urn:uuid:...`, and a `ServiceRequest` with LOINC code `58410-2` linked to the Encounter and Patient. Include `request.method` and `request.url` for each entry.
```

Improved Claude-style prompt (amélioré):
```claude
Create `bundle_example.json` (FHIR R4, `Bundle.type=transaction`) with three entries:
- Entry 1: `Patient` resource with `identifier.system='urn:oid:1.2.250.1.213.1.4.8'` and a fictitious INS value.
- Entry 2: `Encounter` resource (`class.code='AMB'`, system `http://terminology.hl7.org/CodeSystem/v3-ActCode`) referencing the Patient via `"reference":"urn:uuid:..."`.
- Entry 3: `ServiceRequest` resource with `code.coding[0].system='http://loinc.org'` and `code.coding[0].code='58410-2'`, referencing both the Patient and the Encounter.

For each entry include `request.method` (POST) and `request.url` (e.g. `Patient`, `Encounter`, `ServiceRequest`). Use consistent `urn:uuid:` values and include minimal required fields to pass a basic FHIR R4 structural validation. Comment how `src/fhirClient.js` should POST this JSON to `${baseUrl}` and parse the `transaction-response`.
```

Ajout final (tests d'intégration):
Ajoutez des tests qui valident que `bundle_example.json` peut être soumis par `src/fhirClient.js` et que la `transaction-response` est correctement analysée; documentez les commandes `npm run test:integration`.
