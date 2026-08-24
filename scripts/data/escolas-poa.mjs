/**
 * Rede Municipal de Ensino de Porto Alegre — escolas próprias da SMED.
 *
 * 102 unidades: 42 EMEIs, 57 EMEFs/EMEEFs/EMEM, 2 EMEBs e 1 CMET.
 * Fonte: Secretaria Municipal de Educação de Porto Alegre (prefeitura.poa.br/smed),
 * consultada em agosto de 2026.
 *
 * As linhas seguem a ordem do documento da SMED — [nome, logradouro, bairro] —
 * para facilitar a conferência contra a fonte. O bairro fica de fora quando a
 * fonte não o informa.
 */

// A sigla é o único indicador de etapa de ensino na fonte.
const SEGMENTOS_POR_SIGLA = {
  EMEI:  ['educacao_infantil'],                            // Educação Infantil
  EMEF:  ['anos_iniciais', 'anos_finais'],                 // Ensino Fundamental
  EMEEF: ['educacao_especial'],                            // Educação Especial
  EMEM:  ['ensino_medio'],                                 // Ensino Médio
  EMEB:  ['anos_iniciais', 'anos_finais', 'ensino_medio'], // Educação Básica
  CMET:  ['eja'],                                          // Jovens e adultos
};

// Escola bilíngue de surdos: atende o fundamental regular e a educação especial.
const SEGMENTOS_ESPECIFICOS = {
  'EMEF de Surdos Bilíngue Salomão Watnick': ['anos_iniciais', 'anos_finais', 'educacao_especial'],
};

