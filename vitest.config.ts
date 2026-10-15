import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            projects: [
                {
                    extends: true,
                    test: {
                        name: 'convex',
                        include: [ 'convex/**/*.test.ts' ],
                        environment: 'edge-runtime'
                    }
                },
                {
                    extends: true,
                    test: {
                        name: 'frontend',
                        include: [ 'src/**/*.test.{ts,tsx}' ],
                        environment: 'jsdom',
                        // react-loader-spinner тягне styled-components; без інлайну Node віддає не той default-експорт
                        server: { deps: { inline: [ 'react-loader-spinner' ] } }
                    }
                }
            ]
        }
    })
);
