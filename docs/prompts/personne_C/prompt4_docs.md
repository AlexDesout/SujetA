# Prompt 4 — Documentation utilisateur et guide de tests

Original:
"Rédige la documentation utilisateur (procédure d'identitovigilance) et un bref guide pour exécuter les tests d'intégration contre `https://hapi.fhir.org/baseR4`."

Amélioré / Final (à utiliser):
Crée `docs/user_guide.md` décrivant : procédure pas-à-pas de l'agent (recherche, contrôle pièce d'identité, checkbox 'Identité contrôlée', saisie ordonnance), procédure d'escalade vers le biologiste en cas de doute. Ajoute `docs/run_tests.md` expliquant comment exécuter les tests d'intégration (prérequis, variables d'environnement, exécution `pytest` ou `npm test`) et comment paramétrer l'URL `HAPI_FHIR_BASE`.

- Intégrer la procédure d'identitovigilance (processus d'escalade au biologiste), les obligations COFRAC (trace horodatée + auteur) et les contraintes RGPD (données fictives pour démonstration, minimisation des données exposées).
- Indiquer comment configurer `HAPI_FHIR_BASE`, exécuter `pytest` pour les tests FHIR et `hl7apy` pour valider les messages ADT^A04.
Prompt final:
Produis `docs/user_guide.md` et `docs/run_tests.md` expliquant la procédure agent et l'exécution des tests d'intégration contre HAPI_FHIR_BASE.

Contexte CDC pour la documentation :
- Intégrer la procédure d'identitovigilance (processus d'escalade au biologiste), les obligations COFRAC (trace horodatée + auteur) et les contraintes RGPD (données fictives pour démonstration, minimisation des données exposées).
- Indiquer comment configurer `HAPI_FHIR_BASE`, exécuter `npm test` (Jest) pour les tests FHIR et utiliser un parseur HL7 JS (`hl7`/`hl7-standard`) pour valider les messages ADT^A04.
- Intégrer la procédure d'identitovigilance (processus d'escalade au biologiste), les obligations COFRAC (trace horodatée + auteur) et les contraintes RGPD (données fictives pour démonstration, minimisation des données exposées).
- Indiquer comment configurer `HAPI_FHIR_BASE`, exécuter `pytest` pour les tests FHIR et `hl7apy` pour valider les messages ADT^A04.
Ajout final (tests d'intégration):
Documentez et fournissez les commandes pour exécuter l'ensemble des tests : unitaires (`npm test`), intégration (`npm run test:integration`), et E2E (`npm run test:e2e`). Indiquez comment lire les rapports de test.

---

Claude-style prompt (standard):
```claude
Write `docs/user_guide.md` and `docs/run_tests.md` describing agent procedure (identitovigilance) and how to run integration tests against HAPI_FHIR_BASE.
```

Improved Claude-style prompt (amélioré):
```claude
Produce two Markdown files:

1) `docs/user_guide.md` — concise agent procedure:
- Step-by-step: search patient, verify identity against presented ID, tick 'Identity verified', enter prescription details (NFS + prescriber), validate admission.
- Escalation flow: when identity mismatch or `insStatus` not validated, show steps to contact biologiste and mark identity as 'degraded' in system.
- Compliance notes: COFRAC traceability requirements (log agent id, action, ISO8601 timestamp), RGPD guidance for demo (use fictitious data only).

2) `docs/run_tests.md` — developer guide:
- Prerequisites: Node.js >= 16, `npm install` to install `express`, `axios`, `jest`, `nock`, `hl7`.
- Environment: set `HAPI_FHIR_BASE` for integration runs.
- Commands: `npm test` (unit tests), `npm run test:integration` (integration tests against `HAPI_FHIR_BASE`), sample `nock` recipes for offline runs.
- How to validate ADT messages: use `hl7` parser CLI snippet or Node script to parse and assert MSH/PID/PV1.
```
