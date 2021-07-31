import Vue from 'vue'
import Vuex from 'vuex';
import { RunConfiguration } from "@/types/RunConfiguration";
import VuexPersistence from "vuex-persist";

//Make VueX available to Vue
Vue.use(Vuex);

/**
 * Type definitions for the VueX store
 */
export interface RootState {
	runConfigurations: RunConfiguration[];
	chosenRunConfig: RunConfiguration|undefined;
}

//Automatically save the VueX store in the browser localstorage
const vuexLocal = new VuexPersistence<RootState>({
	storage: window.localStorage
})

//The VueX store object
const store = new Vuex.Store<RootState>({
	state: {
		runConfigurations: [],
		chosenRunConfig: undefined,
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
		// overwriteRunConfig(state: RootState, oldConfig: RunConfiguration, newConfig: RunConfiguration): void {
		overwriteRunConfig(state: RootState, [oldConfig, newConfig]: [RunConfiguration, RunConfiguration]): void {
			let index = state.runConfigurations.indexOf(oldConfig);
			console.log('overwrite ', oldConfig, newConfig, index);
			if (index === -1) return;
			state.runConfigurations.splice(index, 1, newConfig);
		},

		setChosenRunConfig(state: RootState, config: RunConfiguration) {
			state.chosenRunConfig = config;
		},
	},
	plugins: [
		//Enable persistence
		vuexLocal.plugin,
	],
});

export default store;