const BLOCOS = [
  // ── Escolas Municipais de Educação Infantil (EMEIs) ──────────────────────────
  {
    regiao: 'Oeste',
    escolas: [
      ['EMEI JP Cantinho Amigo',        'Praça Garibaldi, s/nº',           'Cidade Baixa'],
      ['EMEI JP Cirandinha',            'Rua 24 de Outubro, 211',          'Independência'],
      ['EMEI JP Girafinha',             'Praça Jaime Telles, s/nº',        'Santana'],
      ['EMEI JP Meu Amiguinho',         'Rua São Carlos, 636',             'Floresta'],
      ['EMEI JP Passarinho Dourado',    'Av. Guido Mondin, esq. Ceará',    'São Geraldo'],
      ['EMEI JP Patinho Feio',          'Av. Brasil, 593',                 'São Geraldo'],
      ['EMEI JP Pica-Pau Amarelo',      'Rua Cel. Fernando Machado, s/nº', 'Centro Histórico'],
      ['EMEI Mamãe Coruja',             'Av. Bento Gonçalves, 642',        'Azenha'],
      ['EMEI Municipários Tio Barnabé', 'Rua Otto Ernest Meyer, 55',       'Cidade Baixa'],
    ],
  },
  {
    regiao: 'Norte',
    escolas: [
      ['EMEI Da Vila Santa Rosa',       'Rua Donário Braga, esq. Rua A',        'Rubem Berta'],
      ['EMEI Érico Veríssimo',          'Rua Modesto Franco, 100',              'Passo das Pedras'],
      ['EMEI Humaitá',                  'Rua Caio Brandão de Melo, s/nº',       'Humaitá'],
      ['EMEI Miguel Granato Velasquez', 'Rua Armando Costa, 125',               'Sarandi'],
      ['EMEI Nova Gleba',               'Av. Guido Alberto Werlang, 747',       'Rubem Berta'],
      ['EMEI Parque Dos Maias II',      'Rua Amauri Cafrune, 149',              'Parque dos Maias II'],
      ['EMEI Protásio Alves',           'Rua Aracy Fróes, 210',                 'Jardim Itú Sabará'],
      ['EMEI Santo Expedito',           'Rua Gabriel Bezerra Cavalcanti, s/nº', 'Rubem Berta'],
      ['EMEI Vila Da Páscoa',           'Rua Loris José Isatto, 95',            'Rubem Berta'],
      ['EMEI Vila Elizabeth',           'Rua Paulo Gomes de Oliveira, 120',     'Sarandi'],
      ['EMEI Vila Floresta',            'Rua Monte Alegre, 55',                 'Jardim Floresta'],
      ['EMEI Vila Max Geiss',           'Rua Vicente Celestino, 120',           'Rubem Berta'],
      ['EMEI Vila Valneri Antunes',     'Estrada Martim Félix Berta, 2353',     'Mário Quintana'],
    ],
  },
  {
    regiao: 'Leste',
    escolas: [
      ['EMEI Dr. Walter Silber',       'Rua Frei Clemente, 150',                'Partenon'],
      ['EMEI Jardim Bento Gonçalves',  'Rua Sarg. Exped. Geraldo Santana, 40',  'Partenon'],
      ['EMEI Maria Marques Fernandes', 'Av. Santos Dias da Silva, 550',         'Lomba do Pinheiro'],
      ['EMEI Padre Ângelo Costa',      'Rua 1º de Maio, 300',                   'Partenon'],
      ['EMEI Vale Verde',              'Rua Beco do Franklin, 270',             'Alto Petrópolis'],
      ['EMEI Vila Mapa II',            'Rua Pedro Golombiewski, 08',            'Lomba do Pinheiro'],
      ['EMEI Vila Nova São Carlos',    'Estrada João de Oliveira Remião, s/nº', 'Lomba do Pinheiro'],
    ],
  },
  {
    regiao: 'Sul',
    escolas: [
      ['EMEI Bairro Cavalhada',               'Rua Canela, 180',                           'Cavalhada'],
      ['EMEI Dom Luiz De Nadal',              'Rua Dr. Carlos Niderauer Hoffmeister, 255', 'Restinga Nova'],
      ['EMEI Florência Vurlod Socias',        'Rua Tenente Arzoli Fagundes, acesso 1',     'Restinga Nova'],
      ['EMEI Ilha Da Pintada',                'Rua dos Garruchos, s/nº',                   'Ilha da Pintada'],
      ['EMEI Jardim Camaquã',                 'Rua Jardim das Bromélias, 130',             'Camaquã'],
      ['EMEI Jardim Salomoni',                'Rua Joaquim de Carvalho, 325',              'Vila Nova'],
      ['EMEI Maria Helena Cavalheiro Gusmão', 'Rua A, 250',                                'Vila Nova'],
      ['EMEI Osmar Dos Santos Freitas',       'Rua Dona Otília, 497',                      'Santa Tereza'],
      ['EMEI Paulo Freire',                   'Rua Meridional, esq. Tobado',               'Restinga Velha'],
      ['EMEI Ponta Grossa',                   'Estrada Retiro da Ponta Grossa, 3581'],
      ['EMEI Vila Nova',                      'Rua Fernando Pessoa, 350',                  'Jardim Vila Nova'],
      ['EMEI Vila Nova Restinga',             'Rua Álvaro Difini, 480',                    'Restinga'],
      ['EMEI Vila Tronco',                    'Rua Gabriel Fialho Camargo, 53',            'Santa Tereza'],
    ],
  },

  // ── Ensino Fundamental e Médio (EMEFs, EMEEFs e EMEM) ────────────────────────
  {
    regiao: 'Oeste',
    escolas: [
      ['EMEM Emílio Meyer', 'Av. Niterói, 472',         'Medianeira'],
      ['EMEF Porto Alegre', 'Rua Washington Luiz, 203', 'Centro Histórico'],
    ],
  },
  {
    regiao: 'Norte',
    escolas: [
      ['EMEF Chico Mendes',                                'Rua Gentil Amâncio Clemente, s/nº',         'Mário Quintana'],
      ['EMEF Décio Martins Costa',                         'Rua Cristóvão Jaques, 488',                 'Sarandi'],
      ['EMEF Deputado Victor Issler',                      'Rua Dezenove de Fevereiro, 330',            'Mário Quintana'],
      ['EMEF Governador Ildo Meneghetti',                  'Rua Jayme Cyrino Machado de Oliveira, 250', 'Rubem Berta'],
      ['EMEF Grande Oriente do RGS',                       'Rua Wolfram Metzler, 600',                  'Rubem Berta'],
      ['EMEF Jean Piaget',                                 'Av. Major Manoel José Monteiro, 1',         'Rubem Berta'],
      ['EMEF João Antônio Satte',                          'Av. Gamal Abdel Nasser, 500',               'Rubem Berta'],
      ["EMEF João Carlos D'Ávila Paixão Côrtes (Laçador)", 'Rua Bispo Sardinha, 159',                   'Vila Ipiranga'],
      ['EMEF Lauro Rodrigues',                             'Rua Dr. Marino Abrahão, 240',               'Jardim Ingá'],
      ['EMEF Migrantes',                                   'Av. Severo Dullius, 165',                   'Anchieta'],
      ['EMEF Pepita de Leão',                              'Rua Estádio, 29',                           'Passo das Pedras'],
      ['EMEF Porto Novo',                                  'Rua Amélia Santini Fortunati, 101',         'Rubem Berta'],
      ['EMEF Pres. João Belchior Marques Goulart',         'Rua João Luiz Pufal, 100',                  'Sarandi'],
      ['EMEF Presidente Vargas',                           'Rua Aurora do Amaral Lisboa, 60',           'Passo das Pedras'],
      ['EMEF Prof. Ana Íris do Amaral',                    'Av. Mário Meneghetti, 1000',                'Protásio Alves'],
      ['EMEF Timbaúva',                                    'Rua Seis - Loteamento Timbaúva',            'Mário Quintana'],
      ['EMEF Vereador Antônio Giúdice',                    'Rua Dr. Caio Brandão de Mello, 1',          'Humaitá'],
      ['EMEF Wenceslau Fontoura',                          'Rua Irmã Inês Faveiro, 1',                  'Mário Quintana'],
    ],
  },
  {
    regiao: 'Leste',
    escolas: [
      ['EMEF Afonso Guerreiro Lima',               'Rua Guaíba, 203',                  'Lomba do Pinheiro'],
      ['EMEF América',                             'Rua Padre Ângelo Costa, 175',      'Partenon'],
      ['EMEF de Surdos Bilíngue Salomão Watnick',  'Rua Capitão Pedro Werlang, 1011',  'São José'],
      ['EMEF Dep. Marcírio Goulart Loureiro',      'Rua Saibreira, s/nº',              'Aparício Borges'],
      ['EMEF Evaristo Gonçalves Netto',            'Rua 1, 565',                       'Jardim Carvalho'],
      ['EMEF Heitor Villa Lobos',                  'Av. Santos Dias da Silva, s/nº',   'Lomba do Pinheiro'],
      ['EMEF José Mariano Beck',                   'Av. Joaquim Porto Villanova, 135', 'Bom Jesus'],
      ['EMEF Morro da Cruz',                       'Rua Santa Tereza, s/nº',           'Vila São José'],
      ['EMEF Nossa Senhora de Fátima',             'Rua A, 15',                        'Vila N. Sra. de Fátima'],
      ['EMEF Prof. Judith Macedo de Araújo',       'Rua Saul Constantino, 100',        'Morro da Cruz'],
      ['EMEEF Prof. Luiz Francisco Lucena Borges', 'Rua Cláudio Manoel da Costa, 270', 'Jardim Itú Sabará'],
      ['EMEEF Prof. Lygia Morrone Averbuck',       'Rua São José Maria Escrivã, s/nº', 'Jardim do Salso'],
      ['EMEF Saint Hilaire',                       'Rua Gervázio Braga Pinheiro, 427', 'Lomba do Pinheiro'],
      ['EMEF São Pedro',                           'Av. Deputado Adão Pretto, 1190',   'Lomba do Pinheiro'],
    ],
  },
  {
    regiao: 'Sul',
    escolas: [
      ['EMEF Aramy Silva',                             'Rua Chico Pedro, 390',                     'Camaquã'],
      ['EMEF Campos do Cristal',                       'Beco do Império, 75',                      'Vila Nova'],
      ['EMEF Chapéu do Sol',                           'Av. Juca Batista, s/nº',                   'Chapéu do Sol'],
      ['EMEF Dolores Alcaraz Caldas',                  'Rua Dr. Carlos Niederauer Hofmeister, 85', 'Restinga Nova'],
      ['EMEF Espírito Santo',                          'Rua Ascenção, 245',                        'Glória'],
      ['EMEF Gabriel Obino',                           'Rua Eng. Ludolfo Boehl, 1402',             'Teresópolis'],
      ['EMEF José Loureiro da Silva',                  'Av. Capivari, 1999',                       'Cristal'],
      ['EMEF Leocádia Felizardo Prestes',              'Rua Romeu de Vasconcellos Rosa, 10',       'Vila Nova'],
      ['EMEF Lidovino Fanton',                         'Rua Manoel Faria da Rosa Primo, 940',      'Restinga Velha'],
      ['EMEF Mário Quintana',                          'Acesso C, s/nº - Vila Castelo',            'Restinga'],
      ['EMEF Moradas da Hípica',                       'Rua Geraldo Tollens Linck, 1',             'Hípica'],
      ['EMEF Neusa Goulart Brizola',                   'Rua Monsenhor Ruben Neis, 480',            'Cavalhada'],
      ['EMEF Nossa Senhora do Carmo',                  'Rua Bispo Marino Prudêncio Moreira, 95',   'Restinga'],
      ['EMEF Prof. Anísio Teixeira',                   'Rua Francisco Mattos Terres, 40',          'Hípica'],
      ['EMEEF Prof. Elyseu Paglioli',                  'Rua Butuí, 221',                           'Cristal'],
      ['EMEF Prof. Gilberto Jorge Gonçalves da Silva', 'Travessa Morro Alto, 433',                 'Ipanema'],
      ['EMEF Prof. Larry José Ribeiro Alves',          'Av. Economista Nilo Wulff, s/nº',          'Restinga Nova'],
      ['EMEF Rincão',                                  'Rua Luiz Otávio, 347',                     'Belém Velho'],
      ['EMEF Senador Alberto Pasqualini',              'Rua Tenente Arizoly Fagundes, 250',        'Restinga Nova'],
      ['EMEEF Tristão Sucupira Vianna',                'Av. Nilo Wulff, 955',                      'Restinga Nova'],
      ['EMEF Vereador Carlos Pessoa de Brum',          'Rua Abolição, 1',                          'Restinga Velha'],
      ['EMEF Vereador Martim Aranha',                  'Rua Cônego Paulo Isidoro de Nadal, s/nº',  'Santa Tereza'],
      ['EMEF Vila Monte Cristo',                       'Rua Carlos Superti, 84',                   'Vila Nova'],
    ],
  },

  // ── EMEBs e CMET ─────────────────────────────────────────────────────────────
  // A fonte não agrupa estas três unidades por região; a região vem do bairro,
  // seguindo o mesmo mapeamento das listas acima (Cidade Baixa, Centro Histórico
  // e Santana estão na região Oeste).
  {
    regiao: 'Oeste',
    escolas: [
      ['EMEB Prof.ª Leopolda Barnewitz',            'Rua João Alfredo, 443',       'Cidade Baixa'],
      ['EMEB Dr. Liberato Salzano Vieira da Cunha', 'Rua Borges de Medeiros, 1501'],
      ['CMET Paulo Freire',                         'Rua Santa Terezinha, 572',    'Santana'],
    ],
  },
];

