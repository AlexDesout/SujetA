# Cahier des charges — Admission d'un patient en laboratoire de biologie médicale privé
## Cas d'usage : prélèvement pour une Numération Formule Sanguine (NFS)
### Partie métier — Sections 1 à 5

> Document de spécification métier destiné à cadrer le développement d'un prototype d'interopérabilité. Les propositions ci-dessous sont soumises à validation ; les points signalés « à confirmer par la partie technique » relèvent des sections 6 à 12.

---

## 1. Contexte et problématique

Un laboratoire de biologie médicale (LBM) privé de ville accueille des patients en **ambulatoire**, sans hospitalisation. Le patient se présente spontanément ou sur rendez-vous, muni d'une **ordonnance** établie par un médecin prescripteur, pour un prélèvement — ici une **NFS**. La phase d'**admission** (identification du patient, enregistrement de la venue, rattachement de la prescription) conditionne toute la suite du processus : qualité du prélèvement, rattachement des résultats au bon dossier, facturation et remboursement.

**Problématique d'interopérabilité.** Le prototype doit faire dialoguer deux mondes distincts :

- un **référentiel patient** modélisé selon **FHIR (R4)**, orienté ressources et pensé pour l'échange moderne de données de santé ;
- un **Système Informatique de Laboratoire (SIL)** qui, dans la très grande majorité des LBM privés installés, consomme des messages **HL7 v2** (ici un **ADT^A04**, enregistrement d'un patient externe).

L'admission consiste donc à récupérer une identité patient fiable côté FHIR, puis à en produire un message d'admission compréhensible par le SIL. La cohérence des identifiants entre ces deux représentations, ainsi que le choix de version FHIR et le code de l'examen, **devront être confirmés par la partie technique**.

**Enjeux spécifiques au secteur privé :**

- **Accréditation COFRAC (norme NF EN ISO 15189).** Le LBM privé est accrédité sur l'ensemble de son processus, phase pré-analytique comprise. L'admission engage directement deux exigences accréditées : l'**identitovigilance** (bonne identification du patient) et la **traçabilité** (qui a fait quoi, quand).
- **Conventions avec l'Assurance Maladie.** Le remboursement et la télétransmission supposent une identité patient fiable et, à terme, une **Identité Nationale de Santé (INS)** qualifiée. Une erreur d'identité à l'accueil se répercute sur la facturation.
- **RGPD.** Les données traitées sont des **données de santé** (catégorie particulière). Leur collecte, leur conservation et leur transmission au SIL doivent reposer sur une base légale, être minimisées et sécurisées.

---

## 2. Objectifs du prototype

Le prototype vise à démontrer, dans le cadre de l'évaluation académique, la faisabilité métier des points suivants :

- **O1 — Admission sans ressaisie.** Démontrer qu'un patient déjà connu peut être admis pour une NFS en **récupérant son identité depuis le référentiel** plutôt qu'en la ressaisissant manuellement.
- **O2 — Fiabilité de l'identification.** Démontrer que l'identité récupérée est **présentée à l'agent d'accueil pour contrôle** avant validation de l'admission (appui à l'identitovigilance).
- **O3 — Transmission vers le SIL.** Démontrer que l'admission validée est **transmise au SIL** sous une forme qu'il sait interpréter, sans intervention manuelle supplémentaire.
- **O4 — Prise en compte de l'INS.** Démontrer que le statut de l'identité (notamment la présence ou l'absence d'un **INS-NIR validé**) est pris en compte pour décider si l'admission peut se poursuivre nominalement.
- **O5 — Gestion des exceptions.** Démontrer le comportement du système sur **au moins deux cas d'erreur métier réalistes** (patient introuvable, ordonnance manquante).
- **O6 — Traçabilité de l'admission.** Démontrer que chaque admission laisse une **trace exploitable** (auteur, horodatage, patient concerné, examen).

Chaque objectif est formulé de façon à être **vérifiable par démonstration** lors de la soutenance.

