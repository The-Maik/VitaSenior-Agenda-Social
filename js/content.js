/** Conteúdo editorial educativo. Não usar como base para prescrição ou triagem. */
export const CATEGORIES = Object.freeze({
  movimento: "Movimento",
  equilibrio: "Equilíbrio",
  respiracao: "Respiração e cuidado",
});

export const SOURCES = Object.freeze({
  atividade: {
    label: "Ministério da Saúde — Atividade física na saúde da pessoa idosa",
    url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa/atividade-fisica",
    language: "Português",
  },
  nhsActivity: {
    label: "NHS — Physical activity guidelines for older adults",
    url: "https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-older-adults/",
    language: "Inglês",
  },
  quedas: {
    label: "Ministério da Saúde — Saúde da pessoa idosa, prevenção de quedas",
    url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa",
    language: "Português",
  },
  breathing: {
    label: "NHS — Breathing exercises for stress",
    url: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/",
    language: "Inglês",
  },
});

export const ARTICLES = Object.freeze([
  {
    id: "movimento-cotidiano",
    category: "movimento",
    icon: "sun",
    title: "Movimento no cotidiano",
    summary:
      "Entenda como o movimento pode fazer parte da rotina, respeitando sua realidade.",
    intro:
      "O movimento pode estar presente no lazer, nas tarefas de casa e na convivência. As possibilidades variam conforme a história, as preferências e as condições de cada pessoa.",
    heading: "Para levar com você",
    points: [
      "Atividade física não se resume a uma aula ou academia.",
      "Uma rotina pode incluir diferentes formas de movimento e momentos de descanso.",
      "A orientação de uma equipe de saúde ajuda a considerar suas necessidades individuais.",
    ],
    reflection:
      "Que atividades do seu dia você gosta de fazer? Leve essa ideia para a próxima conversa com sua equipe de saúde.",
    source: "atividade",
  },
  {
    id: "flexibilidade",
    category: "movimento",
    icon: "leaf",
    title: "Flexibilidade, sem pressa",
    summary:
      "Conheça o papel da flexibilidade e por que cada pessoa precisa de uma orientação.",
    intro:
      "Flexibilidade é um dos componentes de uma rotina ativa, junto com força e equilíbrio. A orientação para uma pessoa não serve automaticamente para outra.",
    heading: "Antes de escolher uma prática",
    points: [
      "Converse com um profissional se estiver há muito tempo sem se exercitar ou tiver condições de saúde que gerem dúvidas.",
      "A atividade e a intensidade precisam considerar sua condição física.",
      "Este conteúdo não indica alongamentos, repetições ou amplitudes de movimento.",
    ],
    reflection:
      "Na consulta, pergunte quais movimentos fazem sentido para você e quais precisam de adaptação.",
    source: "nhsActivity",
  },
  {
    id: "ambiente",
    category: "equilibrio",
    icon: "home",
    title: "Um ambiente mais seguro",
    summary:
      "Observe os pequenos detalhes da casa que merecem atenção no dia a dia.",
    intro:
      "O ambiente também faz parte do cuidado. Iluminação, caminhos livres e tapetes bem fixados são pontos de atenção na prevenção de quedas.",
    heading: "Pontos para observar em casa",
    points: [
      "Veja se há tapetes soltos ou objetos nas áreas de passagem.",
      "Observe a iluminação, inclusive no caminho usado durante a noite.",
      "Peça ajuda para adaptações que exijam esforço ou instalação de apoios.",
    ],
    reflection:
      "Escolha um cômodo e converse com alguém de confiança sobre o que poderia ser melhorado. Não suba em bancos para fazer mudanças.",
    source: "quedas",
  },
  {
    id: "equilibrio-autonomia",
    category: "equilibrio",
    icon: "balance",
    title: "Equilíbrio e autonomia",
    summary:
      "Entenda por que falar sobre equilíbrio é parte de uma conversa de cuidado.",
    intro:
      "Força, equilíbrio e flexibilidade fazem parte das orientações gerais de atividade física para pessoas idosas. A escolha das práticas deve considerar as condições individuais.",
    heading: "Uma conversa importante",
    points: [
      "Conte à equipe de saúde se você caiu ou tem receio de cair.",
      "Peça orientação antes de tentar desafios de equilíbrio por conta própria.",
      "Uma página educativa não verifica se você pode realizar um movimento com segurança.",
    ],
    reflection:
      "Que situações do cotidiano deixam você inseguro? Não é preciso responder aqui: essa informação pertence à conversa com seu profissional.",
    source: "nhsActivity",
  },
  {
    id: "respirar",
    category: "respiracao",
    icon: "wind",
    title: "Respirar com tranquilidade",
    summary:
      "Uma leitura sobre conforto e atenção à respiração, sem metas ou contagens.",
    intro:
      "Em orientações gerais de relaxamento, o NHS destaca o conforto e a suavidade da respiração. Não é necessário transformar essa atenção em uma disputa com o relógio.",
    heading: "Conforto em primeiro lugar",
    points: [
      "Uma posição confortável faz parte das orientações de relaxamento.",
      "A respiração deve ser suave, sem forçar sua profundidade.",
      "O cronômetro deste site é apenas uma pausa de leitura; não define ciclos respiratórios.",
    ],
    reflection:
      "Dúvidas ou desconfortos respiratórios precisam de avaliação profissional. Este texto não é uma técnica para tratar falta de ar.",
    source: "breathing",
  },
  {
    id: "conversa-cuidado",
    category: "respiracao",
    icon: "chat",
    title: "Uma conversa que cuida",
    summary:
      "Organize suas dúvidas e participe das decisões sobre o seu bem-estar.",
    intro:
      "O acompanhamento da pessoa idosa considera necessidades, autonomia e contexto de vida. Suas preferências e dúvidas ajudam a construir essa conversa.",
    heading: "Ideias para a próxima consulta",
    points: [
      "Pergunte sobre mudanças que você percebeu nas atividades do cotidiano.",
      "Conte o que gostaria de continuar fazendo com autonomia.",
      "Peça explicações em linguagem clara e confirme o que entendeu.",
    ],
    reflection:
      "Se quiser, convide uma pessoa de confiança para acompanhar a conversa, preservando suas escolhas e sua privacidade.",
    source: "quedas",
  },
]);
