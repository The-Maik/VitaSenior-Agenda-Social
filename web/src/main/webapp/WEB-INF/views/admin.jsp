<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" import="java.util.List,br.edu.vitasenior.Activity,br.edu.vitasenior.Booking" %>
<%!
  private String h(String value) {
    if (value == null) return "";
    return value.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("\"","&quot;").replace("'","&#39;");
  }
%>
<%
  List<Activity> activities = (List<Activity>) request.getAttribute("activities");
  List<Booking> bookings = (List<Booking>) request.getAttribute("bookings");
  String csrf = (String) session.getAttribute("csrf");
  String base = request.getContextPath();
%>
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Atividades · VitaSênior</title><link rel="stylesheet" href="<%= base %>/admin.css"></head>
<body><header><div><strong>VitaSênior</strong><span>Gestão de atividades educativas</span></div><form method="post" action="<%= base %>/admin/logout"><input type="hidden" name="csrf" value="<%= csrf %>"><button class="secondary">Sair</button></form></header>
<main><h1>Atividades</h1><p>Cadastre encontros de leitura e bem-estar. Não inclua diagnósticos ou dados de saúde.</p>
<section class="panel"><h2>Nova atividade</h2><form method="post" action="<%= base %>/admin/save" class="grid"><input type="hidden" name="csrf" value="<%= csrf %>"><label>Título<input name="titulo" required minlength="3" maxlength="100"></label><label>Data e hora<input name="data_hora" type="datetime-local" required></label><label>Local<input name="local" required minlength="3" maxlength="120"></label><label>Vagas<input name="vagas" type="number" min="1" max="500" value="12" required></label><label class="wide">Descrição<textarea name="descricao" required minlength="3" maxlength="500"></textarea></label><button>Cadastrar atividade</button></form></section>
<section><h2>Atividades cadastradas</h2>
<% if (activities.isEmpty()) { %><p>Nenhuma atividade cadastrada.</p><% } %>
<% for (Activity a : activities) { %><article class="panel"><h3><%= h(a.title()) %></h3><p><%= a.booked() %> de <%= a.capacity() %> vagas ocupadas · ID <%= a.id() %></p><details><summary>Alterar ou excluir</summary><form method="post" action="<%= base %>/admin/save" class="grid"><input type="hidden" name="csrf" value="<%= csrf %>"><input type="hidden" name="id" value="<%= a.id() %>"><label>Título<input name="titulo" value="<%= h(a.title()) %>" required minlength="3" maxlength="100"></label><label>Data e hora<input name="data_hora" type="datetime-local" value="<%= h(a.dateTime()) %>" required></label><label>Local<input name="local" value="<%= h(a.place()) %>" required minlength="3" maxlength="120"></label><label>Vagas<input name="vagas" type="number" min="<%= Math.max(1,a.booked()) %>" max="500" value="<%= a.capacity() %>" required></label><label class="wide">Descrição<textarea name="descricao" required minlength="3" maxlength="500"><%= h(a.description()) %></textarea></label><button>Salvar alterações</button></form><form method="post" action="<%= base %>/admin/delete"><input type="hidden" name="csrf" value="<%= csrf %>"><input type="hidden" name="id" value="<%= a.id() %>"><button class="danger" data-confirm="Excluir esta atividade e todas as inscrições?">Excluir atividade e inscrições</button></form></details></article><% } %></section>
<section><h2>Inscrições</h2><div class="table-wrap"><table><thead><tr><th>Atividade</th><th>Nome informado</th><th>Código</th></tr></thead><tbody><% for (Booking b : bookings) { %><tr><td><%= h(b.activityTitle()) %></td><td><%= h(b.name()) %></td><td><code><%= h(b.code()) %></code></td></tr><% } %></tbody></table></div><% if (bookings.isEmpty()) { %><p>Não há inscrições.</p><% } %></section>
</main><script src="<%= base %>/admin.js" defer></script></body></html>
