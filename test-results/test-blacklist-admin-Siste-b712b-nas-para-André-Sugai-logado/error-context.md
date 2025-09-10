# Page snapshot

```yaml
- dialog "Configurar API do TMDB":
  - heading "Configurar API do TMDB" [level=2]:
    - img
    - text: Configurar API do TMDB
  - paragraph: Para usar o Cine Explorer, você precisa configurar sua chave API do The Movie Database (TMDB).
  - img
  - heading "Benefícios da API" [level=3]
  - paragraph: A API permite buscar informações detalhadas sobre filmes, séries, atores e diretores, incluindo sinopses, avaliações, trailers e muito mais.
  - img
  - heading "Segurança" [level=3]
  - paragraph: Sua chave API será armazenada apenas no seu navegador e não será compartilhada com terceiros.
  - heading "Como obter sua chave API:" [level=3]
  - list:
    - listitem:
      - text: Acesse
      - link "https://www.themoviedb.org/":
        - /url: https://www.themoviedb.org/
        - text: https://www.themoviedb.org/
        - img
    - listitem: Crie uma conta gratuita se ainda não tiver
    - listitem:
      - text: Faça login e vá em
      - strong: Configurações → API
    - listitem: Solicite uma chave de API (API Key)
    - listitem: Copie a chave gerada e cole no campo abaixo
  - text: Chave API do TMDB
  - textbox "Chave API do TMDB"
  - button "Confirmar e Entrar"
```