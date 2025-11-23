/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

import LoginController from '#controllers/auth/login_controller'
import RegisterController from '#controllers/auth/talent/register_controller'
import RecruiterRegisterController from '#controllers/auth/recruiter/register_controller'
import VerifyEmailController from '#controllers/auth/verify_email_controller'
import LogoutController from '#controllers/auth/logout_controller'

import DashboardController from '#controllers/talent/dashboard_controller'
import ApplyController from '#controllers/talent/apply_controller'
import ProfileController from '#controllers/talent/profile_controller'
import JobsController from '#controllers/talent/jobs_controller'

import RecruiterBoardController from '#controllers/recruiter/dashboard_controller'
import PostsController from '#controllers/recruiter/post_controller'

router.on('/').renderInertia('home').use(middleware.guest())

// Authentification
router
  .group(() => {
    router.get('/login', [LoginController, 'show']).as('auth.login')
    router.post('/login', [LoginController, 'login'])

    router
      .get('/register-talent', [RegisterController, 'show'])
      .as('auth.register.talent')
      .use(middleware.guest())
    router.post('/register/talent', [RegisterController, 'store'])

    router
      .get('/register-recruiter', [RecruiterRegisterController, 'show'])
      .as('auth.register.company')
      .use(middleware.guest())
    router.post('/register/recruiter', [RecruiterRegisterController, 'store'])

    router
      .get('/register/success', [VerifyEmailController, 'showSuccessRegister'])
      .as('auth.register.success')
      .use(middleware.auth())

    router.get('/verify/:id/:hash', [VerifyEmailController, 'verifyEmail'])
    router
      .post('/resend', [VerifyEmailController, 'resendVerification'])
      .as('auth.resend')
      .use(middleware.guest())

    router.delete('/logout', [LogoutController, 'logout']).as('auth.logout').use(middleware.auth())
  })
  .prefix('/auth')

router.get('/dashboard', () => {}).use([middleware.auth(), middleware.redirectByRole()])

// Route talent
router
  .group(() => {
    router.get('/dashboard', [DashboardController, 'index']).as('talent.dashboard')

    // Candidatures du talent
    router.get('/applies', [ApplyController, 'show']).as('talent.applies')
    router.post('/apply', [ApplyController, 'store'])
    router.put('/apply/:id', [ApplyController, 'update'])
    router.delete('/apply/:id', [ApplyController, 'delete'])

    // Job
    router.get('/job/:id', [JobsController, 'show']).as('talent.jobs')
    // router.post('/applies', [ApplyController, 'store'])
    // router.put('/applies/:id', [ApplyController, 'update'])
    // router.delete('/applies/:id', [ApplyController, 'delete'])

    // Candidatures du talent
    router.get('/profile', [ProfileController, 'show']).as('talent.profile')
    router.post('/profile/:id', [ProfileController, 'update'])

    router
      .get('/complete-profile', async ({ inertia }) => inertia.render('talent/complete-profile'))
      .as('complete.profile')
  })
  .prefix('/talent')
  .use([middleware.auth()])

// Route Recruiter / Entreprise
router
  .group(() => {
    router.get('/dashboard', [RecruiterBoardController, 'index']).as('recruiter.dashboard')

    // Routes pour les publications offres d'emploi
    router
      .group(() => {
        router.get('/', [PostsController, 'index']).as('recruiter.posts.index')
        router.get('/create', [PostsController, 'create']).as('recruiter.posts.create')
        router.post('/', [PostsController, 'store']).as('recruiter.posts.store')

        router.get('/:id', [PostsController, 'show']).as('recruiter.posts.show')
        router.put('/:id', [PostsController, 'update'])
        router.delete('/:id', [PostsController, 'delete'])
        router.post('/:id/close', [PostsController, 'close']).as('recruiter.posts.close')
      }).prefix('/posts')
  })
  .prefix('/recruiter')
  .use(middleware.auth())
