@social
Feature: Friends, feeds and reactions
  As an Explorer
  I want to add friends and see their beats as they happen
  So that VieGo is a shared, friends-first map of Vietnam

  Background:
    Given I am an authenticated Explorer

  @ready
  Scenario: Add a friend via an invite link
    Given "Minh" shared the invite link "viego.app/add/@minh.dq"
    When I open the invite link and accept
    Then "Minh" and I are friends
    And a "FriendAdded" event is published

  @ready
  Scenario: A friend's Beat appears in my friend feed
    Given "Đức" is my friend
    When "Đức" captures a Beat with an audience that includes me
    Then that Beat appears in my friend feed
    And it is marked with a "Friend" badge

  @ready
  Scenario: Public beats appear in Discover
    Given "@nomadngan" captured a public Beat at "Hội An Old Town"
    When I open Discover
    Then I can see "@nomadngan"'s Beat as social proof

  @ready
  Scenario: A friends-only Beat is not public
    Given "Linh" captured a Beat with audience "Friends" not including me
    When I open Discover
    Then I do not see "Linh"'s Beat

  @ready
  Scenario: React to a Beat
    Given a Beat from "Đức" is in my friend feed
    When I like the Beat
    Then the Beat's like count reflects my like
    And a "BeatReacted" event is published
