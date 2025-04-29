import express from "express"

import { loginValidator, validate } from "../validators/auth-client-validator.js"
import registrationHandler from "../controllers/registration-controller.js"

import clientLoginHandler from "../controllers/client-login-controller.js"
import registrationSpHandler from "../controllers/registration-Sp-controller.js"
import ProviderLoginHandler from "../controllers/sp-login-controller.js"
import { loginValidatorProvider, validateProvider } from "../validators/auth-provider-validator.js"

const router = express.Router()

router.post("/clientRegister", validate, registrationHandler)

router.post("/clientLogin", loginValidator, clientLoginHandler)

router.post("/providerRegister", validateProvider, registrationSpHandler)

router.post("/providerLogin", loginValidatorProvider, ProviderLoginHandler)


export default router