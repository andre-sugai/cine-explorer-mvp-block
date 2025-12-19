import {
  isAdminUser,
  addToBlacklist,
  removeFromBlacklist,
  getBlacklistedTitles,
  isAdultContent,
  filterAdultContent,
} from '../adultContentFilter';

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock do console.log para evitar spam nos testes
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = jest.fn();
  localStorage.clear();
});

afterEach(() => {
  console.log = originalConsoleLog;
});

describe('Sistema de Blacklist - Funções Utilitárias', () => {
  describe('isAdminUser', () => {
    test('deve retornar true para André Sugai', () => {
      expect(isAdminUser('guitarfreaks@gmail.com')).toBe(true);
    });

    test('deve retornar false para outros usuários', () => {
      expect(isAdminUser('usuario@teste.com')).toBe(false);
      expect(isAdminUser('admin@teste.com')).toBe(false);
      expect(isAdminUser('')).toBe(false);
      expect(isAdminUser(undefined)).toBe(false);
    });

    test('deve usar localStorage como fallback', () => {
      localStorage.setItem('user_email', 'guitarfreaks@gmail.com');
      expect(isAdminUser()).toBe(true);

      localStorage.setItem('user_email', 'outro@email.com');
      expect(isAdminUser()).toBe(false);
    });
  });

  describe('getBlacklistedTitles', () => {
    test('deve retornar lista padrão quando não há dados salvos', () => {
      const titles = getBlacklistedTitles();
      expect(titles).toContain('dirty ice cream');
      expect(titles).toContain('ligaw');
      expect(titles.length).toBeGreaterThan(20);
    });

    test('deve retornar títulos personalizados do localStorage', () => {
      const customTitles = ['filme teste 1', 'filme teste 2'];
      localStorage.setItem('blacklisted_titles', JSON.stringify(customTitles));

      const titles = getBlacklistedTitles();
      expect(titles).toEqual(customTitles);
    });

    test('deve retornar lista padrão se dados do localStorage forem inválidos', () => {
      localStorage.setItem('blacklisted_titles', 'dados_invalidos');

      const titles = getBlacklistedTitles();
      expect(titles).toContain('dirty ice cream');
    });
  });

  describe('addToBlacklist', () => {
    test('deve adicionar título à blacklist quando usuário é admin', () => {
      const testTitle = 'Filme de Teste';
      addToBlacklist(testTitle, 'guitarfreaks@gmail.com');

      const titles = getBlacklistedTitles();
      expect(titles).toContain('filme de teste');
    });

    test('deve lançar erro quando usuário não é admin', () => {
      expect(() => {
        addToBlacklist('Filme Teste', 'usuario@teste.com');
      }).toThrow('Acesso negado');
    });

    test('deve lançar erro quando título já está na blacklist', () => {
      const testTitle = 'Filme Duplicado';
      addToBlacklist(testTitle, 'guitarfreaks@gmail.com');

      expect(() => {
        addToBlacklist(testTitle, 'guitarfreaks@gmail.com');
      }).toThrow('já está na blacklist');
    });

    test('deve normalizar título para minúsculas', () => {
      addToBlacklist('FILME MAIÚSCULO', 'guitarfreaks@gmail.com');

      const titles = getBlacklistedTitles();
      expect(titles).toContain('filme maiúsculo');
    });
  });

  describe('removeFromBlacklist', () => {
    test('deve remover título da blacklist quando usuário é admin', () => {
      // Primeiro adiciona
      addToBlacklist('Filme Para Remover', 'guitarfreaks@gmail.com');
      let titles = getBlacklistedTitles();
      expect(titles).toContain('filme para remover');

      // Depois remove
      removeFromBlacklist('Filme Para Remover', 'guitarfreaks@gmail.com');
      titles = getBlacklistedTitles();
      expect(titles).not.toContain('filme para remover');
    });

    test('deve lançar erro quando usuário não é admin', () => {
      expect(() => {
        removeFromBlacklist('Filme Teste', 'usuario@teste.com');
      }).toThrow('Acesso negado');
    });
  });

  describe('isAdultContent', () => {
    test('deve detectar filme na blacklist', () => {
      const movie = {
        title: 'Dirty Ice Cream',
        overview: 'Um filme qualquer',
        tagline: '',
      };

      // Ativar filtro
      localStorage.setItem('adult_content_filter', 'true');

      expect(isAdultContent(movie)).toBe(true);
    });

    test('deve ignorar filtro quando desativado', () => {
      const movie = {
        title: 'Dirty Ice Cream',
        overview: 'Um filme qualquer',
        tagline: '',
      };

      localStorage.setItem('adult_content_filter', 'false');

      expect(isAdultContent(movie)).toBe(false);
    });

    test('deve detectar filme adicionado dinamicamente à blacklist', () => {
      const movie = {
        title: 'Filme Dinâmico Teste',
        overview: 'Descrição do filme',
        tagline: '',
      };

      localStorage.setItem('adult_content_filter', 'true');

      // Primeiro não deve estar bloqueado
      expect(isAdultContent(movie)).toBe(false);

      // Adicionar à blacklist
      addToBlacklist('Filme Dinâmico Teste', 'guitarfreaks@gmail.com');

      // Agora deve estar bloqueado
      expect(isAdultContent(movie)).toBe(true);
    });
  });

  describe('filterAdultContent', () => {
    test('deve filtrar filmes da blacklist', () => {
      const movies = [
        { title: 'Filme Normal', overview: 'Descrição normal' },
        { title: 'Dirty Ice Cream', overview: 'Filme adulto' },
        { title: 'Outro Filme Normal', overview: 'Outra descrição' },
      ];

      localStorage.setItem('adult_content_filter', 'true');

      const filtered = filterAdultContent(movies);
      expect(filtered).toHaveLength(2);
      expect(
        filtered.find((m) => m.title === 'Dirty Ice Cream')
      ).toBeUndefined();
    });

    test('deve retornar todos os filmes quando filtro está desativado', () => {
      const movies = [
        { title: 'Filme Normal', overview: 'Descrição normal' },
        { title: 'Dirty Ice Cream', overview: 'Filme adulto' },
      ];

      localStorage.setItem('adult_content_filter', 'false');

      const filtered = filterAdultContent(movies);
      expect(filtered).toHaveLength(2);
    });
  });
});
