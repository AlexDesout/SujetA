# Cahier des charges — Admission d'un patient en laboratoire de biologie médicale privé
## Cas d'usage : prélèvement pour une Numération Formule Sanguine (NFS)
### Partie terminologie, sécurité, validation & conformité — Sections 9 à 12

> Ces sections complètent les sections 1 à 8. Le contexte métier et les choix FHIR/HL7 déjà justifiés ne sont pas répétés.

---

## 9. Terminologies

Chaque choix terminologique est justifié dans le tableau ci-dessous. Les systèmes de codage FHIR sont mobilisés côté référentiel ; les tables HL7 v2 côté message SIL.

| Donnée | Terminologie | URL système | Code exemple | Justification | Perte lors du mapping FHIR→HL7v2 |
|---|---|---|---|---|---|
| **1. Type d'examen NFS** (`ServiceRequest.code`) | LOINC | `http://loinc.org` | `58410-2` | LOINC est la terminologie internationale de référence pour les examens de biologie, adoptée par FHIR et le CI-SIS pour le codage sémantique des analyses. **À signaler** : `58410-2` = « CBC panel » (hémogramme **sans** formule) ; la NFS *avec formule leucocytaire* correspond plutôt à `57021-8` — arbitrage à trancher. | Le code est porté sans altération en OBR-4 (`58410-2^…^LN`), mais la structure riche de `ServiceRequest` (`intent`, `priority`, `reasonCode`) n'est pas transportée par OBR-4 seul → **perte contextuelle**. |
| **2. Sexe administratif** (`Patient.gender`) | FHIR administrative-gender → HL7 v2 Table 0001 | `http://hl7.org/fhir/administrative-gender` → `http://terminology.hl7.org/CodeSystem/v2-0001` | `female → F` | Correspondance standardisée internationale entre `administrative-gender` et la table 0001 (PID-8). | **Perte partielle** : la valeur FHIR `other` n'a pas d'équivalent exact (mappée en `O`), `unknown → U` ; nuances de genre non représentées en v2.5.1. |
| **3. Classe de rencontre ambulatoire** (`Encounter.class`) | FHIR v3-ActCode → HL7 v2 Table 0004 | `http://terminology.hl7.org/CodeSystem/v3-ActCode` → `http://terminology.hl7.org/CodeSystem/v2-0004` | `AMB → O` | `AMB` (ambulatory) correspond à *Outpatient* (`O`) en PV1-2. Cohérent avec l'admission ambulatoire externe du LBM privé. | **Perte partielle** : réduction d'un code systémique à un caractère ; le système de codage d'origine (v3-ActCode) n'est pas conservé. |
| **4. Identifiant patient INS-NIR / INS-NIA** (`Patient.identifier`) | INS (référentiel ANS) — OID | `urn:oid:1.2.250.1.213.1.4.8` (NIR) / `urn:oid:1.2.250.1.213.1.4.9` (NIA) | Matricule 15 chiffres + OID | L'OID distingue le **NIR** (matricule pérenne, identité qualifiable via INSi) du **NIA** (numéro d'attente). Référencement obligatoire des données de santé avec l'INS pour le cercle de confiance (dont les LBM). | **Perte partielle** : PID-3 porte matricule + OID (PID-3-4) + type (PID-3-5), mais le **statut de fiabilité/qualification de l'INS** n'a pas de champ natif (workaround PID-32 / segment Z, cf. §8.3). |
| **5. Statut de la demande** (`ServiceRequest.status`) | FHIR ValueSet request-status → HL7 v2 ORC (tables 0119/0038) | `http://hl7.org/fhir/ValueSet/request-status` → `http://terminology.hl7.org/CodeSystem/v2-0038` | `active → IP` (in process) ; `completed → CM` | Le statut de la demande pilote le cycle de vie de la commande côté SIL (ORC-1 order control, ORC-5 order status). | **Perte notable** : le ValueSet `request-status` (7 valeurs) ne s'aligne pas 1:1 sur les tables ORC ; de plus le message **ADT^A04 ne porte pas de segment ORC** → dans le prototype, le statut **n'est pas transporté** (il transiterait par un message de commande OML/ORM). |

