import less from "less";
import tinycolor from "tinycolor2";

type appearanceScheme = "light" | "dark";

interface customTheme {
	type: appearanceScheme;
	name: string;
	creator?: string;
	accent: string;
	colors: {
		[key: string]: string;
		rosewater: string;
		flamingo: string;
		pink: string;
		mauve: string;
		red: string;
		maroon: string;
		peach: string;
		yellow: string;
		green: string;
		teal: string;
		sky: string;
		sapphire: string;
		blue: string;
		lavender: string;
		text: string;
		subtext1: string;
		subtext0: string;
		overlay2: string;
		overlay1: string;
		overlay0: string;
		surface2: string;
		surface1: string;
		surface0: string;
		base: string;
		mantle: string;
		crust: string;
	};
}

/**
 * Compiles a theme object into CSS using a master Less file and an accent color.
 * @param theme - The theme object to compile.
 * @param masterTheme - The master Less file to use as a template.
 * @returns A Promise that resolves to the compiled CSS.
 */
function formTheme(theme: customTheme, masterTheme: string) {
	let themeData = masterTheme.replace(/"appearance"/g, "." + theme.type); // theme.type will always be either light or dark
	const accentColor = tinycolor(theme.accent);
	themeData = themeData.replace(
		/@accent: @blue;/g,
		`@accent: ${accentColor.toHexString()};`
	);

	// prepend the color palette to the less file
	let palette = "";

	if (theme.colors === undefined) {
		console.error("No colors defined in theme object.");
		return;
	}

	for (const colorName in theme.colors) {
		let hexCode = theme.colors[colorName as keyof typeof theme.colors];
		let color = tinycolor(hexCode);
		palette += `@${colorName}-raw: ${color.toRgbString()};\n`;
		palette += `@${colorName}-hsl: ${color.toHslString()};\n`;
		palette += `@${colorName}-rgb: ${color.toRgbString()};\n`;
		palette += `@${colorName}: ${color.toHexString()};\n`;
	}

	// do the same for the accent color
	palette += `@accent-raw: ${accentColor.toRgbString()};\n`;
	palette += `@accent-hsl: ${accentColor.toHslString()};\n`;
	palette += `@accent-rgb: ${accentColor.toRgbString()};\n`;
	palette += `@accent: ${accentColor.toHexString()};\n`;

	themeData = palette + themeData;
	// compile the less file
	return new Promise((resolve, reject) => {
		// compile the less file
		less.render(themeData, (err: any, output: any) => {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(output.css);
			}
		});
	});
}

export { formTheme };
export type { customTheme, appearanceScheme };
