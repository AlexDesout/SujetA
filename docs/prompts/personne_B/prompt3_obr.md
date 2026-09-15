# Prompt 3 — Inclusion conditionnelle d'un OBR

Original:
"Ajoute l'inclusion conditionnelle d'un segment `OBR` portant le code LOINC (58410-2) quand `ServiceRequest` est présent, et documente la convention choisie."

Amélioré / Final (à utiliser):
Écris le code qui ajoute un segment `OBR` (numéro d'observation, OBR-4 = `58410-2^CBC panel - Blood by Automated count^LN`, OBR-7 date/heure) si un `ServiceRequest` est fourni. Indique clairement dans la documentation que l'OBR est une extension pédagogique de l'ADT^A04 et propose une alternative (envoyer OBR dans un message ORM/OML).

- Le CDC note que l'OBR appartient normalement aux messages de commande (ORM/OML), et que son inclusion dans l'ADT^A04 est pédagogique. Documenter ce compromis et prévoir alternative d'envoi via message de commande pour intégration SIL réelle.
- Lorsque l'OBR est inclus, s'assurer que le code LOINC et la description sont présents (`system=http://loinc.org`).
Prompt final:
Ajoute OBR conditionnel pour `ServiceRequest` (OBR-4=58410-2^...^LN, OBR-7 timestamp) en Node.js et documente l'extension pédagogique vs message de commande.

Contexte CDC :
- Le CDC note que l'OBR appartient normalement aux messages de commande (ORM/OML), et que son inclusion dans l'ADT^A04 est pédagogique. Documenter ce compromis et prévoir alternative d'envoi via message de commande pour intégration SIL réelle.
- Lorsque l'OBR est inclus, s'assurer que le code LOINC et la description sont présents (`system=http://loinc.org`).
- Le CDC note que l'OBR appartient normalement aux messages de commande (ORM/OML), et que son inclusion dans l'ADT^A04 est pédagogique. Documenter ce compromis et prévoir alternative d'envoi via message de commande pour intégration SIL réelle.
- Lorsque l'OBR est inclus, s'assurer que le code LOINC et la description sont présents (`system=http://loinc.org`).

---

Claude-style prompt (standard):
```claude
Add an OBR segment when a ServiceRequest is present: OBR-4 = '58410-2^CBC panel - Blood by Automated count^LN' and OBR-7 = observation datetime.
```

Improved Claude-style prompt (amélioré):
```claude
Extend the ADT generator to conditionally insert an OBR segment when a `ServiceRequest` is provided.

Rules:
- OBR-1: set a sequence number (1)
- OBR-4: set code as `58410-2^CBC panel - Blood by Automated count^LN` with system `http://loinc.org`.
- OBR-7: set observation date/time from ServiceRequest.authoredOn or current timestamp.

Notes:
- Clearly state in the output documentation that including OBR inside ADT^A04 is pedagogical; recommend sending a dedicated ORM/OML command message for production SIL integration.
- Provide unit tests (Jest) ensuring OBR is present when ServiceRequest exists and absent otherwise.
```

Ajout final (tests d'intégration):
Inclure un test d'intégration qui vérifie la présence/absence d'OBR en bout-à-bout (génération ADT → parsing) et documenter la commande `npm run test:integration`.
