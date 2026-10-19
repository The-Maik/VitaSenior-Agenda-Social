<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Administração · VitaSênior</title><link rel="stylesheet" href="<%= request.getContextPath() %>/admin.css"></head>
<body><main class="login"><h1>VitaSênior</h1><p>Administração de atividades</p>
<% if (request.getAttribute("error") != null) { %><p role="alert" class="error">Senha incorreta.</p><% } %>
<form method="post" action="<%= request.getContextPath() %>/admin/login"><label>Senha de administração<input name="senha" type="password" required autocomplete="current-password"></label><button>Entrar</button></form>
<p><a href="/">Voltar à biblioteca educativa</a></p></main></body></html>
