Feature: Fetching a file and saving it to a Database
	As a developer that is used to events
	I want to be able to bind to standard events on a file or a model including a change event
	so that I do not have to nest callbacks

	Scenario: Open a file and save its contents to a database
		Given I have an image foo.jpg
	    And I have opened foo.jpg
	    When I save foo.jpg as a database model
	    Then the testing database should contain the file