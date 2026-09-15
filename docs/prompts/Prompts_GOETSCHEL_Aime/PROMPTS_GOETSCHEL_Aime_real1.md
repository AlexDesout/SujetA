# Prompt 1 — Maquette web pour l'agent d'accueil

Original:
"Crée une maquette web minimale (HTML+JS) pour l'agent d'accueil : champs nom/prénom/naissance, bouton 'Rechercher', affichage résultat FHIR et bouton 'Valider admission'."

Amélioré / Final (à utiliser):
Génère un mini front-end `web/index.html` + `web/app.js` qui propose : champs `nom`, `prenom`, `birthDate`, bouton `Rechercher`. À la recherche, appelle `/api/patient/search` (backend) et affiche `Patient` (nom, date de naissance, statut INS). Ajoute bouton `Valider admission` qui envoie `ServiceRequest` et déclenche la génération ADT. Inclure styles basiques et messages d'erreur.

- Objectifs métier à respecter : O1 (admission sans ressaisie), O2 (contrôle par l'agent), O4 (prise en compte du statut INS), O5 (gestion d'exceptions), O6 (traçabilité).
- En cas de patient introuvable (`total=0`), afficher procédure d'identitovigilance et bloquer la validation d'admission sans création d'identité manuelle confirmée.
- Ne pas pré-remplir ou exposer d'INS réels dans l'UI lors des démonstrations ; utiliser données fictives.
Prompt final:
Crée `web/index.html` + `web/app.js` pour recherche patient, affichage identité, checkbox 'Identité contrôlée' et bouton 'Valider admission' déclenchant la génération ADT via une API Node.js (`/api/admission`).

Contexte CDC à intégrer côté UI :
- Objectifs métier à respecter : O1 (admission sans ressaisie), O2 (contrôle par l'agent), O4 (prise en compte du statut INS), O5 (gestion d'exceptions), O6 (traçabilité).
- En cas de patient introuvable (`total=0`), afficher procédure d'identitovigilance et bloquer la validation d'admission sans création d'identité manuelle confirmée.
- Ne pas pré-remplir ou exposer d'INS réels dans l'UI lors des démonstrations ; utiliser données fictives.
- Objectifs métier à respecter : O1 (admission sans ressaisie), O2 (contrôle par l'agent), O4 (prise en compte du statut INS), O5 (gestion d'exceptions), O6 (traçabilité).
- En cas de patient introuvable (`total=0`), afficher procédure d'identitovigilance et bloquer la validation d'admission sans création d'identité manuelle confirmée.
- Ne pas pré-remplir ou exposer d'INS réels dans l'UI lors des démonstrations ; utiliser données fictives.

---

Claude-style prompt (standard):
```claude
Create a minimal front-end `web/index.html` and `web/app.js` for patient search: fields name, given, birthDate; a 'Search' button calling `/api/patient/search`; display patient identity and INS status; add 'Validate admission' that posts to `/api/admission`.
```

Improved Claude-style prompt (amélioré):
```claude
Build `web/index.html` and `web/app.js` implementing a simple agent UI:
- Fields: `lastName`, `firstName`, `birthDate` and a `Search` button.
- `Search` calls backend API `GET /api/patient?family={lastName}&given={firstName}&birthDate={YYYY-MM-DD}` and renders returned patient (name, birthDate, insStatus).
- Show `insStatus` prominently and a checkbox `Identity verified` that the agent must tick before `Validate admission` is enabled.
- `Validate admission` sends POST `/api/admission` with patient reference and prescription (examen + prescriber). Block submission if prescription missing or `insStatus` non-validated.
- Log agent id and local ISO timestamp in the request body for traceability; avoid printing raw INS in client logs.

Deliverables:
- `web/index.html`, `web/app.js`, simple CSS file `web/styles.css`, and a short usage note.
```

Ajout final (tests d'intégration):
Ajoutez des tests E2E (par ex. `cypress` ou `puppeteer`) pour vérifier le parcours agent complet (recherche → contrôle → validation). Documentez la commande `npm run test:e2e` et l'intégration dans la suite CI.
