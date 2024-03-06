1. Run locally

2. Remove alert `TODO: implement the process, locally!`

3. `juno dev start`

4. In `vite.config.ts` set `container: true`

5. Config local

```typescript
import { defineDevConfig } from '@junobuild/config';

export default defineDevConfig(() => ({
	satellite: {
		collections: {
			db: [
				{
					collection: 'renderings',
					memory: 'Stable' as const,
					read: 'managed' as const,
					write: 'managed' as const,
					mutablePermissions: true
				},
				{
					collection: 'prompts',
					memory: 'Stable' as const,
					read: 'managed' as const,
					write: 'managed' as const,
					mutablePermissions: true
				}
			],
			storage: [
				{
					collection: 'sketches',
					memory: 'Stable' as const,
					read: 'managed' as const,
					write: 'managed' as const,
					mutablePermissions: true,
					max_size: undefined
				}
			]
		},
		controllers: []
	}
}));
```

6. `juno dev eject`

7. Implement `ic_cdk::print("Hello World 👋");`

8. Implement HTTP outcalls

9. Upgrade mainnet `juno upgrade -t s -s target/deploy/satellite.wasm.gz`

10. Implement uploadBlob

> TODO: find and replace STEP_10_UPLOAD_BLOB
 
```typescript
const { fullPath } = await uploadBlob({
    data: blob,
    collection: 'sketches',
    filename: `${nanoid()}.png`,
    token: `${nanoid()}`
});

keyStore.set(fullPath);
```

11. Implement HTTP outcalls

12. Upgrade mainnet `juno upgrade -t s -s target/deploy/satellite.wasm.gz`

Go further:

13. Implement Analytics

14. Show GitHub Actions