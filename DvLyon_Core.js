//=============================================================================
// DvLyon Games
// DvLyon_Core.js
//=============================================================================

var Imported = Imported || {};
Imported.DvLyon_Core = true;

var DvLyon = DvLyon || {};
DvLyon.Core = DvLyon.Core || {};
DvLyon.Core.version = 1.2;

/*:
-------------------------------------------------------------------------
@title DvLyon Core
@author DvLyon Games @ https://games.dvlyon.com
@date Dec 20, 2019
@version 1.2.0
@filename DvLyon_Core.js
@url https://games.dvlyon.com

Contact:

* Website: https://games.dvlyon.com
* Twitter: https://twitter.com/DvLyon

-------------------------------------------------------------------------------
@plugindesc DvLyon Core Functions
@help 
-------------------------------------------------------------------------------
== Description ==

DvLyon Core Functions and RMMV Settings Modifier.

== License ==

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

== Terms of Use ==

If you could credit DvLyon and https://games.dvlyon.com, we'd really
appreciate it!

We want to keep growing and making your RMMV experience better!

== Change Log ==

1.2.0 - Dec 20, 2019
 * (Removed) Removed commaSeparatedToIntArray helper, as it was basically the
 same as toIntArray.
 * (Cosmetic) Reordered plugin.
1.1.1 - Sep 30, 2019
 * (Bugfix) Small fix that breaks older versions of the plugin.
1.1.0 - Sep 6, 2019
 * (Feature) Added commaSeparatedToIntArray helper.
1.0.0 - Sep 2, 2019
 * (Release) Release.

== Usage ==

Install and configure parameters.

-------------------------------------------------------------------------------
 *
 * @param ScreenWidth
 * @text Screen Width
 * @desc Sets the screen width (Default: 816).
 * @default 816
 *
 * @param ScreenHeight
 * @text Screen Height
 * @desc Sets the screen height (Default: 624).
 * @default 624
 *
 * @param SkipTitle
 * @text Skip Title If No Save
 * @desc Skips the title scene (straight to map) if there's no save data. (Default: No.)
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
*/

//=============================================================================
// Helpers
//=============================================================================

function toNumber(str, def) {
	if (str === 0) return 0
	return isNaN(str) ? def : +(str || def)
}

function toText(str, def) {
	return str ? str : def
}

function toBool(str, def) {
	switch (str) {
		case 'true':
			return true
		case 'false':
			return false
		default:
			return !!def ? true : false
	}
}

function toDimColor(dim) {
	if (!dim) {
		return null
	}
	dim = dim.split(',')
	var dimColor = 'rgba('
	for (var i = 0; i < 4; i++) {
		dimColor += toNumber(dim[i], 0)
		if (i < 3) {
			dimColor += ','
		}
	}
	dimColor += ')'
	return dimColor
}

function toTone(tone) {
	tone = tone.split(',')
	var rgbg = []
	for (var i = 0; i < 3; i++) {
		rgbg.push(toNumber(tone[i] || 0).clamp(-255, 255))
	}
	rgbg.push(toNumber(tone[3] || 0).clamp(0, 255))
	return rgbg
}

function toRegion(str) {
	return Math.max(Math.min(toNumber(str, 0), 255), 0)
}

function circularDistance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

function toIntArray(array) {
	var intArray = []
	for (var i = 0; array && (i < array.length); i++) {
		var int = parseInt(array[i], 10)
		if (!isNaN(int)) {
			intArray.push(int)
		}
	}
	return intArray
}

//=============================================================================
// Definitions
//=============================================================================

/* Number */

Number.prototype.makeId = function() {
	return Math.floor(Math.max(this, 0))
}

//=============================================================================
// Declarations
//=============================================================================

/* Game_DvLyon */

var $gameDvLyon = null

function Game_DvLyon() {
	this.initialize.apply(this, arguments)
}

/* DvLyonTree */

function DvLyonTreeNode(data, extra) {
	this.data = data
	this.extra = extra
	this.children = []
}

function DvLyonTree() {
	this.root = null
}

//=============================================================================
// Plugin Start
//=============================================================================

