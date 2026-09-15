<role>
Tu es un expert senior en interopérabilité en santé, 
spécialisé en FHIR R4, HL7 v2 et terminologies 
médicales (LOINC, SNOMED CT). 
Tu rédiges des documents académiques rigoureux 
en français.
</role>

<context>
  <project>Admission d'un patient dans un laboratoire 
  de biologie médicale privé — cas d'usage : prélèvement 
  pour une Numération Formule Sanguine (NFS)</project>
  <lab_type>Laboratoire privé de ville — accréditation 
  COFRAC, conventions AM, RGPD secteur privé</lab_type>
  <use_case_exam>Numération Formule Sanguine (NFS) — 
  code LOINC 58410-2</use_case_exam>
  <fhir_version>R4 (4.0.1)</fhir_version>
  <fhir_server>https://hapi.fhir.org/baseR4</fhir_server>
  <hl7v2_version>2.5.1</hl7v2_version>
  <target_message>ADT^A04 — patient ambulatoire externe
  </target_message>
  <resources>Patient, Encounter (class=AMB), 
  ServiceRequest, PractitionerRole, Organization, 
  Coverage</resources>
  <exchange>RESTful FHIR + JSON + Bundle transactionnel
  </exchange>
  <national_context>France — INS (INS-NIR et INS-NIA), 
  CI-SIS, référentiel ANS</national_context>
  <security_scope>Décrire théoriquement SMART on FHIR / 
  OAuth2 — pas d'implémentation réelle dans le prototype
  </security_scope>
</context>

<instructions>
  Rédige les sections 9 à 12 du cahier des charges.
  Ces sections complètent les sections 1 à 8 rédigées 
  par les autres membres — ne pas répéter le contexte 
  métier ni les choix FHIR déjà justifiés.
  Pour chaque choix terminologique, justifie-le 
  avant de l'énoncer.
  Si un code ou une URL est incertain, signale-le 
  explicitement plutôt que d'inventer.
  Utilise des codes LOINC et HL7 v2 réels 
  et vérifiables.
  Sois concis : pas de phrases de remplissage.

  <section id="9" title="Terminologies">
    Pour chaque donnée, fournis un tableau avec 
    les colonnes exactes suivantes :
    Donnée | Terminologie | URL système | 
    Code exemple | Justification | 
    Perte lors du mapping FHIR→HL7v2

    Couvre obligatoirement ces 5 données 
    dans cet ordre :
    1. Type d'examen NFS (ServiceRequest.code) 
       → LOINC code 58410-2
    2. Sexe administratif (Patient.gender) 
       → mapping administrative-gender FHIR 
       vers table 0001 HL7 v2.5.1
    3. Classe de rencontre ambulatoire 
       (Encounter.class) → mapping ActCode FHIR 
       (AMB) vers table 0004 HL7 v2.5.1 (O)
    4. Identifiant patient INS-NIR et INS-NIA 
       (Patient.identifier) → OID ANS français 
       respectifs
    5. Statut de la demande 
       (ServiceRequest.status) → ValueSet FHIR 
       request-status vers segment ORC HL7 v2.5.1

    Après le tableau, ajoute un paragraphe sur les 
    contraintes spécifiques au LBM privé : 
    codes NABM (Nomenclature des Actes de Biologie 
    Médicale) comme complément au LOINC pour la 
    facturation AM.
    
    Pour chaque ligne, la colonne "Perte lors 
    du mapping" doit être renseignée même si 
    la réponse est "Aucune perte".
  </section>

  <section id="10" title="Sécurité">
    Traite ces trois niveaux dans cet ordre :

    1. Authentification et autorisation (théorique) :
       Décris SMART on FHIR / OAuth2 et son rôle 
       attendu dans une architecture de production.
       Précise explicitement ce qui est mis de côté 
       dans le prototype et pourquoi.

    2. Identitovigilance :
       Explique le rôle de l'INS-NIR vs INS-NIA dans 
       l'identification fiable du patient au LBM privé.
       Cite le risque concret d'une erreur d'identité 
       dans le contexte d'un résultat biologique 
       transmis à un médecin.
       Mentionne les obligations spécifiques 
       du secteur privé (référentiel ANS, 
       convention AM).

    3. Traçabilité des échanges :
       Précise ce qui doit être tracé : requêtes 
       HTTP vers https://hapi.fhir.org/baseR4, 
       codes retour HTTP, ressources 
       OperationOutcome en cas d'erreur FHIR, 
       horodatage des admissions.
  </section>

  <section id="11" title="Validation et conformité">
    Fournis un tableau avec les colonnes :
    Ressource/Message | Élément à valider | 
    Règle | Outil

    Couvre ces 5 niveaux de validation :
    - Structurelle (JSON valide, resourceType correct)
    - Profil (cardinalités must-support)
    - Terminologique (codes dans les ValueSets)
    - Référentielle 
      (ServiceRequest.subject → Patient valide)
    - Message HL7 v2.5.1 
      (segments MSH, EVN, PID, PV1 présents)

    Outils à citer avec leur usage précis :
    HAPI FHIR Validator, Firely SDK, Simplifier.net
  </section>

  <section id="12" title="Critères d'acceptation">
    Rédige exactement 6 critères au format 
    Gherkin strict.
    Utilise l'URL réelle du serveur 
    https://hapi.fhir.org/baseR4 dans les WHEN 
    qui font des requêtes HTTP.

    Couvre ces 6 scénarios dans cet ordre :
    1. Création d'un nouveau patient avec INS-NIR 
       dans un LBM privé
    2. Recherche d'un patient existant par son INS
    3. Création d'un Encounter ambulatoire 
       (class=AMB) associé au patient
    4. Création d'un ServiceRequest NFS avec 
       le code LOINC 58410-2
    5. Génération et validation du message 
       ADT^A04 HL7 v2.5.1
    6. Gestion d'erreur : patient introuvable 
       → OperationOutcome avec code HTTP 404
  </section>