---

## 3. Acteurs et rôles

**Acteurs humains :**

- **Patient.** Se présente à l'accueil avec son ordonnance et, idéalement, une pièce d'identité et sa carte Vitale. Fournit ou confirme ses informations d'identité.
- **Agent d'accueil (secrétaire du LBM).** Point d'entrée du processus. Recherche le patient dans le référentiel, contrôle visuellement l'identité, saisit ou complète les informations manquantes, valide l'admission et rattache l'examen prescrit.
- **Préleveur (technicien ou infirmier(ère) habilité(e)).** Réalise le prélèvement NFS après admission. Dans le périmètre du prototype, il **intervient en aval** de l'admission ; le geste de prélèvement n'est pas couvert (voir section 4).
- **Biologiste médical.** Responsable médical du LBM privé. Supervise l'identitovigilance, arbitre les cas d'exception (identité douteuse, procédure de secours) et engage sa responsabilité sur la validité du processus pré-analytique.
- **Médecin prescripteur.** Produit l'**ordonnance** en amont, hors les murs du laboratoire. N'interagit pas directement avec le système lors de l'admission ; il en est la **source de la prescription**.

**Acteurs systèmes :**

- **SIL (Système Informatique de Laboratoire).** Système opérationnel du LBM. **Destinataire** du message d'admission ; c'est lui qui ouvre le dossier de travail et pilotera ensuite le prélèvement et l'analyse.
- **Serveur / référentiel FHIR.** **Source de vérité de l'identité patient** interrogée à l'accueil. Le serveur de test `hapi.fhir.org/baseR4` sert de référentiel pour le prototype (usage de démonstration, **à confirmer par la partie technique**).

> Note : le recours éventuel à un **téléservice national d'identité (INSi)** pour qualifier l'INS relève d'un système externe ; son intégration réelle n'est pas dans le périmètre du prototype et est signalée à la partie technique.

---

## 4. Périmètre fonctionnel

### IN SCOPE — ce que le prototype fait

- **Rechercher un patient** dans le référentiel FHIR à partir de traits d'identité (nom, prénom, date de naissance).
- **Récupérer et afficher** l'identité du patient trouvé pour contrôle par l'agent d'accueil.
- **Enregistrer l'admission** d'un patient ambulatoire externe pour l'examen NFS.
- **Rattacher la prescription** (examen NFS et prescripteur) à l'admission, à partir des informations de l'ordonnance.
- **Produire un message d'admission** à destination du SIL (besoin métier ; forme technique — message ADT^A04 — **à confirmer par la partie technique**).
- **Gérer les deux cas d'erreur** décrits en section 5.2.
- **Tracer l'admission** (auteur, horodatage, patient, examen).

### OUT OF SCOPE — ce que le prototype ne fait pas

| Exclusion | Justification |
|---|---|
| **Prise de rendez-vous** | Étape en amont de l'admission ; sans impact sur la démonstration de l'interopérabilité identité/SIL. |
| **Facturation, télétransmission (FSE / SESAM-Vitale)** | Étape en aval, très réglementée, qui mobiliserait des briques conventionnelles Assurance Maladie hors sujet du prototype. |
| **Prescription électronique (e-prescription)** | Le prototype part d'une **ordonnance papier ou dématérialisée déjà existante** ; produire la prescription sort du cas d'usage « admission ». |
| **Rendu et transmission des résultats** | Relève de la phase post-analytique ; le prototype s'arrête à la **confirmation de prise en charge**. |
| **Geste de prélèvement et phase analytique** | Actes techniques et médicaux distincts de l'admission administrative. |
| **Qualification complète de l'INS via INSi** | L'appel au téléservice national est une brique externe ; le prototype se limite à **exploiter** le statut d'identité disponible dans le référentiel. |
| **Gestion multi-examens** | Le périmètre est volontairement borné à la **NFS** pour garder un cas d'usage maîtrisé et démontrable. |

