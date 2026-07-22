@exploration @draft
Feature: Province unlocking
  As an Explorer
  I want to unlock a province I have discovered
  So that its heritage becomes available and my collection grows

  Background:
    Given I am an authenticated Explorer
    And the province "HANOI" is locked in my collection

  @ready
  Scenario: Unlock an eligible province
    When I unlock the province "HANOI"
    Then "HANOI" appears in my collection
    And "HANOI" is shown with the unlocked map fill
    And a "ProvinceUnlocked" event is published

  @ready
  Scenario: A province cannot be unlocked twice
    Given the province "HANOI" is already unlocked
    When I unlock the province "HANOI"
    Then the request is rejected with "Province already unlocked"
    And my collection is unchanged

  @draft
  Scenario: Unlock condition must be met
    # TODO(product): define the actual unlock condition (proximity / trivia / tap / purchase)
    Given the unlock condition for "HANOI" is not yet met
    When I attempt to unlock the province "HANOI"
    Then the unlock is refused
    And I am told what is required to unlock it
