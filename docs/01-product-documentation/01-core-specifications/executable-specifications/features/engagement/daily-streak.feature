@engagement @draft
Feature: Daily discovery streak
  As an Explorer
  I want my consecutive days of discovery to be counted
  So that exploring Vietnamese culture becomes a rewarding daily ritual

  Background:
    Given I am an authenticated Explorer

  @ready
  Scenario: Completing the ritual advances the streak once per day
    Given my current streak is 3
    And I have not completed today's discovery ritual
    When I complete today's discovery ritual
    Then my current streak is 4
    And a "StreakAdvanced" event is published

  @ready
  Scenario: The streak does not advance twice on the same day
    Given my current streak is 4
    And I have already completed today's discovery ritual
    When I complete the discovery ritual again today
    Then my current streak remains 4

  @ready
  Scenario: Missing a day breaks the streak
    Given my current streak is 4
    And my last ritual was 2 days ago
    When the streak is evaluated
    Then my current streak is 0
    And my longest streak is still at least 4
    And a "StreakBroken" event is published

  @draft
  Scenario: Definition of the discovery ritual
    # TODO(product): define what completes the ritual and the timezone for "a day"
    Given the discovery ritual is defined
    When I perform the qualifying activity
    Then it counts toward today's streak
