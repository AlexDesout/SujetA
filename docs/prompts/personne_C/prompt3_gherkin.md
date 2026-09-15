# Prompt 3 — Scénarios Gherkin automatisables

Original:
"Rédige les scénarios Gherkin (section 12) automatisables : recherche avec résultat, patient introuvable, ordonnance manquante, validation provoquant génération ADT^A04."

Amélioré / Final (à utiliser):
Écris un fichier `tests/features/admission.feature` contenant Gherkin pour : (A) Recherche patient par INS → affichage identité ; (B) Patient introuvable → procédure d'identitovigilance affichée ; (C) Saisie ordonnance incomplète → blocage de la validation ; (D) Validation complète → backend reçoit la requête et un ADT^A04 est généré. Inclure exemples de données (tables `Examples`).

- Utiliser les scénarios d'acceptation listés en 5.7 du CDC (affichage d'identité sans ressaisie, blocage en cas d'ordonnance manquante, transmission au SIL après validation, patient introuvable orientant vers identitovigilance).
- Inclure exemples : INS fictif `285033155504217`, LOINC `58410-2`, et cas d'erreur `GET /Patient/{id}` renvoyant 404 + `OperationOutcome`.
Prompt final:
Crée `tests/features/admission.feature` avec les 4 scénarios Gherkin et jeux d'exemples adaptés pour exécution via un runner JS (ex. `cucumber-js`) et intégration avec une API Node.js.

Contexte CDC pour les Gherkin :
- Utiliser les scénarios d'acceptation listés en 5.7 du CDC (affichage d'identité sans ressaisie, blocage en cas d'ordonnance manquante, transmission au SIL après validation, patient introuvable orientant vers identitovigilance).
- Inclure exemples : INS fictif `285033155504217`, LOINC `58410-2`, et cas d'erreur `GET /Patient/{id}` renvoyant 404 + `OperationOutcome`.
- Utiliser les scénarios d'acceptation listés en 5.7 du CDC (affichage d'identité sans ressaisie, blocage en cas d'ordonnance manquante, transmission au SIL après validation, patient introuvable orientant vers identitovigilance).
- Inclure exemples : INS fictif `285033155504217`, LOINC `58410-2`, et cas d'erreur `GET /Patient/{id}` renvoyant 404 + `OperationOutcome`.

---

Claude-style prompt (standard):
```claude
Write a Cucumber feature file `tests/features/admission.feature` containing scenarios: successful search and display, patient not found, missing prescription blocks validation, complete validation triggers ADT generation.
```

Improved Claude-style prompt (amélioré):
```claude
Create `tests/features/admission.feature` (Gherkin) with scenarios adapted for `cucumber-js`:

Scenario A: Search by INS returns patient
	Given the FHIR server contains patient with INS "285033155504217"
	When the agent searches by name and birthDate
	Then the patient identity is displayed and insStatus shown

Scenario B: Patient not found
	Given no patient matches the search criteria
	When the agent searches
	Then the UI shows the identitovigilance procedure and validation is disabled

Scenario C: Missing prescription
	Given a patient is displayed
	When the agent attempts to validate without prescription
	Then the system blocks validation and shows an error

Scenario D: Successful validation
	Given a patient and a valid prescription
	When the agent validates admission
	Then backend receives admission and an ADT^A04 is generated

Include `Examples` tables for INS `285033155504217`, LOINC `58410-2`, and instructions to mock backend responses using `nock` in step definitions.
```

Ajout final (tests d'intégration):
Ajoutez des step definitions (`.js`) pour `cucumber-js` qui utilisent `nock` pour simuler le backend et exécutez les scénarios en CI via `npm run test:features`.
