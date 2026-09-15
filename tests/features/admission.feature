Feature: Admission flow
  Scenario: Recherche patient par INS et génération ADT
    Given un numéro INS valide "285033155504217"
    When le frontend recherche le patient
    Then le serveur retourne un Bundle FHIR
    And la génération ADT^A04 produit un message contenant PID
