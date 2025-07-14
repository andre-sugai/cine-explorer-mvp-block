# 🎬 Cine Explorer

Aplicativo React para explorar filmes e séries usando a API do The Movie Database (TMDB).

## 📋 Funcionalidades

- **Modal de Configuração da API**: Aparece automaticamente na primeira visita para configurar a chave API do TMDB
- **Navegação Intuitiva**: Home, Favoritos, Assistidos e Sobre
- **Design Cinematográfico**: Tema com cores azul escuro, dourado e preto
- **Armazenamento Local**: Chave API salva no localStorage do navegador
- **Layout Responsivo**: Funciona perfeitamente em desktop e mobile
- **Validação de API**: Verificação do formato correto da chave API

## 🎨 Design System

O aplicativo utiliza um design system cinematográfico com:
- **Cores principais**: Azul escuro, dourado e preto
- **Gradientes**: Efeitos visuais cinematográficos
- **Componentes**: Baseados em shadcn/ui
- **Animações**: Transições suaves e efeitos hover

## 🚀 Como usar

1. **Primeira vez**: O modal de configuração da API aparecerá automaticamente
2. **Obter chave API**: Siga as instruções para obter sua chave no TMDB
3. **Configurar**: Cole a chave API no modal e clique em "Confirmar e Entrar"
4. **Explorar**: Use a navegação para explorar diferentes seções

## 🔧 Tecnologias

- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- The Movie Database (TMDB) API
- Vite

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/                 # Componentes UI base
│   ├── ApiConfigModal.tsx  # Modal de configuração da API
│   ├── Header.tsx          # Header com navegação
│   ├── HomePage.tsx        # Página inicial
│   ├── FavoritesPage.tsx   # Página de favoritos
│   ├── WatchedPage.tsx     # Página de assistidos
│   ├── AboutPage.tsx       # Página sobre
│   └── CineExplorer.tsx    # Componente principal
├── pages/
│   ├── Index.tsx           # Página inicial da aplicação
│   └── NotFound.tsx        # Página 404
├── utils/
│   └── tmdb.ts            # Utilitários para API TMDB
└── styles/
    └── index.css          # Estilos globais e design system
```

## 🎯 Próximas Funcionalidades

- [ ] Busca de filmes e séries
- [ ] Detalhes de filmes com trailers
- [ ] Sistema de favoritos funcional
- [ ] Controle de filmes assistidos
- [ ] Avaliações pessoais
- [ ] Descoberta de filmes por gênero
- [ ] Recomendações personalizadas

## 📝 Projeto info

**URL**: https://lovable.dev/projects/54a2f377-6b46-4cfb-9f3d-8767f06a729a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/54a2f377-6b46-4cfb-9f3d-8767f06a729a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/54a2f377-6b46-4cfb-9f3d-8767f06a729a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
