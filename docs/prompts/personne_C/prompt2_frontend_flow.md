# Prompt 2 — Flux frontend ↔ backend

Original:
"Écris le flux frontend qui appelle l'API backend (Personne A) pour rechercher un patient et affiche le statut INS et un contrôle visuel avant validation."

Amélioré / Final (à utiliser):
Fournis `web/app.js` avec fonctions : `searchPatient()` qui POSTe/GETe vers l'API backend, `renderPatient()` qui affiche `name`, `birthDate`, `insStatus` (validé/non validé) et un checkbox 'Identité contrôlée'. La validation n'enverra l'admission que si la checkbox est cochée et que l'examen + prescripteur sont remplis. Gère états de chargement et erreurs réseau.

- L'agent doit confirmer visuellement l'identité (checkbox) avant que l'admission soit envoyée au backend ; la validation est bloquée si l'ordonnance est manquante ou illisible.
- Le frontend doit logguer l'auteur de l'action (agent id) et l'horodatage local pour compléter la traçabilité côté système.
- Prévoir des indications claires pour l'escalade vers le biologiste médical si le statut INS est non validé ou en cas de doute.
Prompt final:
Écris `web/app.js` implémentant `searchPatient()` et `renderPatient()` avec vérification `insStatus` et contrôles de validation avant envoi vers une API Node.js (`/api`).

Contexte CDC pour le flux :
- L'agent doit confirmer visuellement l'identité (checkbox) avant que l'admission soit envoyée au backend ; la validation est bloquée si l'ordonnance est manquante ou illisible.
- Le frontend doit logguer l'auteur de l'action (agent id) et l'horodatage local pour compléter la traçabilité côté système.
- Prévoir des indications claires pour l'escalade vers le biologiste médical si le statut INS est non validé ou en cas de doute.
- L'agent doit confirmer visuellement l'identité (checkbox) avant que l'admission soit envoyée au backend ; la validation est bloquée si l'ordonnance est manquante ou illisible.
- Le frontend doit logguer l'auteur de l'action (agent id) et l'horodatage local pour compléter la traçabilité côté système.
- Prévoir des indications claires pour l'escalade vers le biologiste médical si le statut INS est non validé ou en cas de doute.

---

Claude-style prompt (standard):
```claude
Implement `web/app.js` functions `searchPatient()` and `renderPatient()` that call a Node.js backend `/api` endpoints, display patient and insStatus, and require an 'identity verified' checkbox before admission submission.
```

Improved Claude-style prompt (amélioré):
```claude
Write `web/app.js` implementing:
- `async function searchPatient(params)` which calls `GET /api/patient?family=...&given=...&birthDate=...` and handles 200/empty results and network errors.
- `function renderPatient(patient)` that displays `name`, `birthDate`, `insStatus` and a checkbox `identityVerified`.
- Client-side validation that prevents POST `/api/admission` unless `identityVerified` is checked and prescription fields (exam + prescriber) are filled.
- Attach `agentId` and `clientTimestamp` (ISO8601) to the admission payload for traceability; do not include raw INS in client logs.

Include user-facing messages for escalade to biologist when `insStatus` is non-validated or when identity mismatch is suspected.
```

Ajout final (tests d'intégration):
Ajoutez des tests E2E automatisés (ex. `cypress`) qui simulent le frontend et valident les règles de blocage/validation; documentez `npm run test:e2e`.