(function() {

	//=============================================================================
	// Parameters
	//=============================================================================

	DvLyon.Core.Parameters = PluginManager.parameters('DvLyon_Core')

	DvLyon.Core.ScreenWidth = toNumber(DvLyon.Core.Parameters['ScreenWidth'], 816)
	DvLyon.Core.ScreenHeight = toNumber(DvLyon.Core.Parameters['ScreenHeight'], 624)
	DvLyon.Core.SkipTitle = toBool(DvLyon.Core.Parameters['SkipTitle'], false)

	//=============================================================================
	// Managers
	//=============================================================================

	/* DataManager */

	var _DataManager_createGameObjects = DataManager.createGameObjects
	DataManager.createGameObjects = function() {
		_DataManager_createGameObjects.call(this)
		$gameDvLyon = new Game_DvLyon()
	}

	var _DataManager_makeSaveContents = DataManager.makeSaveContents
	DataManager.makeSaveContents = function() {
		var contents = _DataManager_makeSaveContents.call(this)
		contents.dvlyon = $gameDvLyon
		return contents
	}

	var _DataManager_extractSaveContents = DataManager.extractSaveContents
	DataManager.extractSaveContents = function(contents) {
		_DataManager_extractSaveContents.call(this, contents)
		$gameDvLyon = contents.dvlyon
	}

	/* ImageManager */

	ImageManager.loadDvLyon = function(filename, hue) {
		return this.loadBitmap('img/dvlyon/', filename, hue, true)
	}

	ImageManager.reserveDvLyon = function(filename, hue, reservationId) {
		return this.reserveBitmap('img/dvlyon/', filename, hue, true, reservationId)
	}

	/* SceneManager */

	SceneManager._screenWidth = DvLyon.Core.ScreenWidth
	SceneManager._screenHeight = DvLyon.Core.ScreenHeight
	SceneManager._boxWidth = DvLyon.Core.ScreenWidth
	SceneManager._boxHeight = DvLyon.Core.ScreenHeight

	var _SceneManager_initNwjs = SceneManager.initNwjs
	SceneManager.initNwjs = function() {
		_SceneManager_initNwjs.call(this, arguments)
		if (Utils.isNwjs()) {
			var dw = DvLyon.Core.ScreenWidth - window.innerWidth
			var dh = DvLyon.Core.ScreenHeight - window.innerHeight
			window.moveBy(-dw / 2, -dh / 2)
			window.resizeBy(dw, dh)
		}
	}

	//=============================================================================
	// Objects
	//=============================================================================

	/* Game_Screen */

	var _Game_Screen_onBattleStart = Game_Screen.prototype.onBattleStart
	Game_Screen.prototype.onBattleStart = function() {
		_Game_Screen_onBattleStart.call(this)
		$gameDvLyon.onBattleStart()
	}

	var _Game_Screen_update = Game_Screen.prototype.update
	Game_Screen.prototype.update = function() {
		_Game_Screen_update.call(this)
		$gameDvLyon.screenUpdate()
	}

	/* Game_BattlerBase */

	Game_BattlerBase.prototype.isBadlyHurt = function() {
		return this.isAlive() && this._hp < this.mhp / 2 && !this.isDying()
	}

	Game_BattlerBase.prototype.isHurt = function() {
		return this.isAlive() && this._hp < this.mhp * 3 / 4 && !this.isBadlyHurt()
	}

	Game_BattlerBase.prototype.isOk = function() {
		return this.isAlive() && this._hp < this.mhp && !this.isHurt()
	}

	Game_BattlerBase.prototype.isPerfect = function() {
		return this.isAlive() && this._hp === this.mhp
	}

	/* Game_CharacterBase */
	
	Game_CharacterBase.prototype.isEvent = function() {
		return !!this._eventId
	}

	Game_CharacterBase.prototype.isPlayer = function() {
		return !this._eventId
	}

	//-----------------------------------------------------------------------------
	// Game_DvLyon
	//
	// The game object class for all things DvLyon.

	Game_DvLyon.prototype.initialize = function() {
		this.clear()
	}

	Game_DvLyon.prototype.clear = function() {}

	Game_DvLyon.prototype.screenUpdate = function() {}

	Game_DvLyon.prototype.onBattleStart = function() {}

	//=============================================================================
	// Scenes
	//=============================================================================

	/* Scene_Boot */

	var _Scene_Boot_start = Scene_Boot.prototype.start
	Scene_Boot.prototype.start = function() {
		if (DvLyon.Core.SkipTitle && !DataManager.isBattleTest() && !DataManager.isEventTest()
			&& !DataManager.isAnySavefileExists()) {
			Scene_Base.prototype.start.call(this)
			SoundManager.preloadImportantSounds()
			this.checkPlayerLocation()
			DataManager.setupNewGame()
			SceneManager.goto(Scene_Map)
			this.updateDocumentTitle()
		} else {
			_Scene_Boot_start.call(this)
		}
	}

	//=============================================================================
	// Windows
	//=============================================================================

	/* Window_Base */

	Window_Base.prototype.drawFace = function(faceName, faceIndex, x, y, width, height) {
		width = width || Window_Base._faceWidth
		height = height || Window_Base._faceHeight
		var bitmap = ImageManager.loadFace(faceName)
		var sw = Window_Base._faceWidth
		var sh = Window_Base._faceHeight
		var sx = faceIndex % 4 * sw
		var sy = Math.floor(faceIndex / 4) * sh
		this.contents.bltImage(bitmap, sx, sy, sw, sh, x, y, width, height)
	}

	//=============================================================================
	// Extra
	//=============================================================================

	//-----------------------------------------------------------------------------
	// DvLyonTree
	//
	// A tree structure.

	DvLyonTree.prototype.add = function(data, toNodeData, extra) {
		var node = new DvLyonTreeNode(data, extra)
		var parent = toNodeData ? this.findBFS(toNodeData) : null
		if (parent) {
			parent.children.push(node)
		} else {
			if (!this.root) {
				this.root = node
			} else {
				return
			}
		}
	}

	DvLyonTree.prototype.findBFS = function(data) {
		var queue = [this.root]
		if (queue) {
			while(queue.length) {
				var node = queue.shift()
				if (node.data === data) {
					return node
				}
				for (var i = 0; i < node.children.length; i++) {
					queue.push(node.children[i])
				}
			}
		}
		return null
	}

})()

//=============================================================================
// Plugin End
//=============================================================================

//=============================================================================
// Version Checker
//=============================================================================

function versionChecker() {
	var url = "https://raw.githubusercontent.com/dvlyon/RMMV-Free/master/versions.json"
	var request = new Request(url)
	fetch(request)
	.then(function(response) {
		return response.json()
	})
	.then(function(body) {
		if (body && (body.core > DvLyon.Core.version)) {
			var text = 'An updated version of DvLyon_Core is available at https://games.dvlyon.com'
			console.info(text)
		}
	})
}

versionChecker()