Feature: Editing task

   Feature Description

Scenario: Changing date of scheduled task
    Given the following task
        | id   | rescheduled-task          |
        | date | 2018-12-22T10:45:21.877Z  |
    And the task "rescheduled-task" is scheduled
    When I change task "rescheduled-task" date to "2018-12-22T10:50:21.877Z"
    Then the task "rescheduled-task" should not run at "2018-12-22T10:45:21.877Z"
    And the task "rescheduled-task" should run at "2018-12-22T10:50:21.877Z"

Scenario: Canceling task
    Given the following task
        | id   | cancel-task               |
        | date | 2018-12-22T10:45:21.877Z  |
    And the task "cancel-task" is scheduled
    When I change task "cancel-task" date to "2018-12-22T10:50:21.877Z"
    Then the task "cancel-task" should not run at "2018-12-22T10:45:21.877Z"
    And the task "cancel-task" should run at "2018-12-22T10:50:21.877Z"

Scenario: Deleting task
Scenario: Outdated task