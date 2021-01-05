import { Menu, MenuItem } from "@/api/parsers/MenuParser";

/**
 * Combine menus from different sources into a single group
 */
export class MenuManager {
	readonly _menus : Menu[];

	constructor() {
		this._menus = [];
	}

	/**
	 * Get the combined menus
	 */
	get menus() {
		return this._menus;
	}

	/**
	 * Add a new menu to the collection
	 * @param menu	The menu to register
	 */
	register(menu: Menu) : void {
		this._registerMenu(this._menus, menu);
	}

	/**
	 * Remove a menu from the collection
	 * @param menu	The menu to remove
	 */
	unregister(menu: Menu): void {
		this._unregisterMenu(this._menus, menu);
	}

	/**
	 * Check if an object is of type Menu
	 * @param itm	The object to check
	 * @returns	true if the object is a `Menu`, false if it is a `MenuItem`
	 * @private
	 */
	private static _isMenu(itm : Menu|MenuItem) : boolean {
		return !!(itm as Menu).children;
	}

	/**
	 * Recursively register a Menu object
	 * @param existing_menus	The array of menus to start at
	 * @param new_item			The menu to add
	 * @private
	 */
	private _registerMenu(existing_menus : (Menu|MenuItem)[], new_item : Menu) {
		//See if a menu with the same name exists to combine with
		let found_menu: Menu | null = null;
		for (let itm of existing_menus) {
			//Name matches and is a submenu
			if (MenuManager._isMenu(itm) && itm.name === new_item.name) {
				found_menu = <Menu>itm;
				break;
			}
		}
		//Create a new menu if a match wasn't found
		if (!found_menu) {
			found_menu = {
				name: new_item.name,
				children: [],
			};
			existing_menus.push(found_menu);
		}

		//Merge the menus
		for (let m of new_item.children) {
			//Register a submenu
			if (MenuManager._isMenu(m))
				this._registerMenu(found_menu.children, <Menu>m);
			//Register a menu item
			else
				this._registerMenuItem(found_menu.children, <MenuItem>m);
		}
	}

	/**
	 * Register a menu item (menu leaf node)
	 * @param existing_menus	The layer of menus to add to
	 * @param new_item			The menu item to add
	 * @private
	 */
	private _registerMenuItem(existing_menus : (Menu|MenuItem)[], new_item : MenuItem) {
		let found : boolean = false;
		for (let itm of existing_menus) {
			//Name matches and is not a submenu
			if (itm.name === new_item.name && !MenuManager._isMenu(new_item)) {
				found = true;
				break;
			}
		}
		if (!found) {
			existing_menus.push(new_item);
		} else {
			console.error("Menu item already registered");
		}
	}

	/**
	 * Recursively remove a menu and its children from the menu
	 * @param existing_menus	The layer of menus to add to
	 * @param new_item			The menu item to add
	 * @private
	 */
	private _unregisterMenu(existing_menus : (Menu|MenuItem)[], new_item : Menu|MenuItem) {
		//TODO: Unregister menus
	}
}
