"use strict";

//=============================================================================
// DvLyon
// RPG Maker MV - DvLyon_Core.js
//=============================================================================

var DvLyon = DvLyon || {};
DvLyon.Core = DvLyon.Core || {};
DvLyon.Core.version = 2;

/*:
@plugindesc Core Functions
@author DvLyon - https://dvlyon.com
@help 
== Description ==

Visit https://dvlyon.com/rmmv/plugins/core

== License ==

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

== Contributing ==

If you could credit DvLyon and https://dvlyon.com, I'd really
appreciate it!

@param ScreenWidth
@text Screen Width
@desc Sets the screen width (Default: 816).
@default 816

@param ScreenHeight
@text Screen Height
@desc Sets the screen height (Default: 624).
@default 624

@param SkipTitle
@text Skip Title If No Save
@desc Skips the title scene (straight to map) if there's no save data. (Default: No.)
@type boolean
@on Yes
@off No
@default false
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
	let dimColor = 'rgba('
	for (let i = 0; i < 4; i++) {
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
	let rgbg = []
	for (let i = 0; i < 3; i++) {
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
	let intArray = []
	for (let i = 0; array && (i < array.length); i++) {
		const int = parseInt(array[i], 10)
		if (!isNaN(int)) {
			intArray.push(int)
		}
	}
	return intArray
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const temp = array[i]
		array[i] = array[j]
		array[j] = temp
	}
	return array
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

	const _DataManager_createGameObjects = DataManager.createGameObjects
	DataManager.createGameObjects = function() {
		_DataManager_createGameObjects.call(this)
		$gameDvLyon = new Game_DvLyon()
	}

	const _DataManager_makeSaveContents = DataManager.makeSaveContents
	DataManager.makeSaveContents = function() {
		let contents = _DataManager_makeSaveContents.call(this)
		contents.dvlyon = $gameDvLyon
		return contents
	}

	const _DataManager_extractSaveContents = DataManager.extractSaveContents
	DataManager.extractSaveContents = function(contents) {
		_DataManager_extractSaveContents.call(this, contents)
		$gameDvLyon = contents.dvlyon
	}

	/* ConfigManager */

	ConfigManager.readText = function(config, name, def) {
		return config[name] || def
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

	const _SceneManager_initNwjs = SceneManager.initNwjs
	SceneManager.initNwjs = function() {
		_SceneManager_initNwjs.call(this, arguments)
		if (Utils.isNwjs()) {
			const dw = DvLyon.Core.ScreenWidth - window.innerWidth
			const dh = DvLyon.Core.ScreenHeight - window.innerHeight
			window.moveBy(-dw / 2, -dh / 2)
			window.resizeBy(dw, dh)
		}
	}

	SceneManager.isCurrentScene = function(sceneClass) {
		return this._scene && this._scene.constructor === sceneClass
	}

	//=============================================================================
	// Objects
	//=============================================================================

	/* Game_Screen */

	const _Game_Screen_onBattleStart = Game_Screen.prototype.onBattleStart
	Game_Screen.prototype.onBattleStart = function() {
		_Game_Screen_onBattleStart.call(this)
		$gameDvLyon.onBattleStart()
	}

	const _Game_Screen_update = Game_Screen.prototype.update
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

	Game_DvLyon.prototype.refreshAllWindows = function() {
		const scene = SceneManager._scene
		if (!!scene && !!scene._windowLayer) {
			const layer = scene._windowLayer
			if (!!layer.children) {
				layer.children.forEach(function(win) {
					win.resetFontSettings()
					if (!!win.refresh) {
						win.refresh()
					}
				})
			}
		}
	}

	//=============================================================================
	// Scenes
	//=============================================================================

	/* Scene_Boot */

	const _Scene_Boot_start = Scene_Boot.prototype.start
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

	Window_Base.prototype.drawIcon = function(iconIndex, x, y, width, height) {
		width = width || Window_Base._iconWidth
		height = height || Window_Base._iconHeight
		const bitmap = ImageManager.loadSystem('IconSet')
		const pw = Window_Base._iconWidth
		const ph = Window_Base._iconHeight
		const sx = iconIndex % 16 * pw
		const sy = Math.floor(iconIndex / 16) * ph
		this.contents.blt(bitmap, sx, sy, pw, ph, x, y, width, height)
	}

	Window_Base.prototype.drawFace = function(faceName, faceIndex, x, y, width, height) {
		width = width || Window_Base._faceWidth
		height = height || Window_Base._faceHeight
		const bitmap = ImageManager.loadFace(faceName)
		const sw = Window_Base._faceWidth
		const sh = Window_Base._faceHeight
		const sx = faceIndex % 4 * sw
		const sy = Math.floor(faceIndex / 4) * sh
		this.contents.bltImage(bitmap, sx, sy, sw, sh, x, y, width, height)
	}

	Window_Base.prototype.drawDvLyon = function(file, x, y, width, height) {
		const bitmap = ImageManager.loadDvLyon(file)
		const sw = bitmap.width
		const sh = bitmap.height
		this.contents.blt(bitmap, 0, 0, sw, sh, x, y, width, height)
	}

	//=============================================================================
	// Extra
	//=============================================================================

	//-----------------------------------------------------------------------------
	// DvLyonTree
	//
	// A tree structure.

	DvLyonTree.prototype.add = function(data, toNodeData, extra) {
		const node = new DvLyonTreeNode(data, extra)
		let parent = toNodeData ? this.findBFS(toNodeData) : null
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
		let queue = [this.root]
		if (queue) {
			while(queue.length) {
				const node = queue.shift()
				if (node.data === data) {
					return node
				}
				for (let i = 0; i < node.children.length; i++) {
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
	const url = "https://raw.githubusercontent.com/dvlyon/RMMV/main/versions.json"
	const request = new Request(url)
	fetch(request)
	.then(function(response) {
		return response.json()
	})
	.then(function(body) {
		if (body && body.core && (body.core.version > DvLyon.Core.version)) {
			const text = 'An updated version of DvLyon_Core is available at https://dvlyon.com/rmmv/plugins/core'
			console.info(text)
		}
	})
}

versionChecker()
