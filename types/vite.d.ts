/// <reference types="vite/client" />

declare module '*.svg' {
	const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
	export default content;
}

declare module '*.png' {
	const content: string;
	export default content;
}

declare module '*.jpg' {
	const content: string;
	export default content;
}

declare module '*.jpeg' {
	const content: string;
	export default content;
}

declare module '*.gif' {
	const content: string;
	export default content;
}

declare module '*.webp' {
	const content: string;
	export default content;
}

declare module '*.ico' {
	const content: string;
	export default content;
}

declare module '*.bmp' {
	const content: string;
	export default content;
}

declare module '*.tiff' {
	const content: string;
	export default content;
}

declare module '*.json' {
	const content: any;
	export default content;
}

declare module '*.css' {
	const content: { [className: string]: string };
	export default content;
}

declare module '*.scss' {
	const content: { [className: string]: string };
	export default content;
}

declare module '*.sass' {
	const content: { [className: string]: string };
	export default content;
}

declare module '*.less' {
	const content: { [className: string]: string };
	export default content;
}

declare module '*.styl' {
	const content: { [className: string]: string };
	export default content;
}

declare module '*.module.css' {
	const content: { [className: string]: string };
	export default content;
}

declare module '*.module.scss' {
	const content: { [className: string]: string };
	export default content;
}

declare module '*.module.sass' {
	const content: { [className: string]: string };
	export default content;
}

declare module '*.module.less' {
	const content: { [className: string]: string };
	export default content;
}

declare module '*.module.styl' {
	const content: { [className: string]: string };
	export default content;
}