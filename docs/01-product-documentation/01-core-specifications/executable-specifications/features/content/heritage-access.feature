@content @draft
Feature: Regional heritage access
  As an Explorer
  I want heritage content unlocked with the province it belongs to
  So that discovery is rewarded with cultural beats and trivia

  Background:
    Given I am an authenticated Explorer

  @ready
  Scenario: Heritage is available for an unlocked province
    Given the province "HUE" is unlocked in my collection
    When I open the heritage for "HUE"
    Then I can see its cultural beats and trivia
    And content is shown in my preferred language

  @ready
  Scenario: Heritage is gated for a locked province
    Given the province "HUE" is locked in my collection
    When I attempt to open the heritage for "HUE"
    Then access is refused
    And I am prompted to unlock "HUE" first

  @ready
  Scenario: Unlocking a province grants heritage access
    Given the province "HUE" is locked in my collection
    When a "ProvinceUnlocked" event for "HUE" is processed
    Then heritage access for "HUE" is granted to me
