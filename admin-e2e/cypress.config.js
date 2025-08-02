const { defineConfig } = require('cypress');
const { nxE2EPreset } = require('@nx/cypress/plugins/cypress-preset.js');

module.exports = defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: 'npx nx run @mot-platform/admin:dev'
      },
      ciWebServerCommand: 'npx nx run @mot-platform/admin:start',
      ciBaseUrl: 'http://localhost:3000'
    }),
    baseUrl: 'http://127.0.0.1:3000'
  }
});
