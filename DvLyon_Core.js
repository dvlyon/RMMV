//=============================================================================
// DvLyon Games
// DvLyon_Core.js
//=============================================================================

var Imported = Imported || {};
Imported.DvLyon_Core = true;

var DvLyon = DvLyon || {};
DvLyon.Core = DvLyon.Core || {};
DvLyon.Core.version = 1;

/*:
-------------------------------------------------------------------------
@title DvLyon Core
@author DvLyon Games @ https://games.dvlyon.com
@date Sep 2, 2019
@version 1.0.0
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

1.0.0 - Sep 2, 2019
 * Release.

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
// Definitions
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
			return def ? true : false
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

/* Number */

Number.prototype.makeId = function() {
	return Math.floor(Math.max(this, 0))
}

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

	/* Parameters */

	DvLyon.Core.Parameters = PluginManager.parameters('DvLyon_Core')

	DvLyon.Core.ScreenWidth = toNumber(DvLyon.Core.Parameters['ScreenWidth'], 816)
	DvLyon.Core.ScreenHeight = toNumber(DvLyon.Core.Parameters['ScreenHeight'], 624)

	DvLyon.Core.SkipTitle = toBool(DvLyon.Core.Parameters['SkipTitle'], false)

	/* DataManager */

	var _DataManager_createGameObjects = DataManager.createGameObjects
	DataManager.createGameObjects = function() {
		_DataManager_createGameObjects.call(this)
		$gameDvLyon = new Game_DvLyon()
	}

	var _DataManager_makeSaveContents = DataManager.makeSaveContents
	DataManager.makeSaveContents = function() {
		var contents = _DataManager_makeSaveContents.call(this)
		contents.foundation = $gameDvLyon
		return contents
	}

	var _DataManager_extractSaveContents = DataManager.extractSaveContents
	DataManager.extractSaveContents = function(contents) {
		_DataManager_extractSaveContents.call(this, contents)
		$gameDvLyon = contents.foundation || new Game_DvLyon()
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

	/* ImageManager */

	ImageManager.loadDvLyon = function(filename, hue) {
		return this.loadBitmap('img/dvlyon/', filename, hue, true)
	}

	ImageManager.reserveDvLyon = function(filename, hue, reservationId) {
		return this.reserveBitmap('img/dvlyon/', filename, hue, true, reservationId)
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

	/* Game_Screen */

	var _Game_Screen_update = Game_Screen.prototype.update
	Game_Screen.prototype.update = function() {
		_Game_Screen_update.call(this)
		$gameDvLyon.screenUpdate()
	}

	var _Game_Screen_onBattleStart = Game_Screen.prototype.onBattleStart
	Game_Screen.prototype.onBattleStart = function() {
		_Game_Screen_onBattleStart.call(this)
		$gameDvLyon.onBattleStart()
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

	/* Scene_Menu */

	Scene_Menu.prototype.start = function() {
		Scene_MenuBase.prototype.start.call(this)
	}

	Scene_Menu.prototype.createGoldWindow = function() {}

	Scene_Menu.prototype.createStatusWindow = function() {}

	Scene_Menu.prototype.commandPersonal = function() {
		SceneManager.push(Scene_GSParty)
	}

	Scene_Menu.prototype.commandFormation = function() {
		SceneManager.push(Scene_GSParty)
	}

	/* Scene_ItemBase */

	Scene_ItemBase.prototype.createActorWindow = function() {
		this._actorWindow = new Window_MenuActor()
		this._actorWindow.setHandler('ok', this.onActorOk.bind(this))
		this._actorWindow.setHandler('cancel', this.onActorCancel.bind(this))
		this._actorWindow.reservePetImages()
		this.addWindow(this._actorWindow)
	}

	Scene_ItemBase.prototype.itemTargetActors = function() {
		var action = new Game_Action(this.user())
		action.setItemObject(this.item())
		if (!action.isForFriend()) {
			return []
		} else if (action.isForAll()) {
			return $gameDLGSParty.members()
		} else {
			return [$gameDLGSParty.members()[this._actorWindow.index()]]
		}
	}

	Scene_ItemBase.prototype.onActorOk = function() {
		if (this.canUse()) {
			this.useItem()
		} else {
			SoundManager.playBuzzer()
		}
		this._actorWindow.activate()
	}

	/* Scene_Item */

	var _Scene_Item_create = Scene_Item.prototype.create
	Scene_Item.prototype.create = function() {
		_Scene_Item_create.call(this)

		this._helpWindow.y = Graphics.boxHeight - this._helpWindow.height

		this._categoryWindow.y = 0
		this._categoryWindow.height = Graphics.boxHeight - this._helpWindow.height

		this._itemWindow.y = 0
		this._itemWindow.x = this._categoryWindow.width
		this._itemWindow.width = Graphics.boxWidth - this._categoryWindow.width
		this._itemWindow.height = Graphics.boxHeight - this._helpWindow.height

		this._actorWindow.hide()
		this._actorWindow.deactivate()
	}

	Scene_Item.prototype.user = function() {
		var members = $gameDLGSParty.movableMembers()
		var bestActor = members[0]
		var bestPha = 0
		for (var i = 0; i < members.length; i++) {
			if (members[i].pha > bestPha) {
				bestPha = members[i].pha
				bestActor = members[i]
			}
		}
		return bestActor
	}

	Scene_Item.prototype.onItemOk = function() {
		this._actorWindow.refresh()
		$gameDLGSParty.setLastItem(this.item())
		this.determineItem()
	}

	//-----------------------------------------------------------------------------
	// Scene_GSParty
	//
	// The scene class of the menu screen.

	function Scene_GSParty() {
		this.initialize.apply(this, arguments)
	}

	Scene_GSParty.prototype = Object.create(Scene_MenuBase.prototype)
	Scene_GSParty.prototype.constructor = Scene_GSParty

	Scene_GSParty.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this)
	}

	Scene_GSParty.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this)
		this.createStatusWindow()
		this.createCommandWindow()
	}

	Scene_GSParty.prototype.start = function() {
		Scene_MenuBase.prototype.start.call(this)
		this._statusWindow.refresh()
	}

	Scene_GSParty.prototype.createStatusWindow = function() {
		this._statusWindow = new Window_MenuActor()
		this._statusWindow.setHandler('ok', this.commandPersonal.bind(this))
		this._statusWindow.setHandler('cancel', this.popScene.bind(this))
		this._statusWindow.reservePetImages()
		this.addWindow(this._statusWindow)
	}

	Scene_GSParty.prototype.commandPersonal = function() {
		var index = this._statusWindow.index()
		var pendingIndex = this._statusWindow.pendingIndex()
		if (pendingIndex >= 0) {
			$gameDLGSParty.swapOrder(index, pendingIndex)
			this._statusWindow.setPendingIndex(-1)
	    	this._statusWindow.redrawItem(index)
	    	this._statusWindow.activate()
		} else {
			this._commandWindow.open()
			this._commandWindow.activate()
		}
	}

	Scene_GSParty.prototype.createCommandWindow = function() {
		this._commandWindow = new Window_GSPartyCommand()
		this._commandWindow.setHandler('status',  this.onPersonalOk.bind(this))
		this._commandWindow.setHandler('switch', this.commandSwitch.bind(this))
		this._commandWindow.setHandler('cancel',  this.onPersonalCancel.bind(this))
		this.addWindow(this._commandWindow)
	}

	Scene_GSParty.prototype.onPersonalOk = function() {
		SceneManager.push(Scene_Status)
	}

	Scene_GSParty.prototype.commandSwitch = function() {
		this._statusWindow.setPendingIndex(this._statusWindow.index())
		this.onPersonalCancel()
	}

	Scene_GSParty.prototype.onPersonalCancel = function() {
		this._commandWindow.close()
		this._statusWindow.activate()
	}

	//-----------------------------------------------------------------------------
	// Scene_GSBox
	//
	// The scene class of the menu screen.

	function Scene_GSBox() {
		this.initialize.apply(this, arguments)
	}

	Scene_GSBox.prototype = Object.create(Scene_MenuBase.prototype)
	Scene_GSBox.prototype.constructor = Scene_GSBox

	Scene_GSBox.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this)
	}

	Scene_GSBox.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this)
		this.createHelpWindow()
		this.createStatusWindow()
		this.createCommandWindow()
		this.createPartyWindow()
	}

	Scene_GSBox.prototype.start = function() {
		Scene_MenuBase.prototype.start.call(this)
		this._statusWindow.refresh()
	}

	Scene_GSBox.prototype.createHelpWindow = function() {
		this._helpWindow = new Window_GSBoxHelp(1)
		this.addWindow(this._helpWindow)
	}

	Scene_GSBox.prototype.createStatusWindow = function() {
		var y = this._helpWindow.height
		this._statusWindow = new Window_GSBox(0, y)
		this._statusWindow.setHelpWindow(this._helpWindow)
		this._statusWindow.setHandler('ok', this.commandPersonal.bind(this))
		this._statusWindow.setHandler('cancel', this.popScene.bind(this))
		this._statusWindow.reservePetImages()
		this.addWindow(this._statusWindow)
	}

	Scene_GSBox.prototype.commandPersonal = function() {
		var index = this._statusWindow.index()
		var pendingIndex = this._statusWindow.pendingIndex()
		if (pendingIndex >= 0) {
			$gameDLGSBox.swapOrder(index, pendingIndex)
			this._statusWindow.setPendingIndex(-1)
	    	this._statusWindow.redrawItem(index)
	    	this._statusWindow.activate()
		} else {
			this._commandWindow.open()
			this._commandWindow.activate()
		}
	}

	Scene_GSBox.prototype.createCommandWindow = function() {
		this._commandWindow = new Window_GSBoxCommand()
		this._commandWindow.setHandler('addToParty', this.commandAddToParty.bind(this))
		this._commandWindow.setHandler('status',  this.onPersonalOk.bind(this))
		this._commandWindow.setHandler('switch', this.commandSwitch.bind(this))
		this._commandWindow.setHandler('cancel',  this.onPersonalCancel.bind(this))
		this.addWindow(this._commandWindow)
	}

	Scene_GSBox.prototype.commandAddToParty = function() {
		if ($gameDLGSParty.size() >= $gameDLGSParty.maxBattleMembers()) {
			this._partyWindow.open()
			this._partyWindow.activate()
			this._partyWindow.refresh()
		} else {
			var index = this._statusWindow.index()
			var id = $gameDLGSBox.members()[index]._petId
			$gameDLGSParty.pushOutside(id)
			$gameDLGSBox.removeActor(id)
			this._statusWindow.refresh()
			this._statusWindow.selectLast()
			this.onPersonalCancel()
		}
	}

	Scene_GSBox.prototype.onPersonalOk = function() {
		SceneManager.push(Scene_GSBoxStatus)
	}

	Scene_GSBox.prototype.commandSwitch = function() {
		this._statusWindow.setPendingIndex(this._statusWindow.index())
		this.onPersonalCancel()
	}

	Scene_GSBox.prototype.onPersonalCancel = function() {
		this._commandWindow.close()
		this._statusWindow.activate()
	}

	Scene_GSBox.prototype.createPartyWindow = function() {
		this._partyWindow = new Window_MenuActor()
		this._partyWindow.setHandler('ok', this.commandSwitchBoxPartyOk.bind(this))
		this._partyWindow.setHandler('cancel', this.commandSwitchBoxPartyCancel.bind(this))
		this._partyWindow.reservePetImages()
		this._partyWindow.close()
		this._partyWindow.deactivate()
		this.addWindow(this._partyWindow)
	}

	Scene_GSBox.prototype.commandSwitchBoxPartyOk = function() {
		var boxIndex = this._statusWindow.index()
		var boxPetId = $gameDLGSBox.members()[boxIndex]._petId
		var partyIndex = this._partyWindow.index()
		var partyPetId = $gameDLGSParty.members()[partyIndex]._petId
		$gameDLGSBox.swapOutside(boxIndex, partyPetId)
		$gameDLGSParty.swapOutside(partyIndex, boxPetId)
		this._statusWindow.redrawItem(boxIndex)
		this._partyWindow.redrawItem(partyIndex)
		this.commandSwitchBoxPartyCancel()
	}

	Scene_GSBox.prototype.commandSwitchBoxPartyCancel = function() {
		this._partyWindow.close()
		this._partyWindow.deactivate()
		this._commandWindow.close()
		this._commandWindow.deactivate()
		this._statusWindow.activate()
	}

	/* Scene_Status */

	Scene_Status.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this)
		this._statusWindow = new Window_Status()
		this._statusWindow.setHandler('cancel', this.popScene.bind(this))
		this._statusWindow.setHandler('pagedown', this.nextActor.bind(this))
		this._statusWindow.setHandler('pageup', this.previousActor.bind(this))
		this._statusWindow.reservePetImages()
		this.addWindow(this._statusWindow)
	}

	Scene_Status.prototype.start = function() {
		Scene_MenuBase.prototype.start.call(this)
		this.refreshActor()
	}

	Scene_Status.prototype.refreshActor = function() {
		var actor = this.actor()
		this._statusWindow.setActor(actor)
	}

	Scene_Status.prototype.nextActor = function() {
		$gameDLGSParty.makeMenuActorNext()
		this.updateActor()
		this.onActorChange()
	}

	Scene_Status.prototype.previousActor = function() {
		$gameDLGSParty.makeMenuActorPrevious()
		this.updateActor()
		this.onActorChange()
	}

	Scene_Status.prototype.onActorChange = function() {
		this.refreshActor()
		this._statusWindow.activate()
	}

	Scene_Status.prototype.updateActor = function() {
		this._actor = $gameDLGSParty.menuActor()
	}

	//-----------------------------------------------------------------------------
	// Scene_GSBoxStatus
	//
	// The scene class of the status screen.

	function Scene_GSBoxStatus() {
		this.initialize.apply(this, arguments)
	}

	Scene_GSBoxStatus.prototype = Object.create(Scene_Status.prototype)
	Scene_GSBoxStatus.prototype.constructor = Scene_GSBoxStatus

	Scene_GSBoxStatus.prototype.nextActor = function() {
		$gameDLGSBox.makeMenuActorNext()
		this.updateActor()
		this.onActorChange()
	}

	Scene_GSBoxStatus.prototype.previousActor = function() {
		$gameDLGSBox.makeMenuActorPrevious()
		this.updateActor()
		this.onActorChange()
	}

	Scene_GSBoxStatus.prototype.updateActor = function() {
		this._actor = $gameDLGSBox.menuActor()
	}

	/* Scene_Shop */

	Scene_Shop.prototype.doBuy = function(number) {
		$gameDLGSParty.loseGold(number * this.buyingPrice())
		$gameDLGSParty.gainItem(this._item, number)
	}

	Scene_Shop.prototype.doSell = function(number) {
		$gameDLGSParty.gainGold(number * this.sellingPrice())
		$gameDLGSParty.loseItem(this._item, number)
	}

	Scene_Shop.prototype.maxBuy = function() {
		var max = $gameDLGSParty.maxItems(this._item) - $gameDLGSParty.numItems(this._item)
		var price = this.buyingPrice()
		if (price > 0) {
			return Math.min(max, Math.floor(this.money() / price))
		} else {
			return max
		}
	}

	Scene_Shop.prototype.maxSell = function() {
		return $gameDLGSParty.numItems(this._item)
	}

	/* Scene_Battle */

	Scene_Battle.prototype.start = function() {
		Scene_Base.prototype.start.call(this)
		this.startFadeIn(this.fadeSpeed(), false)
		BattleManager.playBattleBgm()
		BattleManager.startBattle()
	}

	var _Scene_Battle_update = Scene_Battle.prototype.update
	Scene_Battle.prototype.update = function() {
		var active = this.isActive()
		if (active && !this.isBusy()) {
			this.updateFaces()
		}
		_Scene_Battle_update.call(this)
	}

	Scene_Battle.prototype.updateFaces = function() {
		if (BattleManager.needReloadFaces()) {
			BattleManager.reloadFaces(false)
			this._actorWindow.refresh()
		}
	}

	Scene_Battle.prototype.updateBattleProcess = function() {
		if (!this.isAnyInputWindowActive() ||
			BattleManager.isAborting() ||
			BattleManager.isBattleEnd()) {
			BattleManager.update()
			this.changeInputWindow()
		}
	}

	Scene_Battle.prototype.isAnyInputWindowActive = function() {
		return (this._actorCommandWindow.active ||
			this._skillWindow.active ||
			this._itemWindow.active ||
			this._actorWindow.active)
	}

	Scene_Battle.prototype.changeInputWindow = function() {
		if (BattleManager.isInputting()) {
			if (BattleManager.actor()) {
				this.startActorCommandSelection()
				this._miyokoEnemyTameWindow.open()
			}
		} else {
			this.endCommandSelection()
		}
	}

	Scene_Battle.prototype.stop = function() {
		Scene_Base.prototype.stop.call(this)
		if (this.needsSlowFadeOut()) {
			this.startFadeOut(this.slowFadeSpeed(), false)
		} else {
			this.startFadeOut(this.fadeSpeed(), false)
		}
		this._actorCommandWindow.close()
		this._miyokoPlayerWindow.close()
		this._miyokoEnemyWindow.close()
	}

	Scene_Battle.prototype.terminate = function() {
		Scene_Base.prototype.terminate.call(this)
		$gameDLGSParty.onBattleEnd()
		$gameTroop.onBattleEnd()
		AudioManager.stopMe()
		ImageManager.clearRequest()
	}

	Scene_Battle.prototype.updateStatusWindow = function() {}

	Scene_Battle.prototype.updateWindowPositions = function() {}

	Scene_Battle.prototype.createDisplayObjects = function() {
		this.createSpriteset()
		this.createWindowLayer()
		this.createAllWindows()
		BattleManager.setLogWindow(this._logWindow)
		BattleManager.addStatusWindow(this._miyokoPlayerWindow)
		BattleManager.addStatusWindow(this._miyokoPlayerTeamWindow)
		BattleManager.addStatusWindow(this._miyokoEnemyWindow)
		BattleManager.addStatusWindow(this._miyokoEnemyTameWindow)
		BattleManager.addStatusWindow(this._miyokoEnemyTeamWindow)
		BattleManager.setSpriteset(this._spriteset)
		this._logWindow.setSpriteset(this._spriteset)
	}

	Scene_Battle.prototype.createAllWindows = function() {
		this.createLogWindow()
		this.createMiyokoPlayerWindow()
		this.createMiyokoPlayerTeamWindow()
		this.createMiyokoEnemyWindow()
		this.createMiyokoEnemyTameWindow()
		this.createMiyokoEnemyTeamWindow()
		this.createActorCommandWindow()
		this.createHelpWindow()
		this.createSkillWindow()
		this.createItemWindow()
		this.createActorWindow()
		this.createMessageWindow()
		this.createScrollTextWindow()
	}

	Scene_Battle.prototype.createActorCommandWindow = function() {
		this._actorCommandWindow = new Window_ActorCommand()
		this._actorCommandWindow.setHandler('fight', this.commandMiyokoFight.bind(this))
		this._actorCommandWindow.setHandler('switch', this.commandSwitch.bind(this))
		this._actorCommandWindow.setHandler('item', this.commandItem.bind(this))
		this._actorCommandWindow.setHandler('run', this.commandEscape.bind(this))
		this.addWindow(this._actorCommandWindow)
	}

	Scene_Battle.prototype.commandMiyokoFight = function() {
		this._actorCommandWindow.deactivate()
		this._skillWindow.setActor(BattleManager.actor())
		this._skillWindow.selectLast()
		this._skillWindow.show()
		this._skillWindow.activate()
	}

	Scene_Battle.prototype.commandSwitch = function() {
		this.selectActorSelection()
	}

	Scene_Battle.prototype.createMiyokoPlayerWindow = function() {
		this._miyokoPlayerWindow = new Window_MiyokoPlayer()
		this.addWindow(this._miyokoPlayerWindow)
	}

	Scene_Battle.prototype.createMiyokoPlayerTeamWindow = function() {
		this._miyokoPlayerTeamWindow = new Window_MiyokoPlayerTeam()
		this.addWindow(this._miyokoPlayerTeamWindow)
	}

	Scene_Battle.prototype.createMiyokoEnemyWindow = function() {
		this._miyokoEnemyWindow = new Window_MiyokoEnemy()
		this.addWindow(this._miyokoEnemyWindow)
	}

	Scene_Battle.prototype.createMiyokoEnemyTameWindow = function() {
		this._miyokoEnemyTameWindow = new Window_MiyokoEnemyTame()
		this.addWindow(this._miyokoEnemyTameWindow)
	}

	Scene_Battle.prototype.createMiyokoEnemyTeamWindow = function() {
		this._miyokoEnemyTeamWindow = new Window_MiyokoEnemyTeam()
		this.addWindow(this._miyokoEnemyTeamWindow)
	}

	Scene_Battle.prototype.createSkillWindow = function() {
		this._skillWindow = new Window_BattleSkill()
		this._skillWindow.setHandler('ok', this.onSkillOk.bind(this))
		this._skillWindow.setHandler('cancel', this.onSkillCancel.bind(this))
		this.addWindow(this._skillWindow)
	}

	Scene_Battle.prototype.selectNextCommand = function() {
		BattleManager.selectNextCommand()
		this.changeInputWindow()
	}

	Scene_Battle.prototype.selectEnemySelection = function() {
		var action = BattleManager.inputtingAction()
		action.setTarget(0)
		this._skillWindow.hide()
		this._itemWindow.hide()
		this.selectNextCommand()
	}

	Scene_Battle.prototype.onSkillOk = function() {
		var skill = this._skillWindow.item()
		var action = BattleManager.inputtingAction()
		action.setSkill(skill.id)
		BattleManager.actor().setLastBattleSkill(skill)
		this.onSelectAction()
	}

	Scene_Battle.prototype.createActorWindow = function() {
		this._actorWindow = new Window_BattleActor()
		this._actorWindow.setHandler('ok', this.onActorOk.bind(this))
		this._actorWindow.setHandler('cancel', this.onActorCancel.bind(this))
		this._actorWindow.setHandler('forcedSwitch', this.commandForcedSwitch.bind(this))
		this.addWindow(this._actorWindow)
	}

	Scene_Battle.prototype.onActorOk = function() {
		if (this._actorCommandWindow.currentSymbol() === 'switch') {
			if (BattleManager.actor().index() === this._actorWindow.index()) {
				this.onActorCancel()
				return
			} else {
				BattleManager.actorSwitch(this._actorWindow.index())
			}
		} else {
			var action = BattleManager.inputtingAction()
			action.setTarget(this._actorWindow.index())
		}
		this._actorWindow.hide()
		this._skillWindow.hide()
		this._itemWindow.hide()
		this.selectNextCommand()
	}

	Scene_Battle.prototype.commandForcedSwitch = function() {
		this._actorWindow.deactivate()
		this._actorWindow.hide()
		BattleManager.processForcedSwitch($gameDLGSParty.members()[this._actorWindow.index()])
	}

	Scene_Battle.prototype.createItemWindow = function() {
		this._itemWindow = new Window_BattleItem()
		this._itemWindow.setHandler('ok', this.onItemOk.bind(this))
		this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this))
		this.addWindow(this._itemWindow)
	}

	Scene_Battle.prototype.onItemOk = function() {
		var item = this._itemWindow.item()
		var action = BattleManager.inputtingAction()
		action.setItem(item.id)
		$gameDLGSParty.setLastItem(item)
		this.onSelectAction()
	}

	Scene_Battle.prototype.onSelectAction = function() {
		var action = BattleManager.inputtingAction()
		this._skillWindow.hide()
		this._itemWindow.hide()
		if (!action.needsSelection()) {
			this.selectNextCommand()
		} else if (action.isForOpponent()) {
			this.selectEnemySelection()
		} else {
			this.selectActorSelection()
		}
	}

	Scene_Battle.prototype.startActorCommandSelection = function() {
		this._actorCommandWindow.setup(BattleManager.actor())
	}

	Scene_Battle.prototype.endCommandSelection = function() {}

	/* Scripts */

	gsOpenBoxScene = function() {
		if ($gameDLGSBox.exists()) {
			$gameDLGSBox.recoverAll()
			SceneManager.push(Scene_GSBox)
		}
	}

})()

//=============================================================================
// Plugin End
//=============================================================================