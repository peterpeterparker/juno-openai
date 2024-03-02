<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { uploadFile } from '@junobuild/core-peer';
	import { nanoid } from 'nanoid';

	let files: FileList;

	const upload = async () => {
		const data = files?.[0];

		if (isNullish(data)) {
			return;
		}

		const { downloadUrl } = await uploadFile({
			data,
			collection: 'images',
			filename: `${nanoid()}.png`
		});

		console.log(downloadUrl);
	};

	const systemPrompt = `You are an expert web designer who specializes in programming SVG.
You are famous for designing those SVG while following movements of arts that included expressionism and surrealism.
You explored color theory as well.
You used to taught at the Bauhaus school of art and design in Germany.
A user will provide you with a low-fidelity sketch of an drawing.
You will return a single SVG file to create a high fidelity improved drawing that can be used as a background or hero pane on a website.
You like to add colors and gradients in your work so will you do with this SVG.
You dislike white or black background and prefer flash gradient colors.
You also like to add some forms and additional objects of your own creation within the drawing.
You are also a big fan a punk music which influences your style by making things not too square.
The user will provide you with notes in blue or red text, arrows, or drawings.
Carry out any changes they request from you.
Use creative license to make the application more fleshed out.
Respond ONLY with the contents of the SVG file.
Try to process everything in maximum 25 seconds`;

	const test = async () => {
		const response = await fetch(
			`https://us-central1-openai-proxy-ipv6.cloudfunctions.net/openai/chat/completions`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'gpt-4-vision-preview',
					max_tokens: 4096,
					temperature: 0,
					messages: [
						{
							role: 'system',
							content: systemPrompt
						},
						{
							role: 'user',
							content: [
								{
									type: 'image_url',
									image_url: {
										url: 'https://xo2hm-lqaaa-aaaal-ab3oa-cai.icp0.io/images/house123.png',
										detail: 'high'
									}
								},
								{
									type: 'text',
									text: 'Turn this into a single svg file.'
								}
							]
						}
					]
				})
			}
		);

		if (!response.ok) {
			console.error('Response not ok!', response);
			return;
		}

		const result = await response.json();
		console.log('OK', result);
	};
</script>

<input type="file" bind:files />

<button on:click={upload}>Upload</button>

<button on:click={test}>Test</button>

<hr />

<svg width="630px" height="630px" viewBox="0 0 630 630" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
			<stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
			<stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
		</linearGradient>
		<linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
			<stop offset="0%" style="stop-color:rgb(0,255,255);stop-opacity:1" />
			<stop offset="100%" style="stop-color:rgb(0,0,255);stop-opacity:1" />
		</linearGradient>
		<linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%">
			<stop offset="0%" style="stop-color:rgb(0,255,0);stop-opacity:1" />
			<stop offset="100%" style="stop-color:rgb(255,0,255);stop-opacity:1" />
		</linearGradient>
	</defs>
	<rect x="0" y="0" width="630" height="630" fill="url(#grad3)" />
	<path
		d="M 150 150 L 300 50 L 450 150 L 450 400 L 300 500 L 150 400 Z"
		fill="url(#grad1)"
		stroke="black"
		stroke-width="5"
	/>
	<rect x="190" y="190" width="70" height="70" fill="white" stroke="black" stroke-width="3" />
	<rect x="370" y="190" width="70" height="70" fill="white" stroke="black" stroke-width="3" />
	<path
		d="M 250 400 L 350 400 L 350 500 L 250 500 Z"
		fill="white"
		stroke="black"
		stroke-width="3"
	/>
	<path d="M 100 450 Q 150 350, 200 450" fill="none" stroke="url(#grad2)" stroke-width="5" />
	<path d="M 100 450 Q 150 550, 200 450" fill="none" stroke="url(#grad2)" stroke-width="5" />
	<path d="M 430 450 Q 480 350, 530 450" fill="none" stroke="url(#grad2)" stroke-width="5" />
	<path d="M 430 450 Q 480 550, 530 450" fill="none" stroke="url(#grad2)" stroke-width="5" />
	<circle cx="300" cy="300" r="20" fill="black" />
</svg>

<svg width="630" height="630" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<linearGradient id="roofGradient" x1="0%" y1="0%" x2="100%" y2="0%">
			<stop offset="0%" style="stop-color:#ff0055;stop-opacity:1" />
			<stop offset="100%" style="stop-color:#ff5500;stop-opacity:1" />
		</linearGradient>
		<linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
			<stop offset="0%" style="stop-color:#00d7ff;stop-opacity:1" />
			<stop offset="100%" style="stop-color:#0055ff;stop-opacity:1" />
		</linearGradient>
		<linearGradient id="groundGradient" x1="0%" y1="0%" x2="100%" y2="0%">
			<stop offset="0%" style="stop-color:#55ff00;stop-opacity:1" />
			<stop offset="100%" style="stop-color:#aaff00;stop-opacity:1" />
		</linearGradient>
	</defs>
	<g stroke="#000" stroke-width="2" fill="none">
		<path d="M 150 200 L 300 50 L 450 200 Z" fill="url(#roofGradient)" />
		<rect x="150" y="200" width="300" height="300" fill="url(#wallGradient)" />
		<rect x="230" y="280" width="60" height="60" fill="#fff" />
		<rect x="310" y="280" width="60" height="60" fill="#fff" />
		<path d="M 270 400 L 270 500 L 330 500 L 330 400 Z" fill="#fff" />
		<path d="M 0 500 L 630 500 L 630 630 L 0 630 Z" fill="url(#groundGradient)" />
	</g>
	<g fill="#ff0055">
		<circle cx="100" cy="550" r="30" />
		<circle cx="530" cy="550" r="30" />
	</g>
</svg>
