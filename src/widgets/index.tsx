import {
	declareIndexPlugin,
	ReactRNPlugin,
	RNPlugin,
} from "@remnote/plugin-sdk";
import { formTheme, customTheme, appearanceScheme } from "../funcs/buildLess";

const defaultColorList: customTheme = {
	accent: "#89b4fa",
	name: "Example: Catppuccin Mocha",
	type: "dark",
	colors: {
		rosewater: "#f5e0dc",
		flamingo: "#f2cdcd",
		pink: "#f5c2e7",
		mauve: "#cba6f7",
		red: "#f38ba8",
		maroon: "#eba0ac",
		peach: "#fab387",
		yellow: "#f9e2af",
		green: "#a6e3a1",
		teal: "#94e2d5",
		sky: "#89dceb",
		sapphire: "#74c7ec",
		blue: "#89b4fa",
		lavender: "#b4befe",
		text: "#cdd6f4",
		subtext1: "#bac2de",
		subtext0: "#a6adc8",
		overlay2: "#9399b2",
		overlay1: "#7f849c",
		overlay0: "#6c7086",
		surface2: "#585b70",
		surface1: "#45475a",
		surface0: "#313244",
		base: "#1e1e2e",
		mantle: "#181825",
		crust: "#11111b",
	},
};

async function onActivate(plugin: ReactRNPlugin) {
	// Register a setting to change the catppuccin theme
	await plugin.settings.registerStringSetting({
		id: "theme",
		title: "Import ThemeCode",
		description:
			"You can insert a ThemeCode here to automatically change the theme. If you don't know what that is, don't worry about it! It's for when you want to share or import a theme.",
		defaultValue: "TODO: ADD DEFAULT THING HERE",
		multiline: true,
	});

	await plugin.settings.registerStringSetting({
		id: "name",
		title: "Theme Name",
		description:
			"Name your theme! This is for when you want to share or import a theme.",
		defaultValue: "My Theme",
	});

	await plugin.settings.registerDropdownSetting({
		id: "type",
		title: "Theme Type",
		description:
			"Choose whether you want your theme to be a light theme or a dark theme.",
		defaultValue: "light",
		options: [
			{
				key: "0",
				label: "Light",
				value: "light",
			},
			{
				key: "1",
				label: "Dark",
				value: "dark",
			},
		],
	});

	// for color colors, register a setting to assign a color to it
	for (const colorName in defaultColorList.colors) {
		await plugin.settings.registerStringSetting({
			id: colorName,
			title: `Substitute Color for ${
				colorName.charAt(0).toUpperCase() + colorName.slice(1)
			}`,
			description: `Choose a hexcode color to substitute for ${
				colorName.charAt(0).toUpperCase() + colorName.slice(1)
			}. Feel free to include the # at the beginning or not!`,
			defaultValue: defaultColorList.colors[colorName],
		});
	}

	// setting for accent oclor

	await plugin.settings.registerStringSetting({
		id: "accent-color",
		title: "Accent Color",
		description:
			"Choose a color to use as an accent color. Feel free to include the # at the beginning or not!",
		defaultValue: "#89b4fa",
	});

	// Each time the setting changes, re-register the text color css.
	plugin.track(async (reactivePlugin) => {
		await setTheme(reactivePlugin);
	});

	// command to reload the theme
	await plugin.app.registerCommand({
		id: "reload-theme",
		name: "Reload Theme",
		description: "Reloads your current theme",
		action: async () => {
			await plugin.app.toast("Reloaded theme!");
			await setTheme(plugin);
		},
	});

	async function setTheme(reactivePlugin: RNPlugin) {
		const userThemeType: appearanceScheme =
			await reactivePlugin.settings.getSetting("type");

		const userThemeName: string = await reactivePlugin.settings.getSetting(
			"name"
		);

		// a object where the keys are the color names and the values are the hexcodes
		let colorsDict: customTheme["colors"] = {
			rosewater: "",
			flamingo: "",
			pink: "",
			mauve: "",
			red: "",
			maroon: "",
			peach: "",
			yellow: "",
			green: "",
			teal: "",
			sky: "",
			sapphire: "",
			blue: "",
			lavender: "",
			text: "",
			subtext1: "",
			subtext0: "",
			overlay2: "",
			overlay1: "",
			overlay0: "",
			surface2: "",
			surface1: "",
			surface0: "",
			base: "",
			mantle: "",
			crust: "",
		};

		for (const colorName in defaultColorList.colors) {
			const color = await reactivePlugin.settings.getSetting(colorName);
			if (color === "") {
				colorsDict[colorName] = defaultColorList.colors[colorName];
				continue;
			}
			if (color === null || color === undefined) {
				console.error(`${colorName} is null or undefined!`);
				return;
			}
			colorsDict[colorName] = color as string;
		}

		const accentColorCustom: string =
			await reactivePlugin.settings.getSetting("accent-color");

		let userTheme: customTheme = {
			type: userThemeType,
			name: userThemeName,
			accent: accentColorCustom,
			colors: colorsDict,
		}; // interface is built now we generate

		if (accentColorCustom === "") {
			userTheme.accent = defaultColorList.colors.blue;
		}
		const masterTheme: string = await fetch(
			`${plugin.rootURL}theme.less`
		).then((response) => response.text());
		let themeFile: string | any;
		console.log(userTheme);
		await formTheme(userTheme, masterTheme)
			.then((compiledCSS) => {
				themeFile = compiledCSS;
			})
			.catch((error) => {
				console.error(error);
			});
		await reactivePlugin.app.registerCSS("customTheme", themeFile);
	}
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
