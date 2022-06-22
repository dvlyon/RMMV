"use strict";

//=============================================================================
// DvLyon Games
// DvLyon_Promo.js
//=============================================================================

var Imported = Imported || {};
Imported.DvLyon_Promo = true;

var DvLyon = DvLyon || {};
DvLyon.Promo = DvLyon.Promo || {};
DvLyon.Promo.version = 1.01;

/*:
-------------------------------------------------------------------------
@title DvLyon Promo
@author DvLyon Games @ https://games.dvlyon.com
@date Dec 31, 2019
@version 1.0.1
@filename DvLyon_Promo.js
@url https://games.dvlyon.com

Contact:

* Website: https://games.dvlyon.com
* Twitter: https://twitter.com/DvLyon

-------------------------------------------------------------------------------
@plugindesc DvLyon Boot Promo Scene
@help 
-------------------------------------------------------------------------------
== Description ==

Displays an image on game load, before Title Screen.

== License ==

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

== Terms of Use ==

If you could credit DvLyon and https://games.dvlyon.com, we'd really
appreciate it!

We want to keep growing and making your RMMV experience better!

== Change Log ==

1.0.1 - Dec 31, 2019
 * (Feature) Now with strict mode.
1.0.0 - Dec 20, 2019
 * (Release) Release.

== Usage ==

Install, activate and configure parameters.

== Notes ==

Images must be placed in img/dvlyon.

-------------------------------------------------------------------------------
 *
 * @param Image
 * @desc Image to display on game load.
 * @type file
 * @dir img/dvlyon/
 * @require 1
 * @default
 *
 * @param FadeSpeed
 * @text Fade Speed
 * @desc Sets the fading speed for the splash image. (Default: 24).
 * @default 24
 *
*/

//=============================================================================
// Dependencies
//=============================================================================

if (Imported.DvLyon_Core && DvLyon.Core && DvLyon.Core.version >= 1.2) {

//=============================================================================
// Plugin Start
//=============================================================================

(function() {

	//=============================================================================
	// Parameters
	//=============================================================================

	DvLyon.Promo.Parameters = PluginManager.parameters('DvLyon_Promo')

	DvLyon.Promo.Image = toText(DvLyon.Promo.Parameters['Image'], null)
	DvLyon.Promo.FadeSpeed = toNumber(DvLyon.Promo.Parameters['FadeSpeed'], 24)

	//=============================================================================
	// Scenes
	//=============================================================================

	/* Scene_Boot */

	var _Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages
	Scene_Boot.prototype.loadSystemImages = function() {
		_Scene_Boot_loadSystemImages.call(this)
		ImageManager.loadDvLyon(DvLyon.Promo.Image)
	}

	var _Scene_Boot_start = Scene_Boot.prototype.start
	Scene_Boot.prototype.start = function() {
		if (!DataManager.isBattleTest() && !DataManager.isEventTest()) {
			SceneManager.goto(Scene_DvLyonPromo)
		} else {
			_Scene_Boot_start.call(this)
		}
	}

	//-----------------------------------------------------------------------------
	// Scene_DvLyonPromo
	//
	// The scene class for showing the DvLyon Games splash screen.

	function Scene_DvLyonPromo() {
	    this.initialize.apply(this, arguments)
	}

	Scene_DvLyonPromo.prototype = Object.create(Scene_Base.prototype)
	Scene_DvLyonPromo.prototype.constructor = Scene_DvLyonPromo

	Scene_DvLyonPromo.prototype.initialize = function() {
		Scene_Base.prototype.initialize.call(this)
		this._splashImage = null
		this._splashFadeIn = false
		this._splashFadeOut = false
	}

	Scene_DvLyonPromo.prototype.create = function() {
		Scene_Base.prototype.create.call(this)
		this.createSplashes()
	}

	Scene_DvLyonPromo.prototype.start = function() {
		Scene_Base.prototype.start.call(this)
		SceneManager.clearStack()
		if (this._splashImage !== null) {
			this.centerSprite(this._splashImage)
		}
	}

	Scene_DvLyonPromo.prototype.update = function() {
		Scene_Base.prototype.update.call(this)
		if (!this.isBusy()) {
			if (!this._splashFadeIn) {
				this.startFadeIn(this.fadeSpeed(), false)
				this._splashFadeIn = true
			} else if (!this._splashFadeOut) {
				this.startFadeOut(this.fadeSpeed(), false)
				this._splashFadeOut = true
			} else {
				_Scene_Boot_start.call(this)
			}
		}
	}

	Scene_DvLyonPromo.prototype.createSplashes = function() {
		this._splashImage = new Sprite(ImageManager.loadDvLyon(DvLyon.Promo.Image))
		this.addChild(this._splashImage)
	}

	Scene_DvLyonPromo.prototype.centerSprite = function(sprite) {
		sprite.x = Graphics.width / 2
		sprite.y = Graphics.height / 2
		sprite.anchor.x = 0.5
		sprite.anchor.y = 0.5
	}

	Scene_DvLyonPromo.prototype.checkPlayerLocation = function() {
		if ($dataSystem.startMapId === 0) {
			throw new Error('Player\'s starting position is not set')
		}
	}

	Scene_DvLyonPromo.prototype.updateDocumentTitle = function() {
		document.title = $dataSystem.gameTitle
	}

	Scene_DvLyonPromo.prototype.fadeSpeed = function() {
		return DvLyon.Promo.FadeSpeed
	}

})()

//=============================================================================
// Plugin End
//=============================================================================

} else {
	var text = 'DvLyon_Promo requires DvLyon_Core at the latest version to run.'
	console.error(text)
	require('nw.gui').Window.get().showDevTools()
}

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
		if (body && (body.promo > DvLyon.Promo.version)) {
			var text = 'An updated version of DvLyon_Promo is available at https://games.dvlyon.com'
			console.info(text)
		}
	})
}

versionChecker()