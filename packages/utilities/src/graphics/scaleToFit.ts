interface Dimensions {
	height: number;
	width: number;
}

interface ScaledDimensions extends Dimensions {
	scale: number;
}

export const scaleToFit = (
	container: Dimensions,
	object: Dimensions,
): ScaledDimensions => {
	const scaleX = container.width / object.width;
	const scaleY = container.height / object.height;

	const scale = Math.min(scaleX, scaleY);

	return {
		height: object.height * scale,
		scale,
		width: object.width * scale,
	};
};