**Contrainte spécifique au LBM privé — codes NABM.** Le LOINC assure l'interopérabilité **clinique et sémantique**, mais ne suffit pas à la **facturation**. Un LBM privé conventionné doit coder l'acte dans la **NABM** (Nomenclature des Actes de Biologie Médicale, gérée par la CNAM) pour la prise en charge par l'Assurance Maladie : la NFS correspond au code NABM **`1104`** (« Hémogramme y compris plaquettes (NFS, NFP) », vérifié au Journal officiel). LOINC et NABM sont donc **complémentaires** — le premier pour l'échange de données, le second pour la tarification et la télétransmission. Le portage de la NABM relève de la facturation, **hors périmètre** du message ADT (cf. section 4).

---

## 10. Sécurité

### 10.1 Authentification et autorisation (théorique)

En production, l'accès aux API FHIR devrait être encadré par **SMART on FHIR**, profil d'autorisation bâti sur **OAuth 2.0** (et OpenID Connect pour l'authentification). Le principe : l'application d'admission obtient un **jeton d'accès** auprès d'un serveur d'autorisation, avec des **scopes** limitant finement les droits (par ex. lecture de `Patient`, écriture d'`Encounter`/`ServiceRequest`). Pour un échange serveur-à-serveur sans utilisateur interactif (module d'admission ↔ SIL), le flow **client_credentials** (SMART *Backend Services*) est le plus adapté ; pour un accès délégué par un professionnel, le flow **authorization_code** s'applique. Ce dispositif assure l'authentification des systèmes, l'autorisation granulaire et le socle de la traçabilité. **Ce qui est mis de côté dans le prototype** : aucune implémentation réelle d'OAuth2/SMART n'est réalisée, car le serveur public `https://hapi.fhir.org/baseR4` est un environnement de test **ouvert, sans fournisseur d'identité configuré**. Le prototype se concentre sur l'interopérabilité sémantique et structurelle avec des **données strictement fictives** ; la sécurisation réelle (jetons, scopes, chiffrement de bout en bout) devrait être spécifiée et éprouvée dans un environnement maîtrisé, distinct du serveur de démonstration.

### 10.2 Identitovigilance

L'**INS-NIR** est le matricule fondé sur le NIR (numéro de sécurité sociale), identité de référence **pérenne et qualifiable** via le téléservice INSi ; l'**INS-NIA** est un numéro d'**attente** temporaire, attribué lorsque le NIR n'est pas encore disponible, destiné à être régularisé. Au LBM privé, la fiabilité de cette identification conditionne tout le processus : c'est elle qui garantit le rattachement correct du prélèvement et des résultats au bon dossier. **Risque concret** : une erreur d'identité (homonymie, inversion de dossier, INS non vérifié) peut conduire à transmettre un résultat de NFS — révélant par exemple une anémie sévère ou une anomalie leucocytaire — **au dossier d'un autre patient** et donc au mauvais médecin, entraînant une décision médicale inadaptée ou un retard de prise en charge. **Obligations spécifiques du secteur privé** : le LBM appartient au « cercle de confiance » du **référentiel INS** de l'ANS, qui rend **obligatoire** le référencement des données de santé avec l'INS et la qualification de l'identité avant validation ; l'identité fiable est également requise par la **convention AM** pour la facturation, et l'identitovigilance de la phase pré-analytique est directement **auditée dans le cadre de l'accréditation COFRAC** (NF EN ISO 15189).

### 10.3 Traçabilité des échanges

Doivent être tracés, de façon horodatée et conservée conformément au RGPD : les **requêtes HTTP** émises vers `https://hapi.fhir.org/baseR4` (méthode, URL complète, ressource cible) ; les **codes retour HTTP** (200, 201, 4xx, 5xx) ; les ressources **`OperationOutcome`** retournées en cas d'erreur FHIR (`issue.severity`, `issue.code`, `issue.diagnostics`) ; et l'**horodatage des admissions** avec l'identité de l'agent, le patient concerné et l'examen prescrit. Cette journalisation soutient à la fois l'exigence de traçabilité **COFRAC** et la capacité d'audit imposée par le traitement de données de santé.

---

## 11. Validation et conformité

| Ressource/Message | Élément à valider | Règle | Outil |
|---|---|---|---|
| Ressource FHIR (`Patient`, `Encounter`, `ServiceRequest`) | Validité structurelle | JSON bien formé ; `resourceType` présent et correct ; conformité au schéma de base R4 | **HAPI FHIR Validator** (parsing + validation structurelle) |
| Profil (ex. FR Core) | Cardinalités et éléments *must-support* | Respect des contraintes du profil (cardinalités min/max, éléments obligatoires, `mustSupport`) | **HAPI FHIR Validator** avec l'IG chargé ; **Firely SDK** (validation par snapshot de profil) ; **Simplifier.net** (hébergement/publication des profils et IG) |
| Terminologie | Codes dans les ValueSets | `ServiceRequest.code` ∈ LOINC ; `Patient.gender` ∈ `administrative-gender` ; `Encounter.class` ∈ v3-ActCode | **HAPI FHIR Validator** adossé à un serveur de terminologie ; **Firely SDK** (validation terminologique) |
| Intégrité référentielle | `ServiceRequest.subject → Patient` valide | La référence pointe vers une ressource `Patient` existante et résolvable (y compris via `urn:uuid:` dans le Bundle transactionnel) | **HAPI FHIR Validator** (résolution de références) ; contrôle applicatif complémentaire |
| Message HL7 v2.5.1 (ADT^A04) | Présence des segments obligatoires | Segments **MSH, EVN, PID, PV1** présents ; `MSH-12 = 2.5.1` ; `PV1-2 = O` | **Bibliothèque HAPI HL7 v2** (`ca.uhn.hl7v2`, parsing et validation de structure v2) |

**Usage précis des outils.** Le **HAPI FHIR Validator** est le validateur de référence (CLI/Java) couvrant les niveaux structurel, profil, terminologique et référentiel des ressources FHIR. Le **Firely SDK** (.NET) offre une validation équivalente par profils et terminologies, utile pour recouper les résultats. **Simplifier.net** sert de **registre** d'hébergement et de publication des profils et ValueSets (IG), contre lesquels la validation est exécutée. La validation du **message HL7 v2.5.1** s'appuie sur la bibliothèque **HAPI HL7 v2**, distincte du validateur FHIR.

---

## 12. Critères d'acceptation (Gherkin)

> Les identifiants logiques `{id}`, `{encId}` et les matricules sont fictifs. Les requêtes visent le serveur réel `https://hapi.fhir.org/baseR4`.

**1. Création d'un nouveau patient avec INS-NIR dans un LBM privé**
```gherkin
GIVEN un LBM privé enregistrant un nouveau patient de matricule INS-NIR "285033155504217"
  AND ce patient n'existe pas encore dans le référentiel
WHEN je fais POST https://hapi.fhir.org/baseR4/Patient avec un Patient dont identifier.system vaut "urn:oid:1.2.250.1.213.1.4.8"
THEN le serveur retourne HTTP 201
  AND l'en-tête Location contient l'identifiant logique du Patient créé
  AND Patient.identifier contient le système "urn:oid:1.2.250.1.213.1.4.8"
```

**2. Recherche d'un patient existant par son INS**
```gherkin
GIVEN un patient enregistré avec l'INS-NIR "285033155504217" dans le LBM privé
WHEN je fais GET https://hapi.fhir.org/baseR4/Patient?identifier=urn:oid:1.2.250.1.213.1.4.8|285033155504217
THEN le serveur retourne HTTP 200
  AND le Bundle est de type "searchset"
  AND le Bundle contient au moins une ressource Patient
```

**3. Création d'un Encounter ambulatoire (class=AMB) associé au patient**
```gherkin
GIVEN un patient existant identifié par la référence "Patient/{id}"
WHEN je fais POST https://hapi.fhir.org/baseR4/Encounter avec Encounter.subject = "Patient/{id}" et Encounter.class.code = "AMB"
THEN le serveur retourne HTTP 201
  AND Encounter.class.system vaut "http://terminology.hl7.org/CodeSystem/v3-ActCode"
  AND Encounter.status est présent
```

**4. Création d'un ServiceRequest NFS avec le code LOINC 58410-2**
```gherkin
GIVEN un patient existant "Patient/{id}" et sa venue "Encounter/{encId}"
WHEN je fais POST https://hapi.fhir.org/baseR4/ServiceRequest avec code "58410-2" (system "http://loinc.org"), subject "Patient/{id}" et encounter "Encounter/{encId}"
THEN le serveur retourne HTTP 201
  AND ServiceRequest.code.coding contient le code "58410-2" du système "http://loinc.org"
  AND ServiceRequest.status appartient au ValueSet "http://hl7.org/fhir/ValueSet/request-status"
```

**5. Génération et validation du message ADT^A04 HL7 v2.5.1**
```gherkin
GIVEN un patient admis avec une venue ambulatoire et une demande de NFS validées dans le référentiel FHIR
WHEN le module d'admission génère le message HL7 v2.5.1 ADT^A04 correspondant
THEN le message contient les segments MSH, EVN, PID et PV1
  AND MSH-9 vaut "ADT^A04^ADT_A01" et MSH-12 vaut "2.5.1"
  AND PV1-2 vaut "O"
  AND la validation par un parseur HL7 v2.5.1 ne retourne aucune erreur de structure
```

**6. Gestion d'erreur : patient introuvable → OperationOutcome avec HTTP 404**
```gherkin
GIVEN aucun patient n'existe avec l'identifiant logique "patient-inexistant-0000" sur le serveur
WHEN je fais GET https://hapi.fhir.org/baseR4/Patient/patient-inexistant-0000
THEN le serveur retourne HTTP 404
  AND le corps de la réponse est une ressource OperationOutcome
  AND OperationOutcome.issue contient une entrée de severity "error"
```

> **Précision de conformité (critère 6).** Un **404 + `OperationOutcome`** n'est retourné que sur une **lecture par identifiant logique** (`GET /Patient/{id}`) d'une ressource inexistante — d'où la formulation ci-dessus. Une **recherche** par INS qui ne trouve rien (`GET /Patient?identifier=…`) renvoie au contraire **HTTP 200 avec un `searchset` vide** (`total = 0`) : ce cas relève du scénario **métier** de la section 5, et non d'une erreur technique 404.

---

## Références (sources vérifiables)

- LOINC — `58410-2` « CBC panel - Blood by Automated count » (`loinc.org/58410-2`) ; NFS avec formule : `57021-8`.
- HL7 Terminology — tables `v2-0001` (sexe), `v2-0004` (classe patient), `v2-0038`/`v2-0119` (ORC) : `terminology.hl7.org`.
- FHIR R4 — ValueSets `administrative-gender`, `request-status` (`hl7.org/fhir/R4`).
- ANS — Référentiel INS : OID `1.2.250.1.213.1.4.8` (NIR) / `1.2.250.1.213.1.4.9` (NIA) (`esante.gouv.fr`).
- CNAM — NABM, code `1104` « Hémogramme y compris plaquettes (NFS, NFP) » (Journal officiel).
- Outils : HAPI FHIR Validator & HAPI HL7 v2 (`hapifhir.io`), Firely SDK, Simplifier.net.
