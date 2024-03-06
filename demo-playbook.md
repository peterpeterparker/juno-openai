1. `juno dev start`

2. In `vite.config.ts` set `container: true`

3. Config local

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

4. `juno dev eject`

5. Implement `ic_cdk::print("Hello World 👋");`

6. Implement HTTP outcalls

7. Upgrade mainnet `juno upgrade -t s -s target/deploy/satellite.wasm.gz`

Go further:

8. Implement Analytics

9. Show GitHub Actions 