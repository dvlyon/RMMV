//=============================================================================
// Musubi Game Studio
// Musubi_EventNames.js
//=============================================================================

var Imported = Imported || {};
Imported.Musubi_EventNames = true;

var Musubi = Musubi || {};
Musubi.EventNames = Musubi.EventNames || {};
Musubi.EventNames.version = 1.03;

/*:
-------------------------------------------------------------------------
@title Musubi Event Names
@author Musubi @ https://gamestudio.musubiapp.com
@date Mar 29, 2019
@version 1.0.3
@filename Musubi_EventNames.js
@url https://gamestudio.musubiapp.com

Contact:

* Website: https://gamestudio.musubiapp.com
* Twitter: https://twitter.com/MusubiTeam

-------------------------------------------------------------------------------
@plugindesc Musubi Event Names
@help 
-------------------------------------------------------------------------------
== Description ==

Dispay your event (and player, and vehicles!) names on top of their heads!

Ez as pie!!!

To display an event's name add a tag like this on it's notes

<msbname>

That will show a white text, for colored texts, try adding a color!

<msbname:green> <msbname:blue> <msbname:pink>

Now with control characters!

== License ==

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

== Terms of Use ==

If you could credit Musubi and https://gamestudio.musubiapp.com, we'd really
appreciate it!

We want to keep growing and making your RMMV experience better!

== Change Log ==

1.0.3 - Mar 29, 2019
 * Added Musubi_Core dependency.
 * Upgraded plugin layout.
1.0.2 - Mar 21, 2019
 * Sprite names now support control characters.
1.0.1 - Feb 19, 2019
 * Updated Credits, Terms and readme.
1.0.0 - Jan 10, 2019
 * Release.

== Usage ==

Install and activate. Use parameters to change behaviour.

-------------------------------------------------------------------------------
 *
 * @param Text Size
 * @desc Text size
 * @type number
 * @default 16
 *
 * @param Show Player Name
 * @desc Display player name?
 * @type boolean
 * @default false
 *
 * @param Boat Name
 * @desc Boat display name
 * @type text
 * @default Boat
 *
 * @param Ship Name
 * @desc Ship display name
 * @type text
 * @default Ship
 *
 * @param AirShip Name
 * @desc AirShip display name
 * @type text
 * @default AirShip
 *
*/

//=============================================================================
// Dependencies
//=============================================================================

