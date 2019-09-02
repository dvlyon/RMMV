//=============================================================================
// Musubi Game Studio
// Musubi_Splash.js
//=============================================================================

var Imported = Imported || {};
Imported.Musubi_Splash = true;

var Musubi = Musubi || {};
Musubi.Splash = Musubi.Splash || {};
Musubi.Splash.version = 1.21;

/*:
-------------------------------------------------------------------------
@title Musubi Splash
@author Musubi @ https://gamestudio.musubiapp.com
@date Apr 29, 2019
@version 1.2.1
@filename Musubi_Splash.js
@url https://gamestudio.musubiapp.com

Contact:

* Main Website: https://gamestudio.musubiapp.com
* Twitter: https://twitter.com/MusubiTeam

-------------------------------------------------------------------------------
@plugindesc Musubi Splash Screen
@help 
-------------------------------------------------------------------------------
== Description ==

Displays an image on game load, before Title Screen.

== License ==

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

== Terms of Use ==

If you could credit Musubi and https://gamestudio.musubiapp.com, we'd really
appreciate it!

We want to keep growing and making your RMMV experience better!

== Change Log ==

1.2.1 - Apr 29, 2019
 * (QoL) Plugin's description typo fixed.
1.2.0 - Mar 31, 2019
 * (Feature) Compatibility with Musubi_Core version 2.1.0.
 * (Feature) Added option to set fade speed.
 * (Optimization) Reworked the Splash Screen update method.
1.1.0 - Mar 29, 2019
 * Added ability to choose the image to be displayed.
 * Added Musubi_Core dependency.
 * Upgraded plugin layout.
1.0.0 - Feb 19, 2019
 * Release.

== Usage ==

Install, activate and configure parameters.

== Notes ==

Images must be placed in img/musubi.

-------------------------------------------------------------------------------
 *
 * @param Image
 * @desc Image to display on game load.
 * @type file
 * @dir img/musubi/
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

if (Imported.Musubi_Core && Musubi.Core && Musubi.Core.version >= 2.1) {

//=============================================================================
// Plugin Start
//=============================================================================

(function() {

	/* Parameters */

	Musubi.Splash.Parameters = PluginManager.parameters('Musubi_Splash')

	Musubi.Splash.Image = Musubi.Splash.Parameters['Image']
	Musubi.Splash.FadeSpeed = toNumber(Musubi.Splash.Parameters['FadeSpeed'], 24)

	/* Scene_Boot */

	var _Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages
	Scene_Boot.prototype.loadSystemImages = function() {
		_Scene_Boot_loadSystemImages.call(this)
		ImageManager.loadMusubi(Musubi.Splash.Image)
	}

	var _Scene_Boot_start = Scene_Boot.prototype.start
	Scene_Boot.prototype.start = function() {
		if (!DataManager.isBattleTest() && !DataManager.isEventTest()) {
			SceneManager.goto(Scene_MusubiSplash)
		} else {
			_Scene_Boot_start.call(this)
		}
	}

	//-----------------------------------------------------------------------------
	// Scene_MusubiSplash
	//
	// The scene class for showing the Musubi Game Studio splash screen.

	function Scene_MusubiSplash() {
	    this.initialize.apply(this, arguments)
	}

	Scene_MusubiSplash.prototype = Object.create(Scene_Base.prototype);
	Scene_MusubiSplash.prototype.constructor = Scene_MusubiSplash;

	Scene_MusubiSplash.prototype.initialize = function() {
		Scene_Base.prototype.initialize.call(this)
		this._splashImage = null
		this._splashFadeIn = false
		this._splashFadeOut = false
	}

	Scene_MusubiSplash.prototype.create = function() {
		Scene_Base.prototype.create.call(this)
		this.createSplashes()
	}

	Scene_MusubiSplash.prototype.start = function() {
		Scene_Base.prototype.start.call(this)
		SceneManager.clearStack()
		if (this._splashImage !== null) {
			this.centerSprite(this._splashImage)
		}
	}

	Scene_MusubiSplash.prototype.update = function() {
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

	Scene_MusubiSplash.prototype.createSplashes = function() {
		this._splashImage = new Sprite(ImageManager.loadMusubi('MGSRMMV'))
		this.addChild(this._splashImage)
	}

	Scene_MusubiSplash.prototype.centerSprite = function(sprite) {
		sprite.x = Graphics.width / 2
		sprite.y = Graphics.height / 2
		sprite.anchor.x = 0.5
		sprite.anchor.y = 0.5
	}

	Scene_MusubiSplash.prototype.checkPlayerLocation = function() {
		if ($dataSystem.startMapId === 0) {
			throw new Error('Player\'s starting position is not set')
		}
	}

	Scene_MusubiSplash.prototype.updateDocumentTitle = function() {
		document.title = $dataSystem.gameTitle
	}

	Scene_MusubiSplash.prototype.fadeSpeed = function() {
		return Musubi.Splash.FadeSpeed
	}

})()

//=============================================================================
// Plugin End
//=============================================================================

} else {
var text = 'Musubi_Splash requires Musubi_Core at the latest version to run.'
console.error(text)
require('nw.gui').Window.get().showDevTools()
}