(function() {

	/* DataManager */

	var _DataManager_isWeapon = DataManager.isWeapon
	DataManager.isWeapon = function(item) {
		if (!!item && item._dataClass === 'weapon') {
			return true
		} else {
			return _DataManager_isWeapon.call(this, item)
		}
	}

	var _DataManager_isArmor = DataManager.isArmor
	DataManager.isArmor = function(item) {
		if (!!item && item._dataClass === 'armor') {
			return true
		} else {
			return _DataManager_isArmor.call(this, item)
		}
	}

	/* Game_Musubi */

	var _Game_Musubi_initialize = Game_Musubi.prototype.initialize
	Game_Musubi.prototype.initialize = function() {
		_Game_Musubi_initialize.call(this)
		this._equips = []
	}

	Game_Musubi.prototype.addEquip = function(isWeapon, itemId) {
		if (isWeapon) {
			return this.addWeapon($dataWeapons[itemId], true)
		} else {
			return this.addArmour($dataArmors[itemId], true)
		}
	}

	Game_Musubi.prototype.addWeapon = function(item, isEquipped) {
		var index = this._equips.length
		this._equips[index] = new Game_MusubiItem(item)
		this._equips[index]._musubiIndex = index
		this._equips[index]._isEquipped = !!isEquipped
		this._equips[index]._sold = false
		return index
	}

	Game_Musubi.prototype.addArmour = function(item, isEquipped) {
		var index = this._equips.length
		this._equips[index] = new Game_MusubiItem(item)
		this._equips[index]._musubiIndex = index
		this._equips[index]._isEquipped = !!isEquipped
		this._equips[index]._sold = false
		return index
	}

	Game_Musubi.prototype.equips = function() {
		return this._equips
	}

	Game_Musubi.prototype.weapons = function() {
		return this.equips().filter(function(equip) {
			return equip._dataClass === 'weapon' && !equip._isEquipped && !equip._sold
		})
	}

	Game_Musubi.prototype.armours = function() {
		return this.equips().filter(function(equip) {
			return equip._dataClass === 'armor' && !equip._isEquipped && !equip._sold
		})
	}

	Game_Musubi.prototype.setEquipped = function(index, flag) {
		if (this.equips()[index]) {
			this.equips()[index]._isEquipped = !!flag
		}
	}

	Game_Musubi.prototype.sellEquip = function(index) {
		if (this.equips()[index]) {
			this.equips()[index]._sold = true
		}
	}

	//-----------------------------------------------------------------------------
	// Game_MusubiItem
	//
	// A better Game_Item with unique ids.

	function Game_MusubiItem() {
		this.initialize.apply(this, arguments)
	}

	Game_MusubiItem.prototype.initialize = function(item) {
		this._musubiIndex = -1
		this._dataClass = ''
		this._itemId = 0
		if (!!item) {
			this.setObject(item)
		}
	}

	Game_MusubiItem.prototype.isSkill = function() {
		return false
	}

	Game_MusubiItem.prototype.isItem = function() {
		return false
	}

	Game_MusubiItem.prototype.isUsableItem = function() {
		return false
	}

	Game_MusubiItem.prototype.isWeapon = function() {
		return this._dataClass === 'weapon'
	}

	Game_MusubiItem.prototype.isArmor = function() {
		return this._dataClass === 'armor'
	}

	Game_MusubiItem.prototype.isEquipItem = function() {
		return this.isWeapon() || this.isArmor()
	}

	Game_MusubiItem.prototype.isNull = function() {
		return !this.isEquipItem()
	}

	Game_MusubiItem.prototype.itemId = function() {
		return this._itemId
	}

	Game_MusubiItem.prototype.object = function() {
		var object = {}
		if (this.isWeapon()) {
			object = JSON.parse(JSON.stringify($dataWeapons[this._itemId]))
			object._dataClass = 'weapon'
		} else if (this.isArmor()) {
			object = JSON.parse(JSON.stringify($dataArmors[this._itemId]))
			object._dataClass = 'armor'
		}
		object._musubiIndex = this._musubiIndex
		object._isEquipped = this._isEquipped
		return object
	}

	Game_MusubiItem.prototype.setObject = function(item) {
		if (DataManager.isWeapon(item)) {
			this._dataClass = 'weapon'
		} else if (DataManager.isArmor(item)) {
			this._dataClass = 'armor'
		} else {
			this._dataClass = ''
		}
		this._itemId = item ? item.id : 0
	}

	/* Game_Actor */

	Game_Actor.prototype.initEquips = function(equips) {
		var slots = this.equipSlots()
		var maxSlots = slots.length
		this._equips = []
		for (var i = 0; i < maxSlots; i++) {
			this._equips[i] = -1
			if (equips && equips[i]) {
				this._equips[i] = $gameMusubi.addEquip(slots[i] === 1, equips[i])
			}
		}
		this.releaseUnequippableItems(true)
		this.refresh()
	}

	Game_Actor.prototype.equips = function() {
		return this._equips.map(function(index) {
			if (index >= 0) {
				return $gameMusubi.equips()[index].object()
			} else {
				return new Game_Item().object()
			}
		})
	}

	Game_Actor.prototype.changeEquip = function(slotId, item) {
		$gameMusubi.setEquipped(this._equips[slotId], false)
		if (!!item) {
			$gameMusubi.setEquipped(item._musubiIndex, true)
			this._equips[slotId] = item._musubiIndex
		} else {
			this._equips[slotId] = -1
		}
		this.refresh()
	}

	Game_Actor.prototype.forceChangeEquip = function(slotId, item) {
		if (!!item) {
			this._equips[slotId] = item._musubiIndex
		} else {
			this._equips[slotId] = -1
		}
		this.releaseUnequippableItems(true)
		this.refresh()
	}

	/* Game_Party */

	var _Game_Party_gainItem = Game_Party.prototype.gainItem
	Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
		if (!item) {
			return
		} else if (DataManager.isItem(item)) {
			_Game_Party_gainItem.call(this, item, amount, includeEquip)
		} else if (DataManager.isWeapon(item)) {
			for (var i = 0; i < amount; i++) {
				$gameMusubi.addWeapon(item)
				$gameMap.requestRefresh()
			}
			if (amount < 0) {
				$gameMusubi.sellEquip(item._musubiIndex)
			}
		} else if (DataManager.isArmor(item)) {
			for (var i = 0; i < amount; i++) {
				$gameMusubi.addArmour(item)
				$gameMap.requestRefresh()
			}
			if (amount < 0) {
				$gameMusubi.sellEquip(item._musubiIndex)
			}
		} else {
			return
		}
	}

	Game_Party.prototype.weapons = function() {
		return $gameMusubi.weapons().map(function(weapon) {
			return weapon.object()
		})
	}

	Game_Party.prototype.armors = function() {
		return $gameMusubi.armours().map(function(armour) {
			return armour.object()
		})
	}

	var _Game_Party_numItems = Game_Party.prototype.numItems
	Game_Party.prototype.numItems = function(item) {
		if (DataManager.isWeapon(item) || DataManager.isArmor(item)) {
			return 1
		} else {
			return _Game_Party_numItems.call(this, item)
		}
		var container = this.itemContainer(item)
		return container ? container[item.id] || 0 : 0
	}

})()