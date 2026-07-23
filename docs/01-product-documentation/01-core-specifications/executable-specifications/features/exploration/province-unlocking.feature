@exploration
Feature: Province unlocking
  As an Explorer
  I want a province to unlock when I capture my first Beat there
  So that my collection grows from where I have actually been

  Background:
    Given I am an authenticated Explorer
    And the province "HANOI" is locked in my collection

  @ready
  Scenario: Capturing the first Beat in a province unlocks it
    When a "BeatCaptured" event for a Beat in "HANOI" is processed
    Then "HANOI" appears in my collection
    And "HANOI" is shown with the unlocked map fill
    And a "ProvinceUnlocked" event is published

  @ready
  Scenario: A further Beat in an unlocked province does not unlock again
    Given the province "HANOI" is already unlocked
    When a "BeatCaptured" event for another Beat in "HANOI" is processed
    Then my collection is unchanged
    And no second "ProvinceUnlocked" event is published

  @ready
  Scenario: The map distinguishes unlocked provinces and public check-in heat
    Given the province "HANOI" is unlocked with public check-ins
    When I view the map
    Then "HANOI" is filled gold
    And its shade reflects its public check-in volume
