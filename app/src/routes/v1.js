const config = require('config');
const fs = require('fs');
const path = require('path');
const router = require('express').Router();
const yaml = require('js-yaml');

// TODO: Insert Keycloak protect middleware that respects the keycloak.enabled toggle
// const keycloak = require('../components/keycloak');
const { routes: objectRouter } = require('../components/objectStorage');

const getSpec = () => {
  const rawSpec = fs.readFileSync(path.join(__dirname, '../docs/v1.api-spec.yaml'), 'utf8');
  const spec = yaml.load(rawSpec);
  spec.servers[0].url = '/api/v1';
  spec.components.securitySchemes.OpenID.openIdConnectUrl = `${config.get('keycloak.serverUrl')}/realms/${config.get('keycloak.realm')}/.well-known/openid-configuration`;
  return spec;
};

// Base v1 Responder
router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/docs',
      '/hello'
    ]
  });
});

/** OpenAPI Docs */
router.get('/docs', (_req, res) => {
  const docs = require('../docs/docs');
  res.send(docs.getDocHTML('v1'));
});

/** OpenAPI YAML Spec */
router.get('/api-spec.yaml', (_req, res) => {
  res.status(200).type('application/yaml').send(yaml.dump(getSpec()));
});

/** OpenAPI JSON Spec */
router.get('/api-spec.json', (_req, res) => {
  res.status(200).json(getSpec());
});

/** Object Router */
router.use('/object', objectRouter);

module.exports = router;
