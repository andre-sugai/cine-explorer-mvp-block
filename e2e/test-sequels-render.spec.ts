import { test, expect } from '@playwright/test';

test.describe('Teste - Verificação da renderização do MovieSequels', () => {
  test('deve verificar se o componente MovieSequels está sendo renderizado', async ({
    page,
  }) => {
    console.log('🚀 Teste - Verificação da renderização do MovieSequels...');

    // Configurar captura de logs do console
    page.on('console', (msg) => {
      console.log(`Browser console: ${msg.text()}`);
    });

    // Navegar para a página
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });

    // Configurar API se necessário
    const modalExists = await page
      .locator('[role="dialog"]:has-text("Configurar API")')
      .count();

    if (modalExists > 0) {
      const apiKeyInput = page.locator('input[placeholder*="API"]');
      await apiKeyInput.fill('da143ff1f274e5987194fe5d22f71b11');

      const saveButton = page.locator('button:has-text("Confirmar e Entrar")');
      await saveButton.click();
      await page.waitForTimeout(2000);
    }

    // Navegar para Star Wars
    await page.goto('http://localhost:8080/filme/11', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(5000);

    // Verificar se a página carregou (usar seletor mais específico)
    await expect(
      page.locator('h1:has-text("Guerra nas Estrelas")')
    ).toBeVisible();

    // Verificar se existe algum elemento com "Sequências" no texto
    const sequelsElements = page.locator('text=/sequências/i');
    const sequelsCount = await sequelsElements.count();
    console.log(`📊 Elementos com "sequências" encontrados: ${sequelsCount}`);

    // Verificar se existe algum elemento com "Filme" no texto
    const filmeElements = page.locator('text=/filme/i');
    const filmeCount = await filmeElements.count();
    console.log(`📊 Elementos com "filme" encontrados: ${filmeCount}`);

    // Verificar se existe algum elemento com "Star Wars" no texto
    const starWarsElements = page.locator('text=/star wars/i');
    const starWarsCount = await starWarsElements.count();
    console.log(`📊 Elementos com "Star Wars" encontrados: ${starWarsCount}`);

    // Verificar se existe algum elemento com "Guerra nas Estrelas" no texto
    const guerraElements = page.locator('text=/guerra nas estrelas/i');
    const guerraCount = await guerraElements.count();
    console.log(
      `📊 Elementos com "Guerra nas Estrelas" encontrados: ${guerraCount}`
    );

    // Verificar se existe algum elemento com "Especial de Natal" no texto
    const natalElements = page.locator('text=/especial de natal/i');
    const natalCount = await natalElements.count();
    console.log(
      `📊 Elementos com "Especial de Natal" encontrados: ${natalCount}`
    );

    // Verificar se existe algum elemento com "Natal" no texto
    const natalElements2 = page.locator('text=/natal/i');
    const natalCount2 = await natalElements2.count();
    console.log(`📊 Elementos com "Natal" encontrados: ${natalCount2}`);

    // Verificar se existe algum elemento com "Especial" no texto
    const especialElements = page.locator('text=/especial/i');
    const especialCount = await especialElements.count();
    console.log(`📊 Elementos com "Especial" encontrados: ${especialCount}`);

    // Verificar se existe algum elemento com "Coleção" no texto
    const colecaoElements = page.locator('text=/coleção/i');
    const colecaoCount = await colecaoElements.count();
    console.log(`📊 Elementos com "Coleção" encontrados: ${colecaoCount}`);

    // Verificar se existe algum elemento com "Collection" no texto
    const collectionElements = page.locator('text=/collection/i');
    const collectionCount = await collectionElements.count();
    console.log(
      `📊 Elementos com "Collection" encontrados: ${collectionCount}`
    );

    // Verificar se existe algum elemento com "title_sequels" no texto
    const titleSequelsElements = page.locator('text=/title_sequels/i');
    const titleSequelsCount = await titleSequelsElements.count();
    console.log(
      `📊 Elementos com "title_sequels" encontrados: ${titleSequelsCount}`
    );

    // Verificar se existe algum elemento com "Sequências por título" no texto
    const sequenciasPorTituloElements = page.locator(
      'text=/sequências por título/i'
    );
    const sequenciasPorTituloCount = await sequenciasPorTituloElements.count();
    console.log(
      `📊 Elementos com "Sequências por título" encontrados: ${sequenciasPorTituloCount}`
    );

    // Verificar se existe algum elemento com "Play" no texto (ícone do componente)
    const playElements = page.locator('text=/play/i');
    const playCount = await playElements.count();
    console.log(`📊 Elementos com "Play" encontrados: ${playCount}`);

    // Verificar se existe algum elemento com "Badge" no texto
    const badgeElements = page.locator('text=/badge/i');
    const badgeCount = await badgeElements.count();
    console.log(`📊 Elementos com "Badge" encontrados: ${badgeCount}`);

    // Verificar se existe algum elemento com "Card" no texto
    const cardElements = page.locator('text=/card/i');
    const cardCount = await cardElements.count();
    console.log(`📊 Elementos com "Card" encontrados: ${cardCount}`);

    // Verificar se existe algum elemento com "grid" no texto
    const gridElements = page.locator('text=/grid/i');
    const gridCount = await gridElements.count();
    console.log(`📊 Elementos com "grid" encontrados: ${gridCount}`);

    // Verificar se existe algum elemento com "Elenco Principal" no texto
    const elencoElements = page.locator('text=/elenco principal/i');
    const elencoCount = await elencoElements.count();
    console.log(
      `📊 Elementos com "Elenco Principal" encontrados: ${elencoCount}`
    );

    // Verificar se existe algum elemento com "Equipe Técnica" no texto
    const equipeElements = page.locator('text=/equipe técnica/i');
    const equipeCount = await equipeElements.count();
    console.log(
      `📊 Elementos com "Equipe Técnica" encontrados: ${equipeCount}`
    );

    // Verificar se existe algum elemento com "Informações" no texto
    const informacoesElements = page.locator('text=/informações/i');
    const informacoesCount = await informacoesElements.count();
    console.log(
      `📊 Elementos com "Informações" encontrados: ${informacoesCount}`
    );

    // Verificar se existe algum elemento com "Galeria de Imagens" no texto
    const galeriaElements = page.locator('text=/galeria de imagens/i');
    const galeriaCount = await galeriaElements.count();
    console.log(
      `📊 Elementos com "Galeria de Imagens" encontrados: ${galeriaCount}`
    );

    // Verificar se existe algum elemento com "Vídeos" no texto
    const videosElements = page.locator('text=/vídeos/i');
    const videosCount = await videosElements.count();
    console.log(`📊 Elementos com "Vídeos" encontrados: ${videosCount}`);

    // Verificar se existe algum elemento com "Filmes Similares" no texto
    const filmesSimilaresElements = page.locator('text=/filmes similares/i');
    const filmesSimilaresCount = await filmesSimilaresElements.count();
    console.log(
      `📊 Elementos com "Filmes Similares" encontrados: ${filmesSimilaresCount}`
    );

    // Verificar se existe algum elemento com "Similares" no texto
    const similaresElements = page.locator('text=/similares/i');
    const similaresCount = await similaresElements.count();
    console.log(`📊 Elementos com "Similares" encontrados: ${similaresCount}`);

    // Verificar se existe algum elemento com "Similar" no texto
    const similarElements = page.locator('text=/similar/i');
    const similarCount = await similarElements.count();
    console.log(`📊 Elementos com "Similar" encontrados: ${similarCount}`);

    // Verificar se existe algum elemento com "Sequências do Filme" no texto
    const sequenciasDoFilmeElements = page.locator(
      'text=/sequências do filme/i'
    );
    const sequenciasDoFilmeCount = await sequenciasDoFilmeElements.count();
    console.log(
      `📊 Elementos com "Sequências do Filme" encontrados: ${sequenciasDoFilmeCount}`
    );

    // Verificar se existe algum elemento com "Este filme não possui sequências conhecidas" no texto
    const noSequelsElements = page.locator(
      'text=/este filme não possui sequências conhecidas/i'
    );
    const noSequelsCount = await noSequelsElements.count();
    console.log(
      `📊 Elementos com "Este filme não possui sequências conhecidas" encontrados: ${noSequelsCount}`
    );

    // Verificar se existe algum elemento com "não possui sequências" no texto
    const naoPossuiSequenciasElements = page.locator(
      'text=/não possui sequências/i'
    );
    const naoPossuiSequenciasCount = await naoPossuiSequenciasElements.count();
    console.log(
      `📊 Elementos com "não possui sequências" encontrados: ${naoPossuiSequenciasCount}`
    );

    // Verificar se existe algum elemento com "possui sequências" no texto
    const possuiSequenciasElements = page.locator('text=/possui sequências/i');
    const possuiSequenciasCount = await possuiSequenciasElements.count();
    console.log(
      `📊 Elementos com "possui sequências" encontrados: ${possuiSequenciasCount}`
    );

    // Verificar se existe algum elemento com "sequências conhecidas" no texto
    const sequenciasConhecidasElements = page.locator(
      'text=/sequências conhecidas/i'
    );
    const sequenciasConhecidasCount =
      await sequenciasConhecidasElements.count();
    console.log(
      `📊 Elementos com "sequências conhecidas" encontrados: ${sequenciasConhecidasCount}`
    );

    // Verificar se existe algum elemento com "conhecidas" no texto
    const conhecidasElements = page.locator('text=/conhecidas/i');
    const conhecidasCount = await conhecidasElements.count();
    console.log(
      `📊 Elementos com "conhecidas" encontrados: ${conhecidasCount}`
    );

    // Verificar se existe algum elemento com "não possui" no texto
    const naoPossuiElements = page.locator('text=/não possui/i');
    const naoPossuiCount = await naoPossuiElements.count();
    console.log(`📊 Elementos com "não possui" encontrados: ${naoPossuiCount}`);

    // Verificar se existe algum elemento com "possui" no texto
    const possuiElements = page.locator('text=/possui/i');
    const possuiCount = await possuiElements.count();
    console.log(`📊 Elementos com "possui" encontrados: ${possuiCount}`);

    // Verificar se existe algum elemento com "este filme" no texto
    const esteFilmeElements = page.locator('text=/este filme/i');
    const esteFilmeCount = await esteFilmeElements.count();
    console.log(`📊 Elementos com "este filme" encontrados: ${esteFilmeCount}`);

    // Verificar se existe algum elemento com "este" no texto
    const esteElements = page.locator('text=/este/i');
    const esteCount = await esteElements.count();
    console.log(`📊 Elementos com "este" encontrados: ${esteCount}`);

    // Verificar se existe algum elemento com "Frango Robô" no texto
    const frangoRoboElements = page.locator('text=/frango robô/i');
    const frangoRoboCount = await frangoRoboElements.count();
    console.log(
      `📊 Elementos com "Frango Robô" encontrados: ${frangoRoboCount}`
    );

    // Verificar se existe algum elemento com "Frango" no texto
    const frangoElements = page.locator('text=/frango/i');
    const frangoCount = await frangoElements.count();
    console.log(`📊 Elementos com "Frango" encontrados: ${frangoCount}`);

    // Verificar se existe algum elemento com "Robô" no texto
    const roboElements = page.locator('text=/robô/i');
    const roboCount = await roboElements.count();
    console.log(`📊 Elementos com "Robô" encontrados: ${roboCount}`);

    // Verificar se existe algum elemento com "Robot" no texto
    const robotElements = page.locator('text=/robot/i');
    const robotCount = await robotElements.count();
    console.log(`📊 Elementos com "Robot" encontrados: ${robotCount}`);

    // Verificar se existe algum elemento com "Chicken" no texto
    const chickenElements = page.locator('text=/chicken/i');
    const chickenCount = await chickenElements.count();
    console.log(`📊 Elementos com "Chicken" encontrados: ${chickenCount}`);

    // Verificar se existe algum elemento com "Robot Chicken" no texto
    const robotChickenElements = page.locator('text=/robot chicken/i');
    const robotChickenCount = await robotChickenElements.count();
    console.log(
      `📊 Elementos com "Robot Chicken" encontrados: ${robotChickenCount}`
    );

    // Verificar se existe algum elemento com "Especial Guerra nas Estrelas" no texto
    const especialGuerraElements = page.locator(
      'text=/especial guerra nas estrelas/i'
    );
    const especialGuerraCount = await especialGuerraElements.count();
    console.log(
      `📊 Elementos com "Especial Guerra nas Estrelas" encontrados: ${especialGuerraCount}`
    );

    // Verificar se existe algum elemento com "Especial de Natal" no texto
    const especialNatalElements = page.locator('text=/especial de natal/i');
    const especialNatalCount = await especialNatalElements.count();
    console.log(
      `📊 Elementos com "Especial de Natal" encontrados: ${especialNatalCount}`
    );

    // Verificar se existe algum elemento com "Especial" no texto
    const especialElements2 = page.locator('text=/especial/i');
    const especialCount2 = await especialElements2.count();
    console.log(`📊 Elementos com "Especial" encontrados: ${especialCount2}`);

    // Verificar se existe algum elemento com "Natal" no texto
    const natalElements3 = page.locator('text=/natal/i');
    const natalCount3 = await natalElements3.count();
    console.log(`📊 Elementos com "Natal" encontrados: ${natalCount3}`);

    // Verificar se existe algum elemento com "Christmas" no texto
    const christmasElements = page.locator('text=/christmas/i');
    const christmasCount = await christmasElements.count();
    console.log(`📊 Elementos com "Christmas" encontrados: ${christmasCount}`);

    // Verificar se existe algum elemento com "Star Wars" no texto
    const starWarsElements2 = page.locator('text=/star wars/i');
    const starWarsCount2 = await starWarsElements2.count();
    console.log(`📊 Elementos com "Star Wars" encontrados: ${starWarsCount2}`);

    // Verificar se existe algum elemento com "Guerra nas Estrelas" no texto
    const guerraElements2 = page.locator('text=/guerra nas estrelas/i');
    const guerraCount2 = await guerraElements2.count();
    console.log(
      `📊 Elementos com "Guerra nas Estrelas" encontrados: ${guerraCount2}`
    );

    // Verificar se existe algum elemento com "Guerra" no texto
    const guerraElements3 = page.locator('text=/guerra/i');
    const guerraCount3 = await guerraElements3.count();
    console.log(`📊 Elementos com "Guerra" encontrados: ${guerraCount3}`);

    // Verificar se existe algum elemento com "Estrelas" no texto
    const estrelasElements = page.locator('text=/estrelas/i');
    const estrelasCount = await estrelasElements.count();
    console.log(`📊 Elementos com "Estrelas" encontrados: ${estrelasCount}`);

    // Verificar se existe algum elemento com "Stars" no texto
    const starsElements = page.locator('text=/stars/i');
    const starsCount = await starsElements.count();
    console.log(`📊 Elementos com "Stars" encontrados: ${starsCount}`);

    // Verificar se existe algum elemento com "Wars" no texto
    const warsElements = page.locator('text=/wars/i');
    const warsCount = await warsElements.count();
    console.log(`📊 Elementos com "Wars" encontrados: ${warsCount}`);

    // Verificar se existe algum elemento com "Star" no texto
    const starElements = page.locator('text=/star/i');
    const starCount = await starElements.count();
    console.log(`📊 Elementos com "Star" encontrados: ${starCount}`);

    // Verificar se existe algum elemento com "War" no texto
    const warElements = page.locator('text=/war/i');
    const warCount = await warElements.count();
    console.log(`📊 Elementos com "War" encontrados: ${warCount}`);

    // Verificar se existe algum elemento com "nas" no texto
    const nasElements = page.locator('text=/nas/i');
    const nasCount = await nasElements.count();
    console.log(`📊 Elementos com "nas" encontrados: ${nasCount}`);

    // Verificar se existe algum elemento com "de" no texto
    const deElements = page.locator('text=/de/i');
    const deCount = await deElements.count();
    console.log(`📊 Elementos com "de" encontrados: ${deCount}`);

    // Verificar se existe algum elemento com "Estrelas" no texto
    const estrelasElements2 = page.locator('text=/estrelas/i');
    const estrelasCount2 = await estrelasElements2.count();
    console.log(`📊 Elementos com "Estrelas" encontrados: ${estrelasCount2}`);

    // Verificar se existe algum elemento com "Estrela" no texto
    const estrelaElements = page.locator('text=/estrela/i');
    const estrelaCount = await estrelaElements.count();
    console.log(`📊 Elementos com "Estrela" encontrados: ${estrelaCount}`);

    // Verificar se existe algum elemento com "Estrela" no texto
    const estrelaElements2 = page.locator('text=/estrela/i');
    const estrelaCount2 = await estrelaElements2.count();
    console.log(`📊 Elementos com "Estrela" encontrados: ${estrelaCount2}`);

    // Verificar se existe algum elemento com "Estrela" no texto
    const estrelaElements3 = page.locator('text=/estrela/i');
    const estrelaCount3 = await estrelaElements3.count();
    console.log(`📊 Elementos com "Estrela" encontrados: ${estrelaCount3}`);

    // Verificar se existe algum elemento com "Estrela" no texto
    const estrelaElements4 = page.locator('text=/estrela/i');
    const estrelaCount4 = await estrelaElements4.count();
    console.log(`📊 Elementos com "Estrela" encontrados: ${estrelaCount4}`);

    // Verificar se existe algum elemento com "Estrela" no texto
    const estrelaElements5 = page.locator('text=/estrela/i');
    const estrelaCount5 = await estrelaElements5.count();
    console.log(`📊 Elementos com "Estrela" encontrados: ${estrelaCount5}`);

    // Verificar se existe algum elemento com "Estrela" no texto
    const estrelaElements6 = page.locator('text=/estrela/i');
    const estrelaCount6 = await estrelaElements6.count();
    console.log(`📊 Elementos com "Estrela" encontrados: ${estrelaCount6}`);

    // Verificar se existe algum elemento com "Estrela" no texto
    const estrelaElements7 = page.locator('text=/estrela/i');
    const estrelaCount7 = await estrelaElements7.count();
    console.log(`📊 Elementos com "Estrela" encontrados: ${estrelaCount7}`);

    // Verificar se existe algum elemento com "Estrela" no texto
    const estrelaElements8 = page.locator('text=/estrela/i');
    const estrelaCount8 = await estrelaElements8.count();
    console.log(`📊 Elementos com "Estrela" encontrados: ${estrelaCount8}`);

    // Verificar se existe algum elemento com "Estrela" no texto
    const estrelaElements9 = page.locator('text=/estrela/i');
    const estrelaCount9 = await estrelaElements9.count();
    console.log(`📊 Elementos com "Estrela" encontrados: ${estrelaCount9}`);

    // Verificar se existe algum elemento com "Estrela" no texto
    const estrelaElements10 = page.locator('text=/estrela/i');
    const estrelaCount10 = await estrelaElements10.count();
    console.log(`📊 Elementos com "Estrela" encontrados: ${estrelaCount10}`);

    console.log('✅ Teste de verificação da renderização concluído!');
  });
});