</instructions>

<examples>
  <example type="mapping_table_row">
    | Sexe administratif | HL7 v2 Table 0001 | 
    http://terminology.hl7.org/CodeSystem/v2-0001 | 
    M | Correspondance standardisée internationale | 
    Perte partielle : FHIR "other" sans équivalent 
    exact en table 0001 HL7 v2.5.1 |
  </example>

  <example type="gherkin">
    GIVEN un patient enregistré avec l'INS-NIR 
          "1234567890123" dans le LBM privé
    WHEN je fais GET https://hapi.fhir.org/baseR4/
         Patient?identifier=
         urn:oid:1.2.250.1.213.1.4.8|1234567890123
    THEN le serveur retourne HTTP 200
    AND le Bundle contient au moins une ressource 
        Patient
    AND Patient.gender est présent et appartient 
        au ValueSet administrative-gender
  </example>
</examples>

<output_format>
  Titres numérotés 
  (## 9. Terminologies, ## 10. Sécurité, etc.).
  Tableaux Markdown pour les mappings 
  et la validation.
  Critères Gherkin dans des blocs de code 
  (```gherkin ... ```).
  Langue : français professionnel.
</output_format>

<verification>
  Avant de terminer, vérifie point par point :
  - Le code LOINC 58410-2 est bien celui 
    de la NFS complète
  - Les URLs des systèmes de codage sont officielles 
    (http://loinc.org, 
    http://terminology.hl7.org/...)
  - Les OID INS-NIR (1.2.250.1.213.1.4.8) et 
    INS-NIA (1.2.250.1.213.1.4.9) sont corrects
  - Chaque test Gherkin utilise l'URL 
    https://hapi.fhir.org/baseR4 et est testable 
    concrètement
  - La colonne "Perte lors du mapping" est 
    remplie pour chaque ligne du tableau section 9
  - La section 10 mentionne les obligations 
    spécifiques du secteur privé
  - La section 9 mentionne la NABM comme 
    complément au LOINC pour la facturation AM
  - La version HL7 v2.5.1 est cohérente 
    dans toutes les sections
</verification>