# Résumé du cahier des charges — Admission LBM (NFS)

Points essentiels
- Objectif : démontrer la jonction d'identité FHIR R4 → message ADT^A04 (HL7 v2.5.1) pour l'admission d'un patient ambulatoire pour une NFS.
- Cas d'usage : recherche d'identité dans un serveur FHIR, contrôle par l'agent d'accueil, rattachement de la prescription et génération du message vers le SIL.
- Choix techniques majeurs : FHIR R4, transaction Bundle REST, serveur de test `https://hapi.fhir.org/baseR4`, message cible ADT^A04 v2.5.1.
- Terminologies : LOINC (58410-2 vs 57021-8 à arbitrer), NABM pour facturation (hors périmètre), INS (OID 1.2.250.1.213.1.4.8/9).
- Exigences non fonctionnelles : traçabilité (COFRAC), sécurité/RGPD, validation par HAPI FHIR Validator.

Risques et points à confirmer
- Validation des profils FR Core à utiliser (partie technique).
- Inclusion éventuelle d'OBR/ORC pour porter la demande plutôt que d'étendre ADT^A04.
- Choix final du code LOINC pour la NFS (avec/sans formule).

Prochaines actions
- Choisir la stack technique et initialiser le dépôt Git.
- Écrire les scénarios Gherkin (section 12) et les tests d'intégration contre HAPI FHIR.
