import { usePage } from '@inertiajs/react'
import React from 'react'
import Footer from '~/components/footer'
import Logo from '~/components/logo'

export default function Home({ jobs = [] }) {
  console.log(usePage().props)
  return (
    <div className="min-h-screen bg-white text-gray-800 antialiased">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/">
            <Logo className="text-black" />
          </a>{' '}
          <span className="text-sm text-gray-500">Connect Talent & Companies</span>
        </div>

        <nav className="flex items-center gap-4">
          <a
            href="/auth/login"
            className="text-sm px-3 font-semibold py-2 rounded-md hover:bg-gray-100"
          >
            Se connecter
          </a>
          <a
            href="/auth/register-recruiter"
            className="text-sm px-4 py-2 rounded-md bg-green-600 text-white shadow hover:opacity-95"
          >
            Devenir Recruiter
          </a>
          <a
            href="/auth/register-talent"
            className="text-sm px-4 py-2 rounded-md border border-green-600 text-green-600 hover:text-white hover:bg-green-600 transition-all ease-in-out duration-500"
          >
            Devenir un Talent
          </a>
        </nav>
      </header>

      {/* Banner */}
      <section className="bg-linear-to-r from-green-100 via-lime-100 to-white">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
              Poste & trouvez les meilleurs talents instantanément
            </h1>
            <p className="mt-4 text-gray-600 max-w-xl">
              Mettez en relation entreprises et travailleurs qualifiés — travail flexible,
              recrutement rapide et options personnalisées selon vos besoins.
            </p>

            <div className="mt-8 flex gap-3">
              <form className="flex w-full max-w-2xl items-center bg-white rounded-full shadow px-4 py-2">
                <input
                  type="search"
                  placeholder="Rechercher des offres, ex: développeur React"
                  className="flex-1 outline-none px-3 text-sm"
                />
                <button
                  type="submit"
                  className="ml-3 bg-amber-400 text-white px-4 py-2 rounded-full text-sm"
                >
                  Rechercher
                </button>
              </form>
            </div>

            <div className="mt-6 flex gap-3 items-center text-sm text-gray-500">
              <span>Les plus populaires: </span>
              <span className="px-3 py-1 rounded-full bg-indigo-50">Video Editing</span>
              <span className="px-3 py-1 rounded-full bg-indigo-50">Marketing</span>
              <span className="px-3 py-1 rounded-full bg-indigo-50">UI/UX</span>
              <span className="px-3 py-1 rounded-full bg-indigo-50">Programming</span>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-101 transition">
              {/* Illustration placeholder */}
              <div className="h-72 bg-linear-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="24" height="24" rx="4" fill="white" opacity="0.2" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg">Trouvez le talent idéal en quelques clics</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Profils vérifiés, processus simplifié, et support dédié pour toutes vos embauches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center">Nos Services</h2>
        <p className="text-center text-gray-600 mt-2">
          Solutions adaptées aux entreprises et aux talents — recrutement, formation et panels
          d'entretien.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
              T
            </div>
            <h3 className="mt-4 font-semibold">Custom Training Solutions</h3>
            <p className="mt-2 text-sm text-gray-600">
              Formations sur mesure pour monter en compétences rapidement vos équipes.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 font-bold">
              P
            </div>
            <h3 className="mt-4 font-semibold">Plug-n-Play Resources</h3>
            <p className="mt-2 text-sm text-gray-600">
              Accès à des talents pré-vérifiés prêts à commencer sans délai.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold">
              I
            </div>
            <h3 className="mt-4 font-semibold">Expert Interview Panels</h3>
            <p className="mt-2 text-sm text-gray-600">
              Panels spécialisés pour garantir une sélection adaptée à vos besoins.
            </p>
          </div>
        </div>
      </section>

      {/* 05 dernieres opportunites */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center">Dernières opportunités</h2>
        <p className="text-center text-gray-600 mt-2">
          Découvrez les offres récentes adaptées à vos compétences.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(jobs && jobs.length > 0 ? jobs : sampleJobs()).map((job, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-2xl shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-700">
                    {job.company?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{job.title}</div>
                    <div className="text-xs text-gray-500">{job.company || 'Digital Souls'}</div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-3">{job.summary}</p>

                <div className="mt-4 flex gap-2 flex-wrap">
                  {job.tags?.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-lg font-bold">${job.salary || 750}</div>
                <a
                  href={`/jobs/${job.id || idx}`}
                  className="text-sm px-3 py-2 rounded-full bg-green-50 text-green-700"
                >
                  Apply Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* A propos */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center">Pourquoi nous choisir ?</h2>
        <p className="text-center text-gray-600 mt-2">
          Flexibilité, rapidité et talents vérifiés pour accélérer vos recrutements.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-green-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold w-3/4">
              CONNECTER LES OPPORTUNITES AUX TALENTS SANS EFFORS
            </h3>
            <p className="mt-4 text-gray-600">
              Notre plateforme facilite la mise en relation entre entreprises et travailleurs
              qualifiés, avec des outils pour gérer le process du début à la fin.
            </p>
          </div>
          <div>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold">Efficient</h4>
                  <p className="text-sm text-gray-600">
                    Accès instantané à des professionnels qualifiés.
                  </p>
                </div>
              </li>

              <li className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold">Cost-Effective</h4>
                  <p className="text-sm text-gray-600">
                    Payez uniquement pour l'expertise nécessaire.
                  </p>
                </div>
              </li>

              <li className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold">Impactful</h4>
                  <p className="text-sm text-gray-600">
                    Solutions pour résoudre des problèmes spéficiques et créer des opportunités.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}


