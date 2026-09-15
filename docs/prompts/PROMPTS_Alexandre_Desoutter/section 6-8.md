# Cahier des charges — Admission d'un patient en laboratoire de biologie médicale privé
## Cas d'usage : prélèvement pour une Numération Formule Sanguine (NFS)
### Partie technique — Sections 6 à 8

> Les mappings terminologiques détaillés relèvent de la **section 9**, les tests Gherkin de la **section 12**, et les besoins/scénarios métier des **sections 1 à 5**. Ils ne sont pas dupliqués ici.

---

## Cadrage technique préalable (raisonnement)

Les points ci-dessous structurent le raisonnement ; ce sont exactement ceux développés dans les sections 6 à 8.

- **Choix ADT^A04 vs A01.** Retenu : **ADT^A04** (« Register a patient »), qui notifie l'enregistrement d'un patient **non hospitalisé**. **A01** (« Admit/visit ») décrit l'admission d'un patient en lit d'hospitalisation ; il est inadapté à un LBM de ville où le patient est reçu en **ambulatoire externe** sans admission. Développé en 6.4.
- **Ressources FHIR retenues et rôle.** `Patient` (identité + INS), `Encounter` (`class=AMB`, la venue d'admission), `ServiceRequest` (la prescription de NFS), `PractitionerRole` (le prescripteur dans son organisation/spécialité), `Organization` (le LBM et l'autorité émettrice de l'identifiant), `Coverage` (la couverture Assurance Maladie). Chaîne : `Patient ← Encounter ← ServiceRequest`. Développé en 6.3.
- **Deux cas d'erreur techniques** (distincts des cas métier de la section 5) : **(T1)** indisponibilité ou réponse non conforme du serveur FHIR (timeout, HTTP 5xx, `OperationOutcome` de type *exception*) ; **(T2)** échec de la transaction `Bundle` (référence interne non résolue, validation, doublon sur création conditionnelle → HTTP 400/422, rollback atomique). Développés en 6.6.
- **Perte d'information classique FHIR → HL7 v2.5.1.** Le **statut de fiabilité de l'identité INS** (identité « validée » / « qualifiée »), porté en FHIR par extension, n'a **pas de champ natif** dans le PID v2.5.1. Développé en 8.3.

---

## 6. Choix des spécifications d'interopérabilité

### 6.1 Version FHIR — R4 (4.0.1)

R4 est la première version de FHIR à comporter des parties **normatives** (dont l'API RESTful et les sérialisations JSON/XML) et bénéficie du socle d'outillage et de serveurs le plus mature en production (spécification HL7 FHIR R4, `hl7.org/fhir/R4`). Trois arguments objectifs justifient ce choix pour le prototype : le **serveur cible** `https://hapi.fhir.org/baseR4` expose précisément un endpoint R4 ; les **profils nationaux français** (FR Core, publiés par Interop'Santé/ANS) sont alignés sur R4 ; et R4 est la version la plus largement **déployée** dans les échanges de santé actuels. Le choix reste à confirmer par la partie technique au regard des profils FR Core effectivement mobilisés.

### 6.2 Type d'échange — REST + Bundle transactionnel

Le paradigme **RESTful** (ressources exposées par URL, verbes HTTP) est le mode d'échange principal de FHIR et le mieux supporté par les serveurs publics comme HAPI. Pour l'admission, plusieurs ressources liées (`Patient`, `Encounter`, `ServiceRequest`) doivent être créées de façon **cohérente** : le **Bundle transactionnel** (`Bundle.type = transaction`) garantit l'**atomicité** — soit tout est créé, soit rien — ce qui évite un état partiel avant génération du message SIL (spéc. `hl7.org/fhir/R4/http.html#transaction`). L'alternative **FHIR Messaging** (échange piloté par `MessageHeader`, qui rejoue la logique de messagerie v2) est plus lourde et moins supportée sur les serveurs de test ; elle n'apporte pas de bénéfice ici. Choix à confirmer techniquement.

### 6.3 Ressources FHIR retenues

- **`Patient`** : porte l'identité du patient et son **INS** (matricule + OID + traits d'identité de référence). Ressource pivot de l'admission.
- **`Encounter`** (`class = AMB`) : représente la **venue d'admission ambulatoire** au LBM (`Encounter.subject → Patient`).
- **`ServiceRequest`** : représente la **prescription de NFS** (`intent = order`), rattachée au patient et à la venue (`ServiceRequest.subject → Patient`, `ServiceRequest.encounter → Encounter`, `ServiceRequest.requester → PractitionerRole`).
- **`PractitionerRole`** : décrit le **médecin prescripteur** dans son rôle/organisation (permet de porter le RPPS et la spécialité).
- **`Organization`** : décrit le **LBM privé** et, le cas échéant, l'**autorité émettrice** de l'identifiant patient.
- **`Coverage`** : porte le **contexte de couverture Assurance Maladie** (`Coverage.beneficiary → Patient`) ; utile au cadrage, sa transmission au SIL reste hors périmètre (voir section 4).

Relation d'ensemble : **`Patient ← Encounter ← ServiceRequest`**, la venue rattachant la prescription au bon patient.

### 6.4 Type de message HL7 v2 — ADT^A04, version 2.5.1

Dans HL7 v2, **A01** notifie l'**admission d'un patient en hospitalisation** (affectation à un lit) ; **A04** enregistre un patient **reçu sans hospitalisation** (consultation externe, urgences, ambulatoire). Un LBM de ville accueillant un patient pour un prélèvement relève **exactement** du cas A04 (HL7 v2.5.1, ch. 3 — Patient Administration). Le message est cadré en **version 2.5.1** ; sa structure est celle d'`ADT_A01`. Les **segments obligatoires** retenus sont : **MSH** (en-tête et métadonnées du message), **EVN** (type et horodatage de l'événement), **PID** (identification patient), **PV1** (venue — `PV1-2` = classe patient `O` *Outpatient*, table HL7 0004). Le cadre IHE **PAM** (Patient Administration Management) et son extension française **PAM FR** (Interop'Santé/CI-SIS) précisent l'usage des flux ADT et sont à consulter par la partie technique.

### 6.5 Terminologies retenues

Trois familles sont mobilisées : **LOINC** pour l'examen (code `58410-2` « CBC panel - Blood by Automated count », `loinc.org/58410-2`) — à noter que la NFS *avec formule* correspond plutôt à `57021-8`, arbitrage à trancher en **section 9** ; les **tables HL7 v2** pour les champs codés (0001 sexe, 0004 classe patient, 0203 type d'identifiant) ; et l'**INS** pour le référencement de l'identité (matricule NIR/NIA + OID + traits, référentiel INS v2 de l'ANS). Le tableau de correspondance détaillé est traité en **section 9** et n'est pas reproduit ici.

### 6.6 Interactions REST avec le serveur FHIR

Base : `https://hapi.fhir.org/baseR4`.

- **Recherche patient par INS** — `GET https://hapi.fhir.org/baseR4/Patient?identifier=urn:oid:1.2.250.1.213.1.4.8|{matricule_INS}`
  Retour attendu : **200 OK** avec un `Bundle` de type `searchset`. `total = 0` (aucun patient) relève du **cas métier** de la section 5.2, pas du présent traitement technique.
- **Création patient (si nécessaire)** — `POST https://hapi.fhir.org/baseR4/Patient` (corps : ressource `Patient`)
  Retour attendu : **201 Created**, en-têtes `Location` (id + version) et `ETag`. Une création conditionnelle (`If-None-Exist`) peut prévenir les doublons.
- **Création de la venue** — `POST https://hapi.fhir.org/baseR4/Encounter` (corps : `Encounter`, `class=AMB`). Retour : **201 Created**. En pratique, cette création est portée par la transaction ci-dessous.
- **Transaction** — `POST https://hapi.fhir.org/baseR4` (corps : `Bundle` `type=transaction` regroupant `Patient`/`Encounter`/`ServiceRequest`, références internes par `urn:uuid:`).
  Point technique : une transaction FHIR se soumet à l'**URL de base** du serveur, **pas** à `/Bundle` (qui, lui, *stockerait* une ressource `Bundle`). Retour attendu : **200 OK** avec un `Bundle` `transaction-response`.

**Gestion des deux cas d'erreur techniques :**

- **(T1) Serveur FHIR indisponible ou réponse non conforme** — timeout, **HTTP 5xx**, ou `OperationOutcome` de sévérité `error`/`fatal`. Conséquence : l'identité n'est pas fiabilisée. Traitement attendu : temporisation/rejeu limité, message d'erreur **technique** distinct de l'erreur métier, et **aucune** génération du message ADT tant que l'appel n'a pas abouti.
- **(T2) Échec de la transaction Bundle** — une entrée échoue (référence `urn:uuid:` non résolue, échec de validation, doublon d'identifiant sur création conditionnelle) → **HTTP 400/422** + `OperationOutcome`. La transaction étant **atomique**, aucune ressource n'est créée. Traitement attendu : lecture de `OperationOutcome` (`issue.severity`, `issue.code`, `issue.diagnostics`), **abandon** de la génération du message ADT, et remontée de l'échec pour reprise.

Dans les deux cas, le prototype exploite `OperationOutcome` comme source structurée du diagnostic technique.

---

## 7. Architecture et lecture ReEIF

L'analyse suit les **six couches** du **ReEIF** (Refined eHealth European Interoperability Framework), issu du projet Antilope et adopté par l'eHealth Network en 2015 (Commission européenne / eHealth Network).

**1. Infrastructure / Sécurité réseau.** Le prototype s'appuie sur des échanges HTTP(S) entre le module d'admission, le serveur FHIR de test (`hapi.fhir.org/baseR4`) et le SIL du LBM ; la couche assure le transport chiffré (TLS), l'isolation réseau et la disponibilité des endpoints. En production dans un LBM privé, cette couche devrait porter l'authentification serveur, le cloisonnement des flux et la journalisation des accès ; pour le prototype académique, l'usage d'un serveur public de test implique de **n'employer que des données fictives**, la sécurisation réelle (authentification, chiffrement bout en bout) étant à spécifier par la partie technique.

**2. Application.** Trois briques applicatives interagissent : le **module d'admission** (client REST qui interroge le référentiel, construit le Bundle transactionnel puis génère le message ADT), le **serveur FHIR** (référentiel patient et point d'entrée des créations/recherches) et le **SIL** (consommateur du message HL7 v2.5.1 qui ouvrira le dossier de travail). Le module d'admission joue le rôle de **passerelle** entre le monde FHIR (REST/JSON) et le monde HL7 v2 (messagerie à segments) ; sa responsabilité première est la transformation contrôlée décrite en section 8.

**3. Information.** Le modèle de données est porté par les ressources FHIR R4 retenues en 6.3, structurées autour du patient : l'identité (`Patient` + INS), la venue (`Encounter class=AMB`), la demande (`ServiceRequest` codée en LOINC) et le contexte (`PractitionerRole`, `Organization`, `Coverage`). Cette couche définit la **sémantique de référence** avant projection vers la structure plus plate de HL7 v2.5.1, où une partie de la granularité (types de codage, statuts d'identité, cardinalités) devra être arbitrée (voir 8.3 et section 9).

**4. Métier.** Le processus visé est l'**admission d'un patient ambulatoire au LBM privé** pour une NFS : identification à l'accueil, contrôle d'identité (identitovigilance), rattachement de la prescription, enregistrement de la venue et transmission au SIL. Cette couche est spécifiée en détail dans les sections 1 à 5 et n'est pas redéveloppée ici ; elle impose à l'architecture technique la **non-ressaisie de l'identité** et la **traçabilité** de chaque admission.

**5. Organisation.** Les acteurs — patient, agent d'accueil, préleveur, biologiste médical (responsable de l'identitovigilance et des exceptions), médecin prescripteur externe — et les systèmes (SIL, serveur FHIR) définissent la gouvernance du flux. Dans un LBM privé, la responsabilité opérationnelle et la supervision médicale sont **concentrées sur le biologiste médical**, sans mutualisation avec un établissement public ; la coordination avec les prescripteurs de ville et les éditeurs de SIL relève d'accords bilatéraux à formaliser.

