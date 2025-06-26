
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold text-brazil-blue">
            GApp
          </Link>
          <div>
            <Link
              to="/login"
              className="bg-brazil-green text-white font-semibold py-2 px-5 rounded-lg shadow hover:bg-green-700 transition duration-200"
            >
              Gestão
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-brazil-blue text-white py-20 lg:py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Crie Agentes de IA Personalizados para seu Negócio!
          </h1>
          <p className="text-lg lg:text-2xl mb-10 text-brazil-yellow font-medium">
            Com GApp, configure assistentes virtuais inteligentes com seus próprios prompts,
            API Gemini e arquivos de referência.
          </p>
          <Link
            to="/signup"
            className="bg-brazil-yellow text-brazil-blue text-lg font-bold py-4 px-10 rounded-lg shadow-xl hover:bg-yellow-300 transition duration-300 transform hover:scale-105"
          >
            Contratar Agora (R$ 50/mês)
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-16">
            Por que escolher GApp?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brazil-green mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l-4 4-4-4M6 16l-4-4 4-4" /></svg>
                ),
                title: 'Prompt Mestre Customizável',
                description: 'Defina o comportamento exato do seu agente IA com um prompt mestre detalhado e poderoso.',
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brazil-green mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                ),
                title: 'Sua Própria API Gemini',
                description: 'Utilize sua chave de API do Google Gemini para ter controle total sobre o uso e custos.',
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brazil-green mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                ),
                title: 'Suporte a Mídia',
                description: 'Anexe imagens (JPG, PNG, WEBP) e vídeos (MP4) para que seu agente possa exibi-los durante a conversa.',
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brazil-green mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                ),
                title: 'Painel de Gestão Intuitivo',
                description: 'Crie, configure e gerencie todos os seus GApps de forma fácil e centralizada.',
              },
              {
                icon: (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brazil-green mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                ),
                title: 'Respostas em Tempo Real',
                description: 'Interaja com seus GApps através de um chat responsivo com respostas em streaming.',
              },
               {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brazil-green mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                ),
                title: 'Grounding com Google Search',
                description: 'Permita que seus agentes busquem informações atualizadas na web para respostas mais precisas.',
              },
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <div className="flex justify-center items-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-center text-gray-700 mt-2 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-center text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA / Existing Client */}
       <section className="py-16 lg:py-24 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Pronto para começar?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Crie seu primeiro agente GApp em minutos.
          </p>
          <Link
            to="/signup"
            className="bg-brazil-green text-white text-lg font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-green-700 transition duration-300 mr-4"
          >
            Assine o GApp Pro - R$ 50/mês
          </Link>
          <Link
            to="/login"
            className="text-brazil-blue hover:text-blue-700 font-semibold transition duration-300"
          >
            Já é cliente? Acesse seu painel.
          </Link>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-brazil-blue text-white py-10">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} GApp. Todos os direitos reservados.</p>
          <p className="text-sm text-gray-300 mt-1">Uma plataforma inovadora para seus agentes de IA.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