Le périmètre est ainsi centré sur le **cœur métier de l'admission** et sur la **jonction FHIR → SIL**, ce qui permet une évaluation ciblée.

---

## 5. Scénario d'admission et besoins métier

### 5.1 Scénario nominal (étape par étape)

1. Le patient se présente à l'accueil du LBM privé et remet son **ordonnance** de NFS.
2. L'agent d'accueil demande une **pièce d'identité** et, le cas échéant, la carte Vitale.
3. L'agent **recherche le patient** dans le référentiel FHIR à partir de son nom, prénom et date de naissance.
4. Le système **retrouve le patient** et affiche son identité (traits d'identité et statut INS).
5. L'agent **contrôle visuellement** la concordance entre l'identité affichée et la pièce d'identité présentée.
6. L'agent **saisit les informations de la prescription** : examen demandé (NFS) et médecin prescripteur, à partir de l'ordonnance.
7. L'agent **valide l'admission** en tant que venue ambulatoire externe.
8. Le système **génère et transmet** l'admission au SIL (message d'admission ; forme technique à confirmer).
9. Le système **confirme la prise en charge** à l'agent (accusé d'enregistrement) et **trace** l'opération.
10. Le patient est **orienté vers le préleveur** (étape hors périmètre du prototype).

### 5.2 Scénarios d'erreur / exception

**Cas 1 — Patient non trouvé dans le référentiel FHIR**
- **Situation :** la recherche par nom, prénom et date de naissance ne retourne aucun résultat (patient nouveau, ou traits saisis différents de ceux enregistrés).
- **Conséquence métier :** l'admission ne peut pas s'appuyer sur une identité de référence ; risque d'erreur d'identification et de rattachement des résultats.
- **Action corrective attendue :** le système signale l'absence de correspondance et propose une **procédure d'identitovigilance** (nouvelle recherche avec des critères élargis ou corrigés, puis, si le patient reste inconnu, création d'une identité selon la procédure du laboratoire, avec un statut d'identité dégradé jusqu'à vérification). Le passage en identité de référence relève d'une étape ultérieure signalée à la partie technique.

**Cas 2 — Ordonnance absente ou illisible à l'accueil**
- **Situation :** le patient se présente sans ordonnance, ou avec une ordonnance illisible (examen prescrit ou prescripteur non identifiables).
- **Conséquence métier :** l'examen ne peut pas être rattaché de façon fiable à une prescription ; enjeu réglementaire et de remboursement dans un LBM privé conventionné.
- **Action corrective attendue :** le système **bloque la validation de l'admission** tant que l'examen prescrit et le prescripteur ne sont pas renseignés, et invite l'agent à obtenir une ordonnance lisible (report de l'admission ou recours au biologiste médical selon la procédure interne).

### 5.3 Besoins fonctionnels

- Le système doit permettre de **rechercher un patient** dans le référentiel FHIR à partir de son nom, prénom et date de naissance.
- Le système doit permettre d'**afficher l'identité et le statut d'identité** (dont l'INS) d'un patient trouvé, sans ressaisie.
- Le système doit permettre à l'agent d'accueil de **contrôler et confirmer** l'identité avant validation.
- Le système doit permettre de **saisir l'examen prescrit (NFS) et le prescripteur** à partir de l'ordonnance.
- Le système doit permettre d'**enregistrer une admission ambulatoire externe** pour le patient identifié.
- Le système doit permettre de **transmettre l'admission validée au SIL**.
- Le système doit permettre de **signaler les cas d'erreur** (patient introuvable, ordonnance manquante ou illisible) et d'orienter vers l'action corrective.
- Le système doit permettre de **tracer** chaque admission (auteur, horodatage, patient, examen).

### 5.4 Besoins non fonctionnels

