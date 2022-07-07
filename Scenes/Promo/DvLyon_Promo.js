"use strict";

//=============================================================================
// DvLyon Games
// RPG Maker MV - DvLyon_Promo.js
//=============================================================================

var DvLyon = DvLyon || {};
DvLyon.Promo = DvLyon.Promo || {};
DvLyon.Promo.version = 2;

/*:
@plugindesc Promo Scene
@author DvLyon - https://dvlyon.com
@help
== Description ==

Visit https://dvlyon.com/rmmv/plugins/promo

== License ==

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

== Contributing ==

If you could credit DvLyon and https://dvlyon.com, I'd really
appreciate it!

@param Image
@desc Image to display on game load.
@type file
@dir img/dvlyon/
@require 1
@default

@param FadeSpeed
@text Fade Speed
@desc Sets the fading speed for the splash image. (Default: 24).
@default 24
*/

//=============================================================================
// Dependencies
//=============================================================================

if (DvLyon && DvLyon.Core && DvLyon.Core.version >= 2) {

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

	const _Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages
	Scene_Boot.prototype.loadSystemImages = function() {
		_Scene_Boot_loadSystemImages.call(this)
		ImageManager.loadDvLyon(DvLyon.Promo.Image)
	}

	const _Scene_Boot_start = Scene_Boot.prototype.start
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
	const text = 'DvLyon_Promo requires DvLyon_Core at the latest version to run.'
	console.error(text)
	require('nw.gui').Window.get().showDevTools()
}

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
        if (body && body.promo && (body.promo.version > DvLyon.Promo.version)) {
			const text = 'An updated version of DvLyon_Promo is available at https://dvlyon.com/rmmv/plugins/promo'
			console.info(text)
		}
	})
}

versionChecker()