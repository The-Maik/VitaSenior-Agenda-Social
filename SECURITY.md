# Segurança

Não inclua senhas, documentos, prontuários, diagnósticos ou dados pessoais em issues públicas. O canal privado de segurança do responsável ainda precisa ser definido antes de uma operação pública; esta versão é uma demonstração acadêmica.

A biblioteca pública usa apenas ativos estáticos locais e não recebe dados de saúde. O novo módulo de atividades possui backend Java e banco relacional. A área administrativa requer senha de alta entropia e sessão; inscrições usam códigos aleatórios como credenciais. O app se comunica por HTTPS. Não publique senhas, banco ou códigos de inscrição. O servidor `scripts/serve.mjs` é apenas para desenvolvimento local, ligado a `127.0.0.1`.

Antes de publicar, revise os arquivos efetivamente servidos, use HTTPS, revise permissões do repositório e mantenha dependências de teste atualizadas. O aplicativo não controla registros do provedor de hospedagem.
