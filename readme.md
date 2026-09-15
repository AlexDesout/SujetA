# Prototype d'admission LBM — NFS

Résumé
- Objectif : prototype d'interopérabilité FHIR → SIL pour l'admission d'un patient ambulatoire pour une NFS.
- Points clés : recherche d'identité via FHIR R4, validation par l'agent d'accueil, génération d'un message ADT^A04 vers le SIL, traçabilité et gestion des exceptions.

Structure du dépôt
- CDC/: cahier des charges (sections 1–12).
- src/: code source du prototype.
- tests/: scénarios Gherkin et tests automatisés.
- docs/: documentation technique et opérationnelle.

Démarrage rapide
1. Relire le cahier des charges dans `CDC/`.
2. Implémenter le module d'admission (client FHIR, transaction Bundle, transformation HL7 v2 ADT^A04).
3. Valider avec les scénarios Gherkin (section 12) et un parseur HL7 v2.

Prochaines étapes proposées
- Initialiser un dépôt Git et faire un commit initial.
- Choisir la stack technologique (Python/Node/Java) pour implémenter le module d'admission.
 - Choisir la stack technologique (HTML/CSS, Node.js) pour implémenter le module d'admission.
- Implémenter les gherkins et un petit harness de test contre `https://hapi.fhir.org/baseR4` (données fictives).
