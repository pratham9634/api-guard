/**
 * @file analyticsRoutes.js
 * @description Registers HTTP endpoints for retrieving client statistics, dashboard layouts, and report logs.
 */

import express from 'express';
import analyticsContainer from '../Dependencies/dependencies.js';
const { analyticsController } = analyticsContainer.controllers;
import authenticate from '../../../shared/middlewares/authenticate.js';

const router = express.Router();

// Fetch overall hits statistics
router.get("/stats", authenticate, (req, res, next) => analyticsController.getStats(req, res, next));

// Fetch primary overview dashboard
router.get("/dashboard", authenticate, (req, res, next) => analyticsController.getDashboard(req, res, next))

// Fetch advanced report datasets
router.get("/reports", authenticate, (req, res, next) => analyticsController.getReports(req, res, next));

export default router