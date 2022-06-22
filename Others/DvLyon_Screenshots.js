//=============================================================================
// Musubi Game Studio
// Musubi_Screenshot.js
//=============================================================================

var Imported = Imported || {};
Imported.Musubi_Screenshot = true;

var Musubi = Musubi || {};
Musubi.Screenshot = Musubi.Screenshot || {};
Musubi.Screenshot.version = 1;

/*:
-------------------------------------------------------------------------
@title Musubi Screenshot
@author Musubi @ https://gamestudio.musubiapp.com
@date Feb 21, 2019
@version 1.0.0
@filename Musubi_Screenshot.js
@url https://gamestudio.musubiapp.com

Contact:

* Main Website: https://gamestudio.musubiapp.com
* Twitter: https://twitter.com/MusubiTeam

-------------------------------------------------------------------------------
@plugindesc Musubi Screenshot
@help 
-------------------------------------------------------------------------------
== Description ==

Musubi Screenshot.

Just press PrtSc!

== License ==

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

== Terms of Use ==

If you could credit Musubi and https://gamestudio.musubiapp.com, we'd really
appreciate it!

We want to keep growing and making your RMMV experience better!

== Change Log ==

1.0.0 - Feb 21, 2019
 * Release.

== Usage ==

Install.

== Notes ==

-------------------------------------------------------------------------------

 *
*/

(function() {
	makeFileName = function() {
		var date = new Date()
		return date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate() + '' + date.getHours() + '' + date.getMinutes() + '' + date.getSeconds() + '.png'
	}

	takeScreenshot = function() {
		if (!Utils.isNwjs()) return

		var fs = require('fs')
		var path = './Screenshots'

		fs.mkdir(path, function() {
			var fileName = path + '/' + makeFileName()

			var snap = SceneManager.snap()
			var urlData = snap._canvas.toDataURL()
			var base64Data = urlData.replace(/^data:image\/png;base64,/, "")

			fs.writeFile(fileName, base64Data, 'base64')
		})
	}

	var _Input_onKeyUp = Input._onKeyUp
	Input._onKeyUp = function(event) {
		_Input_onKeyUp.call(this, event)
		if (event.keyCode === 44) {
			takeScreenshot()
		}
	}

})()