import express from "express"

import { loginValidator, validate } from "../validators/auth-client-validator.js"
import registrationHandler from "../controllers/registration-controller.js"

import clientLoginHandler from "../controllers/client-login-controller.js"
import registrationSpHandler from "../controllers/registration-Sp-controller.js"
import ProviderLoginHandler from "../controllers/sp-login-controller.js"
import { loginValidatorProvider, validateProvider } from "../validators/auth-provider-validator.js"

const router = express.Router()
/**
 * @swagger
 *  title: Appointment Booking API
  version: 1.0.0
  description: API for managing appointments and time slots for service providers.
*/
/**
 * 
 * @swagger
 * 
 * /auth/clientRegister:
 *  post:
 *     summary: Register a new client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *  responses:
 *       '201':
 *         description: Client registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client registered successfully"
 *                 clientId:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *       '409':
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email already in use"
 */
router.post("/clientRegister", validate, registrationHandler)
/**
 * @swagger
 *   /auth/clientLogin:
 *   post:
 *     summary: Client login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login Successful"
 *                 token:
 *                   type: string
 *                   example: "jwt.token.here"
 *                 client:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *       '401':
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid Credentials"
 */
router.post("/clientLogin", loginValidator, clientLoginHandler)
/**
 * @swagger
 *   /auth/providerRegister:
 *   post:
 *     summary: Register a new service provider
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "Jane"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               profession:
 *                 type: string
 *                 example: "Therapist"
 *               description:
 *                 type: string
 *                 example: "Experienced therapist specializing in cognitive behavioral therapy."
 *               booked:
 *                 type: boolean
 *                 example: false
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - profession
 *               - description
 *               - booked
 *     responses:
 *       '201':
 *         description: Provider registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Provider registered successfully"
 *                 providerId:
 *                   type: string
 *                   format: uuid
 *       '409':
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email already in use"
 */
router.post("/providerRegister", validateProvider, registrationSpHandler)
/**
 * @swagger
 *  /auth/providerLogin:
 *   post:
 *     summary: Service provider login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login Successful"
 *                 token:
 *                   type: string
 *                   example: "jwt.token.here"
 *                 provider:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *       '401':
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid Credentials"
 */
router.post("/providerLogin", loginValidatorProvider, ProviderLoginHandler)


export default router