if (Imported.Musubi_Core && Musubi.Core && Musubi.Core.version >= 1.11) {

//=============================================================================
// Plugin Start
//=============================================================================

(function() {

	/* Parameters */
	
	Musubi.EventNames.Parameters = PluginManager.parameters('Musubi_EventNames')

	Musubi.EventNames.TextSize = toNumber(Musubi.EventNames.Parameters['Text Size'], 16)
	Musubi.EventNames.ShowPlayerName = toBool(Musubi.EventNames.Parameters['Show Player Name'])
	Musubi.EventNames.BoatName = toText(Musubi.EventNames.Parameters['Boat Name'], 'Boat')
	Musubi.EventNames.ShipName = toText(Musubi.EventNames.Parameters['Ship Name'], 'Ship')
	Musubi.EventNames.AirShipName = toText(Musubi.EventNames.Parameters['AirShip Name'], 'AirShip')

	//-----------------------------------------------------------------------------
	// Sprite_MusubiName
	//
	// The base sprite class to display names. Used for events.

	function Sprite_MusubiName() {
		this.initialize.apply(this, arguments)
	}
	
	Sprite_MusubiName.prototype = Object.create(Sprite.prototype)
	Sprite_MusubiName.prototype.constructor = Sprite_MusubiName
	
	Sprite_MusubiName.prototype.initialize = function(data) {
		Sprite.prototype.initialize.call(this)
		this.bitmap = new Bitmap(120, 40)
		this._member = data.member
		this._characterSprite = data.characterSprite
		this.bitmap.fontSize = Musubi.EventNames.TextSize
		this.setTextColor(data.textColor)
		this.bitmap.outlineWidth = 3
		this.updatePosition()
		this.setAnchor()
		this.drawName()
		this._visible = this.visible = this.isReady()
		this.z = 20
	}
	
	Sprite_MusubiName.prototype.setAnchor = function() {
		this.anchor.x = 0.5
		this.anchor.y = 1
	}
	
	Sprite_MusubiName.prototype.isTransparent = function() {
		return this._member.isTransparent()
	}
	
	Sprite_MusubiName.prototype.isErased = function() {
		return this._member._erased || !this._member._characterName
	}
	
	Sprite_MusubiName.prototype.isReady = function() {
		return (this._member.findProperPageIndex() > -1) && !this.isTransparent() && !this.isErased()
	}
	
	Sprite_MusubiName.prototype.setTextColor = function(color) {
		this.bitmap.textColor = color
	}
	
	Sprite_MusubiName.prototype.drawName = function() {
		var name = this._member.event().name || ''
		this.drawTextEx(name, 0, 0, 120, 40, 'center')
	}

	Sprite_MusubiName.prototype.update = function() {
		Sprite.prototype.update.call(this)
		this.updatePosition()
		this.updateVisibility()
	}

	Sprite_MusubiName.prototype.updatePosition = function() {
		this.x = this._member.screenX()
		this.y = this._member.screenY() - this._characterSprite._frame.height + 10
	}
	
	Sprite_MusubiName.prototype.updateVisibility = function() {
		if(this._visible !== this.isReady()) {
			this.visible = this._visible = this.isReady()
		}
	}

	Sprite_MusubiName.prototype.drawTextEx = function(text, x, y, width, height, align) {
		if (text) {
			text = this.convertEscapeCharacters(text)
			this.bitmap.drawText(text, 0, 0, width, height, align)
		} else {
			return
		}
	}

	Sprite_MusubiName.prototype.convertEscapeCharacters = function(text) {
		text = text.replace(/\\/g, '\x1b')
		text = text.replace(/\x1b\x1b/g, '\\')
		text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
			return $gameVariables.value(parseInt(arguments[1]))
		}.bind(this))
		text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
			return $gameVariables.value(parseInt(arguments[1]))
		}.bind(this))
		text = text.replace(/\x1bN\[(\d+)\]/gi, function() {
			return this.actorName(parseInt(arguments[1]))
		}.bind(this))
		text = text.replace(/\x1bP\[(\d+)\]/gi, function() {
			return this.partyMemberName(parseInt(arguments[1]))
		}.bind(this))
		text = text.replace(/\x1bG/gi, TextManager.currencyUnit)
		return text
	}

	Sprite_MusubiName.prototype.actorName = function(n) {
		var actor = n >= 1 ? $gameActors.actor(n) : null
		return actor ? actor.name() : ''
	}

	Sprite_MusubiName.prototype.partyMemberName = function(n) {
		var actor = n >= 1 ? $gameParty.members()[n - 1] : null
		return actor ? actor.name() : ''
	}
	
	//-----------------------------------------------------------------------------
	// Sprite_MusubiPlayerName
	//
	// The sprite class to display player names.

	function Sprite_MusubiPlayerName() {
		this.initialize.apply(this, arguments)
	}
	
	Sprite_MusubiPlayerName.prototype = Object.create(Sprite_MusubiName.prototype)
	Sprite_MusubiPlayerName.prototype.constructor = Sprite_MusubiPlayerName
	
	Sprite_MusubiPlayerName.prototype.initialize = function(data) {
		Sprite_MusubiName.prototype.initialize.call(this, data)
		this._visible = this.visible = this.isReady()
	}
	
	Sprite_MusubiPlayerName.prototype.isTransparent = function() {
		return this._member.isTransparent()
	}
	
	Sprite_MusubiPlayerName.prototype.isReady = function() {
		return !this.isTransparent() && Musubi.EventNames.ShowPlayerName
	}
	
	Sprite_MusubiPlayerName.prototype.drawName = function() {
		var name = $gameParty.members()[0].name() || ''
		this.drawTextEx(name, 0, 0, 120, 40, 'center')
	}
	
	//-----------------------------------------------------------------------------
	// Sprite_MusubiVehicleName
	//
	// The sprite class to display vehicle names.

	function Sprite_MusubiVehicleName() {
		this.initialize.apply(this, arguments)
	}
	
	Sprite_MusubiVehicleName.prototype = Object.create(Sprite_MusubiName.prototype);
	Sprite_MusubiVehicleName.prototype.constructor = Sprite_MusubiVehicleName;
	
	Sprite_MusubiVehicleName.prototype.initialize = function(data) {
		this._name = this.getName(data.name)
		Sprite_MusubiName.prototype.initialize.call(this, data)
	}
	
	Sprite_MusubiVehicleName.prototype.isTransparent = function() {
		return false
	}

	Sprite_MusubiVehicleName.prototype.isErased = function() {
		return !this._member._characterName
	}
	
	Sprite_MusubiVehicleName.prototype.isReady = function() {
		return Musubi.EventNames.ShowPlayerName && (this._member._mapId === $gameMap.mapId())
	}
	
	Sprite_MusubiVehicleName.prototype.drawName = function() {
		this.drawTextEx(this._name, 0, 0, 120, 40, 'center')
	}
	
	Sprite_MusubiVehicleName.prototype.getName = function (type) {
		switch (type) {
			case 'boat':
				return Musubi.EventNames.BoatName
				break
			case 'ship':
				return Musubi.EventNames.ShipName
				break
			case 'airship':
				return Musubi.EventNames.AirShipName
				break
		}
		return ''
	}
	
	/* Spriteset_Map */
	
	Spriteset_Map.prototype.createMusubiNames = function() {
		this._musubiNameSprites = []
		this._characterSprites.forEach(function(characterSprite) {
			var character = characterSprite._character
			if (character._eventId) {
				var color = character.event().meta["msbname"]
				if (character._erased || character.isTransparent() || !color) {
					return
				}
				if (color === true) {
					color = 'white'
				}
				this._musubiNameSprites.push(new Sprite_MusubiName({
					member: character,
					textColor: color,
					characterSprite: characterSprite
				}))
			} else if (character._type) {
				this._musubiNameSprites.push(new Sprite_MusubiVehicleName({
					member: character,
					textColor: 'white',
					characterSprite: characterSprite,
					name: character._type
				}))
			} else if (character._followers) {
				if ($gameParty.members()[0]) {
					this._musubiNameSprites.push(new Sprite_MusubiPlayerName({
						member: $gamePlayer,
						textColor: 'white',
						characterSprite: characterSprite
					}))
				}
			}
		}, this)
		for (var i = 0; i < this._musubiNameSprites.length; i++) {
			this._tilemap.addChild(this._musubiNameSprites[i])
		}
	}

	var _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer 
	Spriteset_Map.prototype.createLowerLayer = function() {
		_Spriteset_Map_createLowerLayer.call(this)
		this.createMusubiNames()
	}
	
})()

//=============================================================================
// Plugin End
//=============================================================================

} else {
var text = 'Musubi_EventNames requires Musubi_Core at the latest version to run.'
console.error(text)
require('nw.gui').Window.get().showDevTools()
}