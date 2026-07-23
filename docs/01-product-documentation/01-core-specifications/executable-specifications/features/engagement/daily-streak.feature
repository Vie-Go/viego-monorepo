@engagement
Feature: Daily capture streak
  As an Explorer
  I want each day I capture a Beat to keep my streak burning
  So that exploring Vietnam becomes a rewarding daily ritual

  Background:
    Given I am an authenticated Explorer

  @ready
  Scenario: Capturing a Beat advances the streak once per day
    Given my current streak is 6
    And I have not captured a Beat today
    When a "BeatCaptured" event for me is processed today
    Then my current streak is 7
    And a "StreakAdvanced" event is published

  @ready
  Scenario: A second Beat on the same day does not advance the streak twice
    Given my current streak is 7
    And I have already captured a Beat today
    When a "BeatCaptured" event for me is processed again today
    Then my current streak remains 7

  @ready
  Scenario: Missing a day breaks the streak
    Given my current streak is 12
    And my last capture was 2 days ago
    When the streak is evaluated
    Then my current streak is 0
    And my longest streak is still at least 12
    And a "StreakBroken" event is published

  @ready
  Scenario: Reaching a milestone awards a badge
    Given my current streak is 6
    When a "BeatCaptured" event for me is processed today
    Then my current streak is 7
    And a "MilestoneReached" event for the badge "Tuần Rực Lửa" is published

  @draft
  Scenario: Definition of the day boundary
    # TODO(product): fix the timezone rule for what counts as "a day" (FR-EN-09)
    Given the streak day boundary is defined
    When I capture a Beat just before the boundary
    Then it counts toward the correct day's streak
