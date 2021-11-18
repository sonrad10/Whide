import Vue from 'vue'
import Vuex from 'vuex';
import { RunConfiguration } from "@/types/RunConfiguration";
import VuexPersistence from "vuex-persist";
import createMutationsSharer from "vuex-shared-mutations";
import { FileInfoState } from "@/types/FileInfoState";

//Make VueX available to Vue
Vue.use(Vuex);

/**
 * The possible values for the application theme.
 * "Auto" uses the browser default theme (as defined in the MediaQuery).
 */
export enum APP_THEME {
	AUTO,
	LIGHT,
	DARK,
}

/**
 * Type definitions for the VueX store
 */
export interface RootState {
	runConfigurations: RunConfiguration[];
	chosenRunConfig: RunConfiguration|undefined;
	settings: SettingsState;
	openFiles: FileInfoState[];
	focusedFile: number;
	current_directory: string|undefined;
	isElectron: boolean;
}

/**
 * Root state object for application settings
 */
export interface SettingsState {
	general: SettingsGeneralState;
	appearance: SettingsAppearanceState;
}

/**
 * State object for general application settings
 */
export interface SettingsGeneralState {
	hwhilePath: string;
}

/**
 * State object for application appearance settings
 */
export interface SettingsAppearanceState {
	/**
	 * Current application theme
	 */
	theme: APP_THEME;
}

//Automatically save the VueX store in the browser localstorage
const vuexLocal = new VuexPersistence<RootState>({
	storage: window.localStorage,
	reducer(state: RootState): Partial<RootState> {
		return {
			settings: state.settings,
			chosenRunConfig: state.chosenRunConfig,
			runConfigurations: state.runConfigurations,
			current_directory: state.current_directory,
		};
	},
})

//The VueX store object
const store = new Vuex.Store<RootState>({
	state: {
		runConfigurations: [],
		chosenRunConfig: undefined,
		settings: {
			general: {
				hwhilePath: '',
			},
			appearance: {
				theme: APP_THEME.AUTO,
			}
		},
		openFiles: [],
		focusedFile: -1,
		current_directory: undefined,
		isElectron: (window['require'] !== undefined)
	},
	mutations: {
		/**
		 * Add a new run configuration to the list
		 * @param state		VueX state object
		 * @param config	Run configuration object to add
		 */
		addRunConfig(state: RootState, config: RunConfiguration): void {
			state.runConfigurations.push(config);
			//Mark this run config as selected if there are no other selected ones
			if (state.chosenRunConfig === undefined) state.chosenRunConfig = config;
		},
		/**
		 * Remove a run configuration from the list
		 * @param state		VueX state object
		 * @param config	Run configuration object to remove
		 */
		removeRunConfig(state: RootState, config: RunConfiguration|number): void {
			//Get the index of the object and remove it from the list
			if (typeof config !== 'number') config = state.runConfigurations.indexOf(config);
			let deleted: RunConfiguration[] = state.runConfigurations.splice(config, 1);

			if (state.chosenRunConfig === undefined) return;
			//Update the selected run configuration if necessary
			if (state.runConfigurations.length === 0) {
				state.chosenRunConfig = undefined;
			} else if (deleted.includes(state.chosenRunConfig)) {
				let index = Math.min(config, state.runConfigurations.length - 1);
				state.chosenRunConfig = state.runConfigurations[index];
			}
		},
		overwriteRunConfig(state: RootState, [oldConfig, newConfig]: [RunConfiguration, RunConfiguration]): void {
			let index = state.runConfigurations.indexOf(oldConfig);
			if (index === -1) return;
			//Replace the old run config with the new one
			state.runConfigurations.splice(index, 1, newConfig);
			//Update the chosen run config if that is the overwritten one
			if (oldConfig === state.chosenRunConfig) {
				state.chosenRunConfig = newConfig;
			}
		},

		setChosenRunConfig(state: RootState, config: RunConfiguration) {
			state.chosenRunConfig = config;
		},

		/**
		 * Change the app's global theme
		 * @param state	VueX state object
		 * @param theme	New theme to apply
		 */
		setAppTheme(state: RootState, theme: APP_THEME) {
			state.settings.appearance.theme = theme;
		},

		/**
		 * Change the saved path to the HWhile executable
		 * @param state			VueX state object
		 * @param hwhilePath	New path to HWhile
		 */
		setHWhilePath(state: RootState, hwhilePath: string) {
			state.settings.general.hwhilePath = hwhilePath;
		},

		'openFiles.set': function (state: RootState, files: FileInfoState[]) {
			state.openFiles = [...files];
		},
		'openFiles.setFocused': function (state: RootState, file: number|FileInfoState) {
			if (typeof file === 'number') state.focusedFile = file;
			else state.focusedFile = state.openFiles.indexOf(file);
		},
		'openFiles.focused.setExtended': function (state: RootState, isExt: boolean) {
			if (state.focusedFile >= 0) state.openFiles[state.focusedFile].extWhile = isExt;
		},

		'cwd.set': function (state: RootState, directory: string) {
			state.current_directory = directory;
		},
	},
	plugins: [
		//Enable persistence
		vuexLocal.plugin,
		//Enable sharing between concurrent tabs/windows
		createMutationsSharer({
			predicate: [
				'addRunConfig',
				'removeRunConfig',
				'overwriteRunConfig',
				'setChosenRunConfig',
				'setAppTheme',
				'setHWhilePath',
				'cwd.set',
			],
		})
	],
});

export default store;