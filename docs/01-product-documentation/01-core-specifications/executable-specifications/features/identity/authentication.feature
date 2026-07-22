@identity @draft
Feature: Authentication
  As a visitor
  I want to sign in with my preferred provider
  So that my collection, streak, and preferences are saved to my account

  Scenario Outline: Sign in with a supported provider
    Given I am on the sign-in screen
    When I authenticate with "<provider>"
    Then I am signed in as an Explorer
    And an "ExplorerRegistered" event is published on first sign-in

    Examples:
      | provider |
      | Email    |
      | Google   |
      | Facebook |
      | Zalo     |

  @ready
  Scenario: Preferences persist across sessions
    Given I am an authenticated Explorer with language "vi" and theme "dark"
    When I sign in again on another device
    Then my language is "vi"
    And my theme is "dark"

  @draft
  Scenario: Account linking across providers
    # TODO(product): decide whether the same person using two providers is one Explorer
    Given I registered with "Google"
    When I later authenticate with "Email" using the same address
    Then the accounts are linked to a single Explorer
