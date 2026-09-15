# Rapport d'écarts — CDC vs code (prototype)

Résumé
- Objectif : vérifier la conformité du code aux exigences du cahier des charges (CDC) pour l'admission NFS.

Ce qui est implémenté
- Recherche Patient FHIR par INS : [src/fhirClient.js](src/fhirClient.js)
- Génération ADT^A04 minimale (MSH, EVN, PID, PV1) : [src/transformer.js](src/transformer.js)
- Sauvegarde HL7 dans `out/` et index (horodatage + auteur) : [src/app.js](src/app.js)
- Tests unitaires (Jest + nock) couvrant recherche FHIR, génération HL7 et submitTransaction : [tests/](tests/)

Écarts / points manquants
- Bundle transactionnel FHIR complet (creation `Patient`+`Encounter`+`ServiceRequest` en `Bundle.type=transaction`) : partiellement absent. Implémenter construction et soumission conditionnelle du Bundle.
- Validation FHIR par profils (FR Core) / HAPI FHIR Validator : absent.
- Gestion complète et convention de transmission du statut INS (identité "validée") → PID-32 ou segment Z : non standardisé et non émis.
- Inclusion d'OBR/ORC dans le flux SIL (CDC recommande OBR pour la demande NFS) : OBR supporté optionnellement si `ServiceRequest` fourni, mais non inclus dans ADT standard (à documenter ou déplacer vers message de commande).
- Traçabilité COFRAC : logs plus détaillés nécessaires (ne pas logger PHI, stocker auteur/id action + ISO8601 timestamp) et preuve de non-répudiation si demandé.
- Sécurité / RGPD : pas d'auth/authz / chiffrement des échanges (utilisation d'un serveur public de test implies fictitious data only).

Recommandations (priorités)
1. Implémenter la création/transaction FHIR complète et tests d'intégration : construire `Bundle(type=transaction)` avec `Patient`, `Encounter(class=AMB)`, `ServiceRequest(code=58410-2)` et utiliser `submitTransaction` pour POST sur la base.
2. Ajouter validation FHIR via HAPI FHIR Validator (documenter commande CLI et ajouter tests d'intégration qui valident le `Bundle` avant envoi).
3. Formaliser la convention INS → HL7 : utiliser `PID-3` avec OID (déjà partiellement présent) et ajouter `PID-32` pour le statut de fiabilité ou créer segment Z; documenter la convention pour le SIL.
4. Documenter la décision sur inclusion d'OBR dans ADT vs envoi séparé (ORM/OML) et adapter `transformer` en conséquence.
5. Compléter la traçabilité : logs structurés (audit events) et stockage minimal pour COFRAC.

Fichiers modifiés récents
- [src/fhirClient.js](src/fhirClient.js) — `submitTransaction` amélioré, erreurs structurées.
- [src/transformer.js](src/transformer.js) — PID-3 formaté, PV1 ajouté, OBR optionnel.
- [tests/submitTransaction.test.js](tests/submitTransaction.test.js) — nouveaux tests.

Commandes utiles
- Exécuter les tests unitaires : `npm test`
- Lancer le serveur (dev) : `node src/app.js` (puis ouvrir l'UI)

Proposition suivante
- Je peux implémenter la construction du `Bundle` transactionnel et ajouter les tests d'intégration (option: mock `HAPI_FHIR_BASE` ou tests réels contre `HAPI_FHIR_BASE`). Dites si je dois continuer sur cette tâche.