**6. Juridique.** Le LBM privé est soumis au **RGPD** en tant que **responsable de traitement** de données de santé (base légale, minimisation, AIPD, DPO), au **référentiel INS** de l'ANS (référencement obligatoire des données de santé avec l'INS au sein du « cercle de confiance », arrêté relatif au référentiel INS), à l'**accréditation COFRAC selon la NF EN ISO 15189** (qui audite directement l'identitovigilance et la traçabilité de la phase pré-analytique), et aux **conventions avec l'Assurance Maladie** (obligations conventionnelles, télétransmission, facturation adossée à une identité fiable). Spécificité du **privé** par rapport au public : le laboratoire porte **individuellement** son accréditation et ses obligations conventionnelles et endosse seul la responsabilité de traitement, là où un établissement public s'inscrit dans des cadres mutualisés (GHT, domaines d'identité partagés). Ces contraintes sont à confirmer par la partie technique quant à leur traduction dans l'implémentation.

---

## 8. Règles de transformation et mapping sémantique

### 8.1 Tableau de mapping FHIR → HL7 v2.5.1

| Élément FHIR | Segment HL7 v2 | Champ HL7 v2 | Remarque / Perte d'information |
|---|---|---|---|
| `Patient.identifier` (INS-NIR + OID) | PID | PID-3 | Matricule en PID-3-1 ; OID de l'autorité en PID-3-4 (composant HD) ; type d'identifiant (table 0203, ex. `NI`) en PID-3-5. Le **statut de fiabilité de l'INS** n'a pas de champ dédié (voir 8.3). |
| `Patient.name` (nom de naissance, prénoms) | PID | PID-5 | Famille^prénom ; `name.use` (official/maiden/usual) et prénoms multiples partiellement rendus via le *name type code* (table 0200). Perte possible de la distinction nom de naissance / nom utilisé. |
| `Patient.birthDate` | PID | PID-7 | Date au format `YYYYMMDD`. Précision/fuseau des `dateTime` FHIR non conservés (donnée de type date). |
| `Patient.gender` | PID | PID-8 | Table HL7 0001 : `male→M`, `female→F`, `other→O`, `unknown→U`. La valeur `other` n'a pas d'équivalent aussi granulaire (voir section 9). |
| `Encounter.class` (`AMB`) | PV1 | PV1-2 | Table HL7 0004 : `AMB → O` (*Outpatient*). Réduction d'un code systémique (v3-ActCode) à un caractère : perte du système de codage. |
| `ServiceRequest.code` (LOINC `58410-2`) | OBR | OBR-4 | `code^libellé^LN`. **OBR n'appartient pas au message ADT standard** : voir 8.3 (segment porté par extension pédagogique). |
| `Organization` (autorité émettrice) | PID | PID-3-4 | Portée comme **autorité d'affectation** (composant HD : namespace & OID & ISO), non comme entité autonome. |

> Le tableau terminologique **détaillé** (jeux de valeurs, cardinalités, règles de conversion) est traité en **section 9**.

### 8.2 Exemple de message ADT^A04 (v2.5.1, données fictives)

```text
MSH|^~\&|ADM_LBM|LBM_PRIVE_TLS^1.2.250.1.71.4.2.2^ISO|SIL_LAB|LBM_PRIVE|20260915103000||ADT^A04^ADT_A01|MSG20260915-0001|P|2.5.1
EVN|A04|20260915103000|||AGT_ACCUEIL01
PID|1||285033155504217^^^ASIP-SANTE-INS-NIR&1.2.250.1.213.1.4.8&ISO^NI||DUBOIS^MARIE^^^^^L||19850312|F|||15 RUE DU TAUR^^TOULOUSE^^31000^FRA^H
PV1|1|O|LBM_PRIVE^^^LBM_PRIVE||||801234567^MARTIN^PAUL^^^^^^RPPS&1.2.250.1.71.4.2.1&ISO^^^^RPPS|||||||||||CONS
OBR|1|||58410-2^CBC panel - Blood by Automated count^LN|||20260915103000
```

Données fictives : Mme MARIE DUBOIS, née le 12/03/1985, sexe féminin, venue ambulatoire externe (`PV1-2=O`) au LBM privé, prescription de NFS (LOINC `58410-2`) par le Dr Paul MARTIN (RPPS fictif). Le matricule INS et le RPPS sont **fictifs**.

### 8.3 Limites de conversion identifiées

- **Statut de fiabilité de l'identité INS.** *Donnée :* identité « validée » / « qualifiée » (portée en FHIR par extension, ex. FR Core). *Cause :* le PID v2.5.1 n'a **pas de champ natif** pour ce statut. *Solution retenue :* convenir avec l'éditeur du SIL d'un porteur explicite (PID-32 *Identity Reliability Code*, table 0445, ou segment Z documenté) et tracer la convention en section 9.
- **Séparation admission / commande.** *Donnée :* `ServiceRequest.code` (NFS) transporté en **OBR-4**. *Cause :* le segment **OBR appartient aux messages de commande** (OML/ORM), pas au message **ADT** ; son inclusion dans l'ADT^A04 est une **extension pédagogique** du prototype. *Solution :* documenter que la demande devrait normalement circuler dans un message de commande dédié ; à arbitrer avec la partie technique et l'intégration SIL.
- **Réduction du codage `Encounter.class`.** *Donnée :* `class = AMB` (système v3-ActCode). *Cause :* PV1-2 (table 0004) n'accepte qu'un **code d'un caractère** (`O`), sans porter le système de codage d'origine. *Solution :* figer la règle `AMB → O` et la documenter (section 9).
- **Contexte de couverture Assurance Maladie.** *Donnée :* ressource `Coverage`. *Cause :* un ADT^A04 **minimal** (sans segments IN1/IN2) ne transporte pas la couverture. *Solution :* couverture laissée **hors périmètre** du prototype (voir section 4) ; à porter via IN1/IN2 si un besoin de facturation est ultérieurement retenu.

---

## Références (sources vérifiables)

- HL7 FHIR R4 (4.0.1) — spécification et API REST/transactions : `hl7.org/fhir/R4`, `hl7.org/fhir/R4/http.html`.
- HL7 v2.5.1 — Patient Administration (messages ADT, tables 0001/0004/0203) ; cadre IHE **PAM** et extension **PAM FR** (Interop'Santé / CI-SIS).
- LOINC — code `58410-2` « CBC panel - Blood by Automated count » : `loinc.org/58410-2` (panel avec formule : `57021-8`).
- ANS — **Référentiel INS** (matricule NIR/NIA, OID `1.2.250.1.213.1.4.8` / `…4.9`, traits d'identité) : `esante.gouv.fr`.
- **ReEIF** — Refined eHealth European Interoperability Framework, projet Antilope, eHealth Network (2015), Commission européenne.
