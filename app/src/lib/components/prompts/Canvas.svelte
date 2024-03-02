<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { unifyEvent } from '$lib/utils/touch.utils';
	import { Pencil } from '$lib/types/pencil';
	import type { Drawable } from '$lib/types/drawable';
	import { fade } from 'svelte/transition';
	import { keyNotLoaded } from '$lib/derived/asset.derived';
	import Container from '$lib/components/ui/Container.svelte';

	/**
	 * Draw pane and size
	 */

	let article: HTMLElement | undefined | null = undefined;

	let size: { width: number; height: number; leftOffset: number; topOffset: number } | undefined =
		undefined;
	$: article, initSize();

	const initSize = () => {
		if (isNullish(article)) {
			size = undefined;
			return;
		}

		const { width, left, top } = article.getBoundingClientRect();
		const { borderWidth } = window.getComputedStyle(article);

		const innerWidth = width - 2 * parseInt(borderWidth);

		size = { width: innerWidth, height: innerWidth, leftOffset: left, topOffset: top };
	};

	const onResize = () => {
		drawables = [];
		initSize();
	};

	/**
	 * Canvas and context
	 */

	export let canvas: HTMLCanvasElement | undefined | null;
	let ctx: CanvasRenderingContext2D | undefined | null;

	const initContext = () => (ctx = canvas?.getContext('2d', { desynchronized: true }));

	$: canvas, initContext();

	/**
	 * Drawing
	 */

	let editable = true;
	$: editable = $keyNotLoaded;

	export let untouched = true;
	let drawEvents = false;

	let startX: number;
	let startY: number;

	const startEvent = (e: MouseEvent | TouchEvent) => {
		if (!editable) {
			return;
		}

		startX = unifyEvent(e).clientX - (size?.leftOffset ?? 0);
		startY = unifyEvent(e).clientY - (size?.topOffset ?? 0) + window.scrollY;

		drawEvents = true;
		untouched = false;
	};

	const endEvent = () => (drawEvents = false);

	let drawables: Drawable[] = [];

	const drawEvent = (e: MouseEvent | TouchEvent) => {
		if (!drawEvents || !editable) {
			return;
		}

		const toX = unifyEvent(e).clientX - (size?.leftOffset ?? 0);
		const toY = unifyEvent(e).clientY - (size?.topOffset ?? 0) + window.scrollY;

		drawables.push(new Pencil({ x: startX, y: startY }, { x: toX, y: toY }, '#000000'));

		startX = toX;
		startY = toY;

		draw();
	};

	const draw = () => {
		if (isNullish(size) || isNullish(ctx)) {
			// For simplicity reason, this is a demo
			return;
		}

		ctx.clearRect(0, 0, size.width, size.height);
		for (const drawable of drawables) {
			drawable.draw(ctx);
		}
	};
</script>

<svelte:window on:resize={onResize} />

<Container bind:article disabled={!editable}>
	{#if nonNullish(size)}
		<canvas
			bind:this={canvas}
			width={size.width}
			height={size.height}
			on:mousedown={startEvent}
			on:touchstart|passive={startEvent}
			on:mouseup={endEvent}
			on:touchend={endEvent}
			on:mousemove={drawEvent}
			on:touchmove|passive={drawEvent}
		></canvas>
	{/if}

	{#if untouched}
		<div
			out:fade={{ duration: 250 }}
			class="pointer-events-none p-8 w-full h-full absolute inset-0 flex items-center justify-center"
		>
			<p class="font-bold text-6xl text-gray-300 break-words text-center">Draw me</p>
		</div>
	{/if}
</Container>
