# Hive 
*Version 0.1.3*

_Concise Cloud MVC Framework for **node.js**_

**Great For**

* Single Page Ajax Apps
* Mobile Web Apps
* ec2 / Rackspace Cloud / Heroku
* People who love JavaScript
* Thin Servers
* Restful JSON APIs
* Realtime
* Geo

**Not Great For**

* SQL
* Windows
* State-on-the-Server
* People who hate JavaScript

## You'll Need

* [mongodb](http://www.mongodb.org/downloads)
* [node.js](https://sites.google.com/site/nodejsmacosx/)
* [npm](http://npmjs.org/)

## Installation

    npm install hive

## Hello World

	mkdir -p ~/hive-projects
	cd ~/hive-projects
	hive new hello-world
	cd hello-world
	hive model Widget
	hive -p

## Tour

<iframe width="560" height="349" src="http://www.youtube.com/embed/4YrsIzLZbbs" frameborder="0" allowfullscreen></iframe>

## Installing for Development

* Fork this repo and clone it into ```~/node-modules/hive```
* In the repo install the dependencies with ```npm install -g```
* Run the tests in the test folder with ```vows *.js --spec```

## License 

**MIT License**

Copyright (c) 2011 Ritchie Martori

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
