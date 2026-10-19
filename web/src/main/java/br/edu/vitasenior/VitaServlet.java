package br.edu.vitasenior;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HexFormat;

@WebServlet({"/admin/*", "/api/*"})
public class VitaServlet extends HttpServlet {
  private Database db;
  private final SecureRandom random = new SecureRandom();

  @Override public void init() throws ServletException {
    try {
      String path = System.getenv().getOrDefault("VITA_DB_PATH", System.getProperty("java.io.tmpdir") + "/vitasenior.db");
      db = new Database(path);
    } catch (Exception e) { throw new ServletException("Falha ao iniciar banco",e); }
  }

  @Override protected void service(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
    req.setCharacterEncoding("UTF-8");
    res.setCharacterEncoding("UTF-8");
    res.setHeader("X-Content-Type-Options","nosniff");
    res.setHeader("Referrer-Policy","no-referrer");
    res.setHeader("Cache-Control","no-store");
    res.setHeader("Content-Security-Policy","default-src 'self'; style-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
    try {
      if (req.getServletPath().startsWith("/api")) api(req,res);
      else admin(req,res);
    } catch (IllegalArgumentException e) {
      fail(req,res,400,e.getMessage());
    } catch (SQLException e) {
      getServletContext().log("Erro SQL",e);
      fail(req,res,500,"Falha no banco de dados");
    }
  }

  private void fail(HttpServletRequest req, HttpServletResponse res, int status, String message) throws IOException {
    res.setStatus(status);
    if (req.getServletPath().startsWith("/api")) json(res,"{\"erro\":"+q(message)+"}");
    else { res.setContentType("text/plain;charset=UTF-8"); res.getWriter().write(message); }
  }

  private void admin(HttpServletRequest req, HttpServletResponse res) throws IOException, ServletException, SQLException {
    String path = req.getPathInfo() == null ? "/" : req.getPathInfo();
    String method = req.getMethod();
    HttpSession session = req.getSession(false);
    if (path.equals("/login")) {
      if (method.equals("POST")) {
        String secret = System.getenv("VITA_ADMIN_PASSWORD");
        String supplied = req.getParameter("senha");
        if (secret != null && !secret.isBlank() && supplied != null && MessageDigest.isEqual(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8),supplied.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
          if (session != null) session.invalidate();
          session = req.getSession(true);
          session.setAttribute("admin",Boolean.TRUE);
          session.setAttribute("csrf",token());
          session.setMaxInactiveInterval(1800);
          res.sendRedirect(req.getContextPath()+"/admin/");
          return;
        }
        req.setAttribute("error","Senha incorreta");
      }
      view(req,res,"login.jsp"); return;
    }
    if (session == null || !Boolean.TRUE.equals(session.getAttribute("admin"))) {
      res.sendRedirect(req.getContextPath()+"/admin/login"); return;
    }
    if (method.equals("POST")) {
      String submitted = req.getParameter("csrf");
      if (submitted == null || !submitted.equals(session.getAttribute("csrf"))) { fail(req,res,403,"Sessão inválida"); return; }
    }
    if (path.equals("/logout") && method.equals("POST")) {
      session.invalidate(); res.sendRedirect(req.getContextPath()+"/admin/login"); return;
    }
    if (path.equals("/save") && method.equals("POST")) {
      long id = number(req.getParameter("id"),0);
      String title = field(req,"titulo",3,100), desc = field(req,"descricao",3,500), place = field(req,"local",3,120);
      String date = field(req,"data_hora",16,16);
      try { LocalDateTime.parse(date); } catch (DateTimeParseException e) { throw new IllegalArgumentException("Data e hora inválidas"); }
      long requestedCapacity = number(req.getParameter("vagas"),-1);
      if (requestedCapacity < 1 || requestedCapacity > 500) throw new IllegalArgumentException("Vagas devem estar entre 1 e 500");
      int capacity = (int) requestedCapacity;
      db.saveActivity(id,title,desc,date,place,capacity);
      res.sendRedirect(req.getContextPath()+"/admin/"); return;
    }
    if (path.equals("/delete") && method.equals("POST")) {
      db.deleteActivity(number(req.getParameter("id"),-1));
      res.sendRedirect(req.getContextPath()+"/admin/"); return;
    }
    if (path.equals("/")) {
      req.setAttribute("activities",db.activities());
      req.setAttribute("bookings",db.bookings());
      view(req,res,"admin.jsp"); return;
    }
    fail(req,res,404,"Página não encontrada");
  }

  private void api(HttpServletRequest req, HttpServletResponse res) throws IOException, SQLException {
    String path = req.getPathInfo() == null ? "/" : req.getPathInfo();
    String method = req.getMethod();
    if (path.equals("/activities") && method.equals("GET")) {
      StringBuilder out = new StringBuilder("[ ");
      for (Activity a : db.activities()) {
        if (out.length() > 2) out.append(',');
        out.append(activityJson(a));
      }
      json(res,out.append(" ]").toString()); return;
    }
    if (path.equals("/bookings") && method.equals("POST")) {
      long id = number(req.getParameter("atividade_id"),-1);
      String name = field(req,"nome",2,60);
      Booking b = db.createBooking(id,name,token());
      res.setStatus(201); json(res,bookingJson(b)); return;
    }
    if (path.equals("/bookings/lookup") && method.equals("POST")) {
      Booking b = db.booking(code(req));
      if (b == null) { fail(req,res,404,"Inscrição não encontrada"); return; }
      json(res,bookingJson(b)); return;
    }
    if (path.equals("/bookings/update") && method.equals("POST")) {
      String code = code(req), name = field(req,"nome",2,60);
      if (!db.updateBooking(code,name)) { fail(req,res,404,"Inscrição não encontrada"); return; }
      json(res,bookingJson(db.booking(code))); return;
    }
    if (path.equals("/bookings/delete") && method.equals("POST")) {
      if (!db.deleteBooking(code(req))) { fail(req,res,404,"Inscrição não encontrada"); return; }
      json(res,"{\"excluida\":true}"); return;
    }
    fail(req,res,404,"Rota não encontrada");
  }

  private String code(HttpServletRequest req) {
    String code = req.getParameter("codigo");
    if (code == null || !code.matches("[0-9a-f]{32}")) throw new IllegalArgumentException("Código inválido");
    return code;
  }
  private long number(String text, long fallback) {
    if (text == null || text.isBlank()) return fallback;
    try { return Long.parseLong(text); } catch (NumberFormatException e) { throw new IllegalArgumentException("Número inválido"); }
  }
  private String field(HttpServletRequest req, String key, int min, int max) {
    String value = req.getParameter(key);
    if (value == null) throw new IllegalArgumentException("Campo obrigatório: "+key);
    value = value.trim();
    if (value.length() < min || value.length() > max) throw new IllegalArgumentException("Tamanho inválido: "+key);
    return value;
  }
  private String token() {
    byte[] bytes = new byte[16]; random.nextBytes(bytes); return HexFormat.of().formatHex(bytes);
  }
  private void view(HttpServletRequest req, HttpServletResponse res, String file) throws ServletException, IOException {
    req.getRequestDispatcher("/WEB-INF/views/"+file).forward(req,res);
  }
  private void json(HttpServletResponse res, String body) throws IOException {
    res.setContentType("application/json;charset=UTF-8"); res.getWriter().write(body);
  }
  private String activityJson(Activity a) {
    return "{\"id\":"+a.id()+",\"titulo\":"+q(a.title())+",\"descricao\":"+q(a.description())+",\"data_hora\":"+q(a.dateTime())+",\"local\":"+q(a.place())+",\"vagas\":"+a.capacity()+",\"inscritos\":"+a.booked()+"}";
  }
  private String bookingJson(Booking b) {
    return "{\"atividade_id\":"+b.activityId()+",\"atividade\":"+q(b.activityTitle())+",\"nome\":"+q(b.name())+",\"codigo\":"+q(b.code())+"}";
  }
  private String q(String value) {
    StringBuilder s = new StringBuilder("\"");
    for (char ch : value.toCharArray()) {
      switch (ch) {
        case '"' -> s.append("\\\"");
        case '\\' -> s.append("\\\\");
        case '\n' -> s.append("\\n");
        case '\r' -> s.append("\\r");
        case '\t' -> s.append("\\t");
        default -> { if (ch < 32) s.append(String.format("\\u%04x",(int)ch)); else s.append(ch); }
      }
    }
    return s.append('"').toString();
  }
}
