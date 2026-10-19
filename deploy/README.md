# Implantação Oracle Cloud Always Free

Instância usada: `web-db-01`, VM.Standard.E2.1.Micro, Ubuntu 24.04, IP `137.131.249.162`. A aplicação é servida por Caddy em HTTPS; Tomcat atende somente no loopback; SQLite fica em `/var/lib/vitasenior/vitasenior.db` com dono `tomcat`. O banco não tem porta pública. A biblioteca educativa fica em `/srv/vitasenior/site`.

## Atualização

```sh
cd web
mvn -DskipTests package
sudo install -m 644 target/vitasenior.war /var/lib/tomcat10/webapps/vitasenior.war
sudo systemctl restart tomcat10
```

Copiar também os arquivos estáticos da raiz (`*.html`, `css/`, `js/`, `assets/`) para `/srv/vitasenior/site`. A configuração de proxy está em `deploy/Caddyfile` e instalada em `/etc/caddy/Caddyfile`. O serviço Tomcat lê `VITA_DB_PATH` e `VITA_ADMIN_PASSWORD` de `/etc/vitasenior/tomcat.env`, acessível somente ao root. A senha administrativa está em `/etc/vitasenior/admin-password`, com cópia local fora do repositório em `~/.config/vitasenior/admin-password`.

O APK compilado deve ser copiado para `/srv/vitasenior/site/downloads/vitasenior.apk`; o site oferece o download em `https://137.131.249.162.sslip.io/downloads/vitasenior.apk`. A versão atual usa a chave de depuração padrão do Flutter e serve à demonstração acadêmica.

## Backup

Com o serviço em execução, o backup consistente do banco pode ser feito com:

```sh
sudo sqlite3 /var/lib/vitasenior/vitasenior.db ".backup '/var/lib/vitasenior/backup.db'"
sudo chmod 600 /var/lib/vitasenior/backup.db
```

Copie o backup para outro local protegido. Não publique o banco, o arquivo de ambiente, a senha nem códigos de inscrição no GitHub. Para recuperar, pare Tomcat, substitua o arquivo do banco por uma cópia validada e reinicie o serviço.

## Teste da entrega

1. Abra `https://137.131.249.162.sslip.io/` e a área `https://137.131.249.162.sslip.io/vitasenior/admin/`.
2. A agenda contém uma atividade fictícia de demonstração. Cadastre uma segunda atividade no Web ou altere a existente.
3. O aplicativo Android usa a API `https://137.131.249.162.sslip.io/vitasenior/api` por padrão. Consulte a agenda e crie uma inscrição.
4. Confira a inscrição no Web; altere e cancele pelo app.

O domínio `sslip.io` deriva do IP público. Caso o IP seja alterado, atualize DNS/endereço, Caddyfile e `API_BASE` do app. Para operação contínua, associe um domínio controlado pelo grupo.
