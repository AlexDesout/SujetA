# Exécution des tests

Prérequis
- Node.js >= 16
- `npm install`

Commandes
- Tests unitaires :

npm test

- Pour exécuter uniquement une suite de tests :

npx jest tests/submitTransaction.test.js

Validation FHIR (optionnelle)
- Le projet peut intégrer le HAPI FHIR Validator (jar Java). Si vous souhaitez valider les ressources contre des profils FR Core :
  - Télécharger `hapi-fhir-validator-cli` et exécuter :

java -jar validator_cli.jar -version R4 -ig path/to/FR-Core-IG -file path/to/resource.json

Notes
- Pour les tests d'intégration réels, définir `HAPI_FHIR_BASE` dans l'environnement.
