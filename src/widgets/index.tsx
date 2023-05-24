import {
	declareIndexPlugin,
	ReactRNPlugin,
	RNPlugin,
} from "@remnote/plugin-sdk";
import { formTheme, customTheme, appearanceScheme } from "../funcs/buildLess";

const colorList = [
	"rosewater",
	"flamingo",
	"pink",
	"mauve",
	"red",
	"maroon",
	"peach",
	"yellow",
	"green",
	"teal",
	"sky",
	"sapphire",
	"blue",
	"lavender",
	"text",
	"subtext1",
	"subtext0",
	"overlay2",
	"overlay1",
	"overlay0",
	"surface2",
	"surface1",
	"surface0",
	"base",
	"mantle",
	"crust",
];

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
	for (let i = 0; i < colorList.length; i++) {
		await plugin.settings.registerStringSetting({
			id: colorList[i],
			title: `Substitute Color for ${colorList[i]}`,
			description: `Choose a hexcode color to substitute for ${colorList[i]}. Feel free to include the # at the beginning or not!`,
		});
	}

	// setting for accent oclor

	await plugin.settings.registerStringSetting({
		id: "accent-color",
		title: "Accent Color",
		description:
			"Choose a color to use as an accent color. Feel free to include the # at the beginning or not!",
		defaultValue: "#89B4FA",
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

		for (let i = 0; i < colorList.length; i++) {
			const color = await reactivePlugin.settings.getSetting(
				colorList[i]
			);
			if (color === null || color === undefined) {
				console.error(`${colorList[i]} is null or undefined!`);
				return;
			}
			colorsDict[colorList[i]] = color as string;
		}

		let userTheme: customTheme = {
			type: userThemeType,
			name: userThemeName,
			accent: await reactivePlugin.settings.getSetting("accent-color"),
			colors: colorsDict,
		}; // interface is built now we generate

		const masterTheme: string = await fetch(
			`${plugin.rootURL}theme.less`
		).then((response) => response.text());
		let themeFile: string | any;
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
