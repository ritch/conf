Feature: Create Project
	As someone creating a Hive project
	I want to be able to run a single command that creates a working project
	so that I can hit the ground running on my new project.

	Scenario: Create a Hello World Project using HAML at :1337
		Given I have entered <command> into the hive cli
		When I run create
		Then the <output> should point to a working project
		
		Examples:
			| command                                             | output                                        |
			| hive create hello-world at ~/hive/examples/ on 1337 | Project Created @ http://hello-world.dev:1337 |
			| hive create test                                    | Project Created @ http://test.dev:8080        |