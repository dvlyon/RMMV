(function() {

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
		this._equips[index] = new Game_Item(item)
		this._equips[index]._musubiIndex = index
		this._equips[index]._isEquipped = !!isEquipped
		return index
	}

	Game_Musubi.prototype.addArmour = function(item, isEquipped) {
		var index = this._equips.length
		this._equips[index] = new Game_Item(item)
		this._equips[index]._musubiIndex = index
		this._equips[index]._isEquipped = !!isEquipped
		return index
	}

	Game_Musubi.prototype.equips = function() {
		return this._equips
	}

	Game_Musubi.prototype.weapons = function() {
		return this.equips().filter(function(equip) {
			return equip._dataClass === 'weapon' && !equip._isEquipped
		})
	}

	Game_Musubi.prototype.armours = function() {
		return this.equips().filter(function(equip) {
			return equip._dataClass === 'armor' && !equip._isEquipped
		})
	}

	Game_Musubi.prototype.setEquipped = function(index, flag) {
		if (this.equips()[index]) {
			this.equips()[index]._isEquipped = !!flag
		}
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
		//$gameMusubi.setEquipped(this._equips[slotId], false)
		if (!!item) {
			//$gameMusubi.setEquipped(item._musubiIndex, true)
			this._equips[slotId] = item._musubiIndex
		} else {
			this._equips[slotId] = -1
		}
		this.releaseUnequippableItems(true)
		this.refresh()
	}

	/*var _Game_Actor_paramPlus = Game_Actor.prototype.paramPlus
	Game_Actor.prototype.paramPlus = function(paramId) {
		var value = _Game_Actor_paramPlus.call(this, paramId)
		var equips = this.equips()
		for (var i = 0; i < equips.length; i++) {
			var item = equips[i]
			if (item && item.meta && item.meta['msgEnchant']) {
				console.log(item)
				//value += item.params[paramId]
			}
		}
		return value
	}*/

	Game_Actor.prototype.bestEquipItem = function(slotId) {
		var etypeId = this.equipSlots()[slotId]
		var items = $gameParty.equipItems().filter(function(item) {
			item = item.object()
			return item.etypeId === etypeId && this.canEquip(item)
		}, this)
		var bestItem = null
		var bestPerformance = -1000
		for (var i = 0; i < items.length; i++) {
			var performance = this.calcEquipItemPerformance(items[i].object())
			if (performance > bestPerformance) {
				bestPerformance = performance
				bestItem = items[i]
			}
		}
		return bestItem
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
		} else if (DataManager.isArmor(item)) {
			for (var i = 0; i < amount; i++) {
				$gameMusubi.addArmour(item)
				$gameMap.requestRefresh()
			}
		} else {
			return
		}
	}

	Game_Party.prototype.weapons = function() {
		return $gameMusubi.weapons().map(function(weapon) {
			return weapon
		})
	}

	Game_Party.prototype.armors = function() {
		return $gameMusubi.armours().map(function(armour) {
			return armour
		})
	}

	/*var _Game_Party_numItems = Game_Party.prototype.numItems
	Game_Party.prototype.numItems = function(item) {
		_Game_Party_numItems.call(this, item)
		if (!item) {
			return 0
		} else if (DataManager.isItem(item)) {
			_Game_Party_numItems.call(this, item)
		} else if (DataManager.isWeapon(item) || DataManager.isArmor(item)) {
			return 1
		} else {
			return
		}
	}*/

	/* Window_ItemList */

	var _Window_ItemList_includes = Window_ItemList.prototype.includes
	Window_ItemList.prototype.includes = function(item) {
		if (!!item) {
			var object = item.object()
			return _Window_ItemList_includes.call(this, object)
		}
		return false
	}

	Window_ItemList.prototype.drawItem = function(index) {
		var item = this._data[index]
		if (!!item) {
			var object = item.object()
			var numberWidth = this.numberWidth()
			var rect = this.itemRect(index)
			rect.width -= this.textPadding()
			this.changePaintOpacity(this.isEnabled(object))
			this.drawItemName(object, rect.x, rect.y, rect.width - numberWidth)
			this.drawItemNumber(object, rect.x, rect.y, rect.width)
			this.changePaintOpacity(1)
		}
	}

	/* Window_EquipItem */

	var _Window_EquipItem_includes = Window_EquipItem.prototype.includes
	Window_EquipItem.prototype.includes = function(item) {
		if (!!item) {
			var object = item.object()
			return _Window_EquipItem_includes.call(this, object)
		}
		return false
	}

})()