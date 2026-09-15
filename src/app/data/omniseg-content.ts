export const omnisegLimits = [
  {
    title: "O backend declarativo não está no repositório",
    body:
      "Políticas de acesso, constraints, funções e políticas de bucket vivem no painel do provedor, não em migrations versionadas. Consequência direta: o ambiente não é reproduzível e a segurança não é demonstrável. Não é possível provar que um aluno não consegue alterar o próprio papel chamando a API diretamente, apenas afirmar. É o achado de maior severidade e o primeiro item do roadmap.",
  },
  {
    title: "Entrega e devolução não são transações",
    body:
      "Débito de estoque e mudança de status são chamadas separadas, com compensação de melhor esforço se a segunda falhar. A concorrência otimista reduz a janela, não a fecha. O estado pode terminar divergente: devolvido sem crédito de volta. A correção é mover as duas operações para funções SQL transacionais com trava de linha.",
  },
  {
    title: "O limite ignora pedidos pendentes",
    body:
      "O cálculo do que está em uso soma apenas itens já entregues. Vários pedidos abertos em sequência passam individualmente pelo teto e o ultrapassam somados. A validação precisa ser refeita no banco na criação, na aprovação e na entrega.",
  },
  {
    title: "A relação entre item e setor é texto",
    body:
      "Setores são gravados como lista separada por vírgulas em um campo do EPI e comparados no navegador. Renomear um setor não atualiza esse campo. A tabela associativa correta existe no schema e não é usada. É dívida de modelagem assumida, não descoberta.",
  },
  {
    title: "O painel agrega no navegador",
    body:
      "Carrega as coleções completas e calcula no cliente, sem filtro de período nem paginação. Funciona no volume atual e não funciona no volume seguinte.",
  },
];
