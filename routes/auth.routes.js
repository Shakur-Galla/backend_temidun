import {Router} from 'express'
import { signIn,signOut,signUp, verifySession } from '../controllers/auth.controller.js'

const authRouter = Router()

// /api/v1/auth/signup
authRouter.post('/sign-up', signUp)

//Signin Monitor or Reporter
authRouter.post('/sign-in', signIn)

//Signout Monitor or Reporter
authRouter.post('/sign-out', signOut)

authRouter.get('/verify-session', verifySession)

export default authRouter