import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getMovieImages, buildImageUrl } from '@/utils/tmdb';

interface SignupInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InviteItem {
  text: string;
  character: string;
  movie: string;
  imageUrl?: string;
  tmdbId?: number;
}

// Novo formato: itens com frase + personagem + filme (+ imagem opcional)
const INVITE_ITEMS: InviteItem[] = [
  {
    text: '“Ao infinito e além!” — Para favoritar e salvar sua lista, faça seu cadastro no Cine Explorer.',
    character: 'Buzz Lightyear',
    movie: 'Toy Story',
    imageUrl: 'https://image.tmdb.org/t/p/w780/4VGSv7i3GSnQG1CEV4VpWw2X2VN.jpg',
    tmdbId: 862,
  },
  {
    text: '“Que a Força esteja com você.” — Cadastre-se no Cine Explorer para guardar seus favoritos.',
    character: 'Vários (Saga)',
    movie: 'Star Wars',
    imageUrl: 'https://image.tmdb.org/t/p/w780/btTdmkgIvOi0FFip1sPuZI2oQG6.jpg',
    tmdbId: 11,
  },
  {
    text: '“Você não vai passar!” — A menos que se cadastre no Cine Explorer para salvar tudo.',
    character: 'Gandalf',
    movie: 'O Senhor dos Anéis: A Sociedade do Anel',
    imageUrl: 'https://image.tmdb.org/t/p/w780/56zTpe2xvaA4alU51sRWPoKPYZy.jpg',
    tmdbId: 120,
  },
  {
    text: '“Este é o começo de uma bela amizade.” — Comece pelo cadastro no Cine Explorer.',
    character: 'Rick Blaine',
    movie: 'Casablanca',
    imageUrl: 'https://image.tmdb.org/t/p/w780/2U9v2nKxux1DPZWS9Vyhi3F7S3M.jpg',
    tmdbId: 289,
  },
  {
    text: '“Eu voltarei.” — Mas salve sua lista antes: cadastre-se no Cine Explorer.',
    character: 'T-800',
    movie: 'O Exterminador do Futuro 2',
    imageUrl: 'https://image.tmdb.org/t/p/w780/7QGdK1bKmW0Kq7YqKqRR3YKHyCu.jpg',
    tmdbId: 280,
  },
  {
    text: '“Diga olá para o meu amiguinho!” — O cadastro do Cine Explorer, que salva seus favoritos.',
    character: 'Tony Montana',
    movie: 'Scarface',
    imageUrl: 'https://image.tmdb.org/t/p/w780/2ZDn2PW4nGZqUPGJ5pTKtyfO3Qp.jpg',
    tmdbId: 111,
  },
  {
    text: '“Que a sorte esteja sempre a seu favor.” — Cadastre-se no Cine Explorer e acompanhe suas escolhas.',
    character: 'Effie Trinket',
    movie: 'Jogos Vorazes',
    imageUrl: 'https://image.tmdb.org/t/p/w780/mfgnWZ0pniS3pYDs2fzGEylh4GZ.jpg',
    tmdbId: 70160,
  },
  {
    text: '“Por que tão sério?” — Relaxe e cadastre-se no Cine Explorer para salvar sua lista.',
    character: 'Coringa',
    movie: 'Batman: O Cavaleiro das Trevas',
    imageUrl: 'https://image.tmdb.org/t/p/w780/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    tmdbId: 155,
  },
  {
    text: '“Hakuna Matata!” — Cadastre-se no Cine Explorer e deixe que a gente guarda tudo pra você.',
    character: 'Timon & Pumbaa',
    movie: 'O Rei Leão',
    imageUrl: 'https://image.tmdb.org/t/p/w780/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg',
    tmdbId: 8587,
  },
  {
    text: '“Eu sou o rei do mundo!” — Com cadastro no Cine Explorer, você reina nos favoritos.',
    character: 'Jack Dawson',
    movie: 'Titanic',
    imageUrl: 'https://image.tmdb.org/t/p/w780/fRDq1b3M1S7jHimoMuNoMNFcQJU.jpg',
    tmdbId: 597,
  },
  {
    text: '“A vida encontra um jeito.” — E seus favoritos também: cadastre-se no Cine Explorer.',
    character: 'Dr. Ian Malcolm',
    movie: 'Jurassic Park',
    imageUrl: 'https://image.tmdb.org/t/p/w780/lcTQ9Z4PlzyBbs6k8ZZrVSu2Ceu.jpg',
    tmdbId: 329,
  },
  {
    text: '“Com grandes poderes vêm grandes responsabilidades.” — Cadastre-se para gerenciar sua lista no Cine Explorer.',
    character: 'Tio Ben',
    movie: 'Homem-Aranha (2002)',
    imageUrl: 'https://image.tmdb.org/t/p/w780/2x7pQ9IiiaivGi99ZTSdKCbFf8H.jpg',
    tmdbId: 557,
  },
  {
    text: '“Não há lugar como nosso lar.” — A sua lista mora no Cine Explorer: faça seu cadastro.',
    character: 'Dorothy Gale',
    movie: 'O Mágico de Oz',
    imageUrl: 'https://image.tmdb.org/t/p/w780/8Au7qY5T2r8j6YQ8VE3d2rYZRkR.jpg',
    tmdbId: 630,
  },
  {
    text: '“Você está falando comigo?” — Sim! Crie sua conta no Cine Explorer.',
    character: 'Travis Bickle',
    movie: 'Taxi Driver',
    imageUrl: 'https://image.tmdb.org/t/p/w780/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
    tmdbId: 103,
  },
  {
    text: '“Vou fazer uma oferta irrecusável.” — Cadastre-se no Cine Explorer e salve tudo.',
    character: 'Vito Corleone',
    movie: 'O Poderoso Chefão',
    imageUrl: 'https://image.tmdb.org/t/p/w780/ejdD20cdHNFAYAN2DlqPToXKyzx.jpg',
    tmdbId: 238,
  },
  {
    text: '“E.T., telefone, minha casa.” — E você, faça seu cadastro no Cine Explorer.',
    character: 'E.T.',
    movie: 'E.T.: O Extraterrestre',
    imageUrl: 'https://image.tmdb.org/t/p/w780/6t8ES1d12OzWyCGxBeDYLHoaDrT.jpg',
    tmdbId: 601,
  },
  {
    text: '“Vamos precisar de um barco maior.” — E de um cadastro no Cine Explorer pra tantos filmes.',
    character: 'Chefe Brody',
    movie: 'Tubarão',
    imageUrl: 'https://image.tmdb.org/t/p/w780/s2xcqSFfT6F7ZXHxowjxfG0yisT.jpg',
    tmdbId: 578,
  },
  {
    text: '“O nome é Bond. James Bond.” — E o seu? Cadastre-se no Cine Explorer.',
    character: 'James Bond',
    movie: '007: Cassino Royale',
    imageUrl: 'https://image.tmdb.org/t/p/w780/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg',
    tmdbId: 36557,
  },
  {
    text: '“Senhores, não briguem aqui! Isto é a Sala de Guerra!” — E aqui é o cadastro.',
    character: 'Presidente Merkin Muffley',
    movie: 'Dr. Fantástico',
    imageUrl: 'https://image.tmdb.org/t/p/w780/r1DEdZDEu79SUeYEYVplu3n0P0f.jpg',
    tmdbId: 935,
  },
  {
    text: '“Wakanda para sempre!” — E seus favoritos também, com cadastro.',
    character: 'T’Challa',
    movie: 'Pantera Negra',
    imageUrl: 'https://image.tmdb.org/t/p/w780/9ZedQHPQVveaI0L5NkzVHO5T6mU.jpg',
    tmdbId: 284054,
  },
  {
    text: '“Estamos no ultimato agora.” — Último passo: cadastro no Cine Explorer.',
    character: 'Vingadores',
    movie: 'Vingadores: Ultimato',
    imageUrl: 'https://image.tmdb.org/t/p/w780/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    tmdbId: 299534,
  },
  {
    text: '“A verdade é que… eu sou o Homem de Ferro.” — E você é cadastrado no Cine Explorer.',
    character: 'Tony Stark',
    movie: 'Homem de Ferro',
    imageUrl: 'https://image.tmdb.org/t/p/w780/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
    tmdbId: 1726,
  },
];

