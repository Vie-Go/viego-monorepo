@content
Feature: Beat capture
  As an Explorer
  I want to capture a photo Beat at a place
  So that it auto-tags where I am and drives my streak, my map, and my friends' feeds

  Background:
    Given I am an authenticated Explorer
    And I am at the place "Giảng Café" in the province "HANOI"

  @ready
  Scenario: Capture a Beat and send it to friends
    Given I have selected the audience "Friends" with recipients "Linh, Đức, Mai, Khoa"
    When I capture a Beat
    Then the Beat is tagged with place "Giảng Café" and province "HANOI"
    And the Beat is delivered to "Linh, Đức, Mai, Khoa"
    And a "BeatCaptured" event is published

  @ready
  Scenario: Capture a public Beat
    Given I have selected the audience "Public"
    When I capture a Beat
    Then the Beat appears on the public map for "Giảng Café"
    And a "BeatCaptured" event is published

  @ready
  Scenario: A captured Beat is immutable
    Given I have captured a Beat at "Giảng Café"
    When I view that Beat later
    Then its photo, place, province, audience, and timestamp are unchanged

  @ready
  Scenario: Location is hidden outside Vietnam
    Given I am outside Vietnam
    When I open the camera
    Then my precise location is not shown
    And the Beat is not pinned to a precise point on the map

  @draft
  Scenario: A review requires a Beat at the place
    # TODO(product): confirm review eligibility + moderation (FR-CO-07)
    Given I have not captured a Beat at "Giảng Café"
    When I attempt to leave a review for "Giảng Café"
    Then the review is refused
    And I am told I must capture a Beat there first
