import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

// Один воркер: обидва проєкти ходять в один dev-деплоймент Convex
export default defineConfig({
    testDir: 'e2e',
    workers: 1,
    use: {
        baseURL,
        trace: 'retain-on-failure'
    },
    projects: [
        {
            name: 'desktop',
            use: { ...devices[ 'Desktop Chrome' ], viewport: { width: 1280, height: 860 } }
        },
        {
            name: 'phone',
            use: { ...devices[ 'Pixel 7' ], viewport: { width: 390, height: 844 } }
        }
    ],
    webServer: process.env.E2E_BASE_URL
        ? undefined
        : { command: 'npm run dev', url: baseURL, reuseExistingServer: true },
    globalTeardown: './e2e/teardown.ts'
});
