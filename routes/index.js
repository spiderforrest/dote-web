
const router = require('express').Router();

const api = require('./api');
const root = require('./root');

router.use('/api', api);
router.use('/', root);

module.exports = router;
