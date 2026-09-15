# Guide utilisateur — procédure d'admission (agent d'accueil)

Étapes (résumé):
1. Rechercher le patient dans la barre de recherche par nom/prénom/DATE_NAISSANCE ou INS.
2. Vérifier visuellement l'identité présentée par le patient avec la pièce d'identité.
3. Cochez "Identité contrôlée" si la concordance est bonne.
4. Saisir les informations de l'ordonnance : examen (NFS) et prescripteur (nom, RPPS si connu).
5. Valider l'admission. Le système :
   - soumet un Bundle FHIR transactionnel au référentiel,
   - en cas de succès, génère et sauvegarde le message ADT^A04 vers le SIL (fichier dans `out/`).

Escalade en cas de doute d'identité:
- Si le patient ne figure pas dans le référentiel, lancer la procédure d'identitovigilance (recherche élargie, demander pièce, création d'identité avec statut dégradé).
- Si l'ordonnance est absente/illisible, ne pas valider l'admission ; contacter le biologiste si nécessité.

Conformité COFRAC / RGPD (démo):
- Les actions sont horodatées et associent l'agent (champ `author`).
- Ne pas utiliser de données réelles sur un serveur public de test (`hapi.fhir.org`), utilisez des jeux de données fictifs.