- **Interopérabilité.** Le système doit exploiter l'identité issue du référentiel FHIR et produire une admission consommable par un SIL du marché privé. La cohérence des identifiants et des versions (FHIR R4, message d'admission) **est à valider par la partie technique**.
- **Sécurité (RGPD, contexte privé).** Les données de santé doivent être traitées de façon minimisée et sécurisée ; l'accès au système d'admission doit être **réservé au personnel habilité** du LBM. Les modalités techniques (chiffrement, authentification) sont renvoyées à la partie technique.
- **Traçabilité.** Toute admission doit être **horodatée et attribuée à son auteur**, en cohérence avec les exigences COFRAC du LBM privé.
- **Qualité des données.** Les traits d'identité utilisés doivent être **complets et cohérents** ; le système ne doit pas admettre un patient sur des données lacunaires sans procédure explicite.
- **Identitovigilance.** Le système doit soutenir la **vérification de l'identité** avant toute admission et distinguer une identité de référence (INS validée) d'une identité non vérifiée.

### 5.5 Données métier nécessaires à l'admission

| Donnée | Source | Obligatoire ? |
|---|---|---|
| Nom de naissance | Patient / référentiel FHIR | Obligatoire |
| Prénom(s) de naissance | Patient / référentiel FHIR | Obligatoire |
| Date de naissance | Patient / référentiel FHIR | Obligatoire |
| Sexe | Patient / référentiel FHIR | Obligatoire |
| Lieu de naissance (code INSEE) | Référentiel FHIR / pièce d'identité | Obligatoire pour une INS qualifiée |
| Matricule INS (INS-NIR ou INS-NIA) | Référentiel FHIR | Obligatoire pour une identité de référence |
| Statut de l'identité (validée / non validée) | Référentiel FHIR | Obligatoire |
| Coordonnées (adresse, téléphone) | Patient | Optionnel |
| Médecin prescripteur (identité, RPPS) | Ordonnance | Obligatoire |
| Examen prescrit (NFS) | Ordonnance | Obligatoire |
| Date de prescription | Ordonnance | Obligatoire |
| Type de prise en charge (ambulatoire externe) | Système | Obligatoire |
| Date et heure d'admission | Système | Obligatoire |
| Identifiant de la venue / admission | Système | Obligatoire |

> Ces données sont cohérentes avec les objets métier évoqués en contexte : identité **patient** (traits d'identité + INS), **prescription** (examen NFS et prescripteur) et **venue** d'admission. Leur formalisation en ressources FHIR relève des sections techniques.

### 5.6 Règles métier

- Un patient **sans INS-NIR validé** ne peut pas être admis en identité de référence sans **procédure d'identitovigilance** (identité en statut dégradé jusqu'à vérification).
- Si le patient est trouvé dans le référentiel avec une **identité validée**, ses traits d'identité **ne peuvent pas être modifiés manuellement** à l'accueil (données de référence) ; toute divergence doit être signalée.
- L'admission ne peut être validée que si **l'examen prescrit et le prescripteur** sont renseignés à partir de l'ordonnance.
- Toute admission validée doit **systématiquement générer une transmission vers le SIL**.
- Toute admission doit être **tracée** (auteur, horodatage) sans exception.
- En cas de doute sur l'identité, l'agent doit pouvoir **escalader vers le biologiste médical** avant de poursuivre.

### 5.7 Critères d'acceptation métier

1. Lorsque l'agent saisit le nom, le prénom et la date de naissance d'un patient existant, le système **affiche son identité issue du référentiel sans ressaisie manuelle** des traits d'identité.
2. Lorsque l'agent valide une admission de NFS pour un patient identifié, le système **confirme la prise en charge** et une **transmission vers le SIL** est effectuée.
3. Lorsque la recherche ne retourne aucun patient, le système **ne permet pas de poursuivre une admission en identité de référence** et **oriente vers la procédure d'identitovigilance**.
4. Lorsque l'examen prescrit ou le prescripteur n'est pas renseigné, le système **empêche la validation de l'admission** et l'indique clairement à l'agent.
