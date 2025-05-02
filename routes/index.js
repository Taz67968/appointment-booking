import express from 'express';
import authMiddleware from "../middilewares/authmiddlewares.js"

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

export default router