// Id determinístico a partir do nome: reexecutar o seed atualiza a mesma escola
// em vez de duplicá-la.
function slugify(nome) {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const ESCOLAS_POA = BLOCOS.flatMap(({ regiao, escolas }) =>
  escolas.map(([name, address, district]) => ({
    id: slugify(name),
    name,
    region: regiao,
    ...(district ? { district } : {}),
    address,
    city: 'Porto Alegre',
    state: 'RS',
    segments: SEGMENTOS_ESPECIFICOS[name] ?? SEGMENTOS_POR_SIGLA[name.split(' ')[0]],
  })),
);

// A própria fonte declara 102 unidades. Ajuste ao atualizar a lista.
const TOTAL_ESPERADO = 102;

// Erro de transcrição (linha repetida, sigla nova, escola perdida) vira documento
// errado no Firestore — mais barato falhar aqui, na carga do módulo.
const idsVistos = new Set();
for (const escola of ESCOLAS_POA) {
  if (!escola.segments) throw new Error(`Sigla sem segmentos mapeados: ${escola.name}`);
  if (idsVistos.has(escola.id)) throw new Error(`Escola duplicada na lista: ${escola.name}`);
  idsVistos.add(escola.id);
}
if (ESCOLAS_POA.length !== TOTAL_ESPERADO) {
  throw new Error(`Esperadas ${TOTAL_ESPERADO} escolas, a lista tem ${ESCOLAS_POA.length}`);
}
