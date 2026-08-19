import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        rollupOptions: {
          output: {
            /**
             * Split the dependencies out of the app chunk.
             *
             * Everything used to land in one ~693 kB file, so editing a line of
             * App.tsx invalidated the whole thing for returning visitors even
             * though most of those bytes — React and Recharts — had not changed.
             * With `/assets/*` served immutable for a year, that is the difference
             * between re-downloading ~205 kB gzip per deploy and re-downloading the
             * app slice alone.
             *
             * Keeping recharts whole here also settles Rollup's circular-chunk
             * warning: ScenarioComparison is lazy-loaded and imports `Bar`, which
             * split the recharts barrel across two mutually dependent chunks. That
             * only worked because the main chunk always happened to load first.
             *
             * One vendor chunk, deliberately. Splitting React and Recharts apart
             * produced a charts chunk that evaluated before React was initialised
             * ("Cannot read properties of undefined (reading 'forwardRef')") — the
             * finer split buys nothing here anyway, since the two are always
             * upgraded together.
             */
            manualChunks: (id: string) =>
              id.includes('node_modules') ? 'vendor' : undefined,
          },
        },
      },
    };
});