function getRandomInvite(): InviteItem {
  const i = Math.floor(Math.random() * INVITE_ITEMS.length);
  return INVITE_ITEMS[i];
}

const SignupInviteModal: React.FC<SignupInviteModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [invite, setInvite] = React.useState<InviteItem>(getRandomInvite());
  const [dynamicImageUrl, setDynamicImageUrl] = React.useState<
    string | undefined
  >();

  React.useEffect(() => {
    if (open) {
      const next = getRandomInvite();
      setInvite(next);
      setDynamicImageUrl(undefined);
      if (next.tmdbId) {
        getMovieImages(next.tmdbId)
          .then((images) => {
            const backdrop = images?.backdrops?.[0]?.file_path;
            if (backdrop) {
              setDynamicImageUrl(buildImageUrl(backdrop, 'w780'));
            }
          })
          .catch(() => {
            // silencioso: manter fallback
          });
      }
    }
  }, [open]);

  const handleLater = (e?: React.MouseEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    onOpenChange(false);
  };

  const handleSignup = (e?: React.MouseEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    window.dispatchEvent(
      new CustomEvent('open-auth-modal', { detail: { tab: 'register' } })
    );
    onOpenChange(false);
  };

  // Bloqueia o próximo clique global (captura) para evitar click-through
  const suppressNextGlobalClick = () => {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      document.removeEventListener('click', handler, true);
    };
    document.addEventListener('click', handler, true);
  };

  const handleInteractOutside: React.ComponentProps<
    typeof DialogContent
  >['onInteractOutside'] = (event) => {
    event.preventDefault();
    suppressNextGlobalClick();
    onOpenChange(false);
  };

  const handlePointerDownOutside: React.ComponentProps<
    typeof DialogContent
  >['onPointerDownOutside'] = (event) => {
    event.preventDefault();
    suppressNextGlobalClick();
  };

  const imageUrl =
    dynamicImageUrl ||
    invite.imageUrl ||
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop&auto=format&dpr=2&q=60';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[460px]"
        onInteractOutside={handleInteractOutside}
        onPointerDownOutside={handlePointerDownOutside}
      >
        <DialogHeader>
          <DialogTitle>Quase lá!</DialogTitle>
          <DialogDescription>{invite.text}</DialogDescription>
        </DialogHeader>

        <p className="mt-2 text-sm text-muted-foreground">
          Crie sua conta para favoritar, montar listas e sincronizar entre
          dispositivos. Leva só 30 segundos, é seguro e 100% gratuito.
        </p>

        <div className="mt-3">
          <div className="w-full rounded-md overflow-hidden aspect-video bg-muted">
            <img
              src={imageUrl}
              alt="Cena do filme relacionada à citação"
              className="w-full h-full object-cover"
              loading="lazy"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop&auto=format&dpr=2&q=60';
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            {invite.character} — {invite.movie}
          </p>
        </div>

        <div className="flex gap-3 pt-3">
          <Button variant="outline" className="flex-1" onClick={handleLater}>
            Tentarei mais tarde
          </Button>
          <Button className="flex-1" onClick={handleSignup}>
            Cadastro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupInviteModal;
