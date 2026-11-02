// Executar na raiz: node docs/tcc-evidencias/gerar-catalogo.cjs
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const descricoes = {
  '01': ['Autenticação', 'Formulário de acesso e recuperação de senha', 'Desenvolvimento do Sistema'],
  '02': ['Cadastro', 'Formulário de criação de conta', 'Desenvolvimento do Sistema'],
  '03': ['Dashboard', 'Painel com período, saldo e atalhos financeiros', 'Resultados Obtidos'],
  '03.1': ['Dashboard', 'Seções de análise e últimas movimentações', 'Resultados Obtidos'],
  '03.2': ['Dashboard', 'Categorias e orçamentos no painel', 'Desenvolvimento do Sistema'],
  '03.3': ['Dashboard', 'Próximos pagamentos e alertas', 'Resultados Obtidos'],
  '04': ['Perfis financeiros', 'Resumo e seleção de perfis pessoais e empresariais', 'Desenvolvimento do Sistema'],
  '04.1': ['Perfis financeiros', 'Cartões de perfis com ações de edição e ativação', 'Desenvolvimento do Sistema'],
  '05': ['Receitas', 'Indicadores e gerenciamento de entradas', 'Resultados Obtidos'],
  '05.1': ['Receitas', 'Lista de receitas com categoria, data e ações', 'Desenvolvimento do Sistema'],
  '06': ['Despesas', 'Indicadores e gerenciamento de saídas', 'Resultados Obtidos'],
  '06.1': ['Despesas', 'Lista de despesas incluindo itens parcelados', 'Desenvolvimento do Sistema'],
  '07': ['Categorias', 'Resumo e gerenciamento de categorias financeiras', 'Desenvolvimento do Sistema'],
  '07.1': ['Categorias', 'Categorias com consumo do orçamento e ações', 'Resultados Obtidos'],
  '08': ['Contas parceladas', 'Indicadores de contas e saldo em aberto', 'Resultados Obtidos'],
  '08.1': ['Contas parceladas', 'Cartões com progresso de pagamento e próximo vencimento', 'Desenvolvimento do Sistema'],
  '09': ['Alertas', 'Indicadores de prioridade e leitura de alertas', 'Resultados Obtidos'],
  '09.1': ['Alertas', 'Lista de alertas de vencimento com ações', 'Desenvolvimento do Sistema'],
  '10': ['Relatórios', 'Resumo financeiro, filtros e exportação', 'Resultados Obtidos'],
  '10.1': ['Relatórios', 'Gráficos de evolução e distribuição por categoria', 'Resultados Obtidos'],
  '10.2': ['Relatórios', 'Tabela de movimentações do período', 'Resultados Obtidos'],
  '11': ['Administração', 'Resumo do gerenciamento de usuários', 'Desenvolvimento do Sistema'],
  '11.1': ['Administração', 'Lista de usuários com permissões e status', 'Desenvolvimento do Sistema'],
};
const linhas = [
  '# Catálogo das capturas existentes', '',
  'Foram inspecionadas visualmente todas as 33 capturas (23 mobile e 10 web). Os originais permanecem intactos. A plataforma indica a pasta e o layout observado; a imagem mobile não comprova instalação nem execução em dispositivo físico.', '',
  'As telas correspondem a componentes existentes nas aplicações. A associação é visual e estrutural; os valores exibidos não foram confrontados com o banco original. Os totais e quantidades históricos das imagens não são métricas desta revisão. Não foi possível afirmar equivalência exata de dados ou de versão para nenhuma captura.', '',
  'Há dados identificáveis e financeiros em capturas de login, perfis, administração e movimentações. Antes de publicar no TCC, oculte identificadores e valores em cópias ou utilize dados sintéticos em novas capturas reais. Não são reproduzidos aqui nomes, documentos, emails nem valores dos originais. As imagens desta pasta de origem não estão declaradas anonimizadas.', '',
  'As capturas de dashboard estão desatualizadas quanto aos subtítulos esclarecidos nesta revisão. As telas de despesas mostram itens parcelados, mas o serviço atual de despesas consulta somente transações pagas: a imagem não comprova paridade atual dessa listagem. A reprodução em execução permanece pendente.', '',
  '| Arquivo | Caminho relativo à raiz | Funcionalidade | Plataforma | Evidência observada | Legenda acadêmica sugerida | Seção recomendada |',
  '|---|---|---|---|---|---|---|',
];
const manifesto = [];
for (const plataforma of ['mobile', 'web']) {
  const pasta = `docs/capturas/${plataforma}`;
  for (const nome of fs.readdirSync(pasta).filter(n => n.endsWith('.png')).sort()) {
    const codigo = nome.split('-')[0];
    const [funcao, descricao, secao] = descricoes[codigo];
    const arquivo = `${pasta}/${nome}`;
    const bytes = fs.readFileSync(arquivo);
    manifesto.push({ arquivo, largura: bytes.readUInt32BE(16), altura: bytes.readUInt32BE(20), sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
    linhas.push(`| ${nome} | ${arquivo} | ${funcao} | ${plataforma} | ${descricao} | Interface ${plataforma} de ${funcao.toLowerCase()} do Finança Fácil. Fonte: acervo do projeto. | ${secao} |`);
  }
}
linhas.push('', 'Para Desenvolvimento, priorizar login/cadastro, perfis, categorias e parcelamentos. Para Resultados, priorizar dashboard web/mobile e relatórios com gráficos. Utilizar as variantes mobile para explicar o conteúdo distribuído na rolagem. Imagens de administração e perfis exigem ocultação de identificadores antes da inserção.', '', 'O manifesto `logs/capturas-sha256.json` permite conferir dimensões e integridade. A revisão não gerou telas fictícias e não substituiu capturas por protótipos.', '');
fs.writeFileSync(path.join(__dirname, '06-catalogo-capturas.md'), linhas.join('\n'));
fs.writeFileSync(path.join(__dirname, 'logs/capturas-sha256.json'), JSON.stringify(manifesto, null, 2) + '\n');
