package br.edu.vitasenior;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public final class Database {
  private final String url;

  public Database(String path) throws Exception {
    Class.forName("org.sqlite.JDBC");
    Path file = Path.of(path).toAbsolutePath();
    Files.createDirectories(file.getParent());
    url = "jdbc:sqlite:" + file;
    try (Connection c = open(); InputStream in = getClass().getResourceAsStream("/schema.sql")) {
      if (in == null) throw new IllegalStateException("schema.sql ausente");
      for (String statement : new String(in.readAllBytes(), StandardCharsets.UTF_8).split(";")) {
        if (!statement.isBlank()) try (Statement s = c.createStatement()) { s.execute(statement); }
      }
    }
  }

  private Connection open() throws SQLException {
    Connection c = DriverManager.getConnection(url);
    try (Statement s = c.createStatement()) {
      s.execute("PRAGMA foreign_keys=ON");
      s.execute("PRAGMA busy_timeout=5000");
    }
    return c;
  }

  public List<Activity> activities() throws SQLException {
    List<Activity> result = new ArrayList<>();
    String sql = "SELECT a.*, count(i.id) booked FROM atividades a LEFT JOIN inscricoes i ON i.atividade_id=a.id GROUP BY a.id ORDER BY a.data_hora,a.id";
    try (Connection c = open(); PreparedStatement p = c.prepareStatement(sql); ResultSet r = p.executeQuery()) {
      while (r.next()) result.add(activity(r));
    }
    return result;
  }

  public Activity activity(long id) throws SQLException {
    String sql = "SELECT a.*, count(i.id) booked FROM atividades a LEFT JOIN inscricoes i ON i.atividade_id=a.id WHERE a.id=? GROUP BY a.id";
    try (Connection c = open(); PreparedStatement p = c.prepareStatement(sql)) {
      p.setLong(1, id);
      try (ResultSet r = p.executeQuery()) { return r.next() ? activity(r) : null; }
    }
  }

  private Activity activity(ResultSet r) throws SQLException {
    return new Activity(r.getLong("id"), r.getString("titulo"), r.getString("descricao"), r.getString("data_hora"), r.getString("local"), r.getInt("vagas"), r.getInt("booked"));
  }

  public synchronized long saveActivity(long id, String title, String description, String dateTime, String place, int capacity) throws SQLException {
    if (id != 0) {
      Activity current = activity(id);
      if (current == null) throw new IllegalArgumentException("Atividade não encontrada");
      if (capacity < current.booked()) throw new IllegalArgumentException("Vagas inferiores ao número de inscrições");
    }
    String sql = id == 0 ? "INSERT INTO atividades(titulo,descricao,data_hora,local,vagas) VALUES(?,?,?,?,?)" : "UPDATE atividades SET titulo=?,descricao=?,data_hora=?,local=?,vagas=? WHERE id=?";
    try (Connection c = open(); PreparedStatement p = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
      p.setString(1,title); p.setString(2,description); p.setString(3,dateTime); p.setString(4,place); p.setInt(5,capacity);
      if (id != 0) p.setLong(6,id);
      if (p.executeUpdate() == 0) throw new IllegalArgumentException("Atividade não encontrada");
      if (id != 0) return id;
      try (ResultSet keys = p.getGeneratedKeys()) { return keys.next() ? keys.getLong(1) : 0; }
    }
  }

  public synchronized void deleteActivity(long id) throws SQLException {
    try (Connection c = open(); PreparedStatement p = c.prepareStatement("DELETE FROM atividades WHERE id=?")) {
      p.setLong(1,id); p.executeUpdate();
    }
  }

  public List<Booking> bookings() throws SQLException {
    List<Booking> result = new ArrayList<>();
    try (Connection c = open(); PreparedStatement p = c.prepareStatement("SELECT i.*,a.titulo FROM inscricoes i JOIN atividades a ON a.id=i.atividade_id ORDER BY i.id DESC"); ResultSet r = p.executeQuery()) {
      while (r.next()) result.add(booking(r));
    }
    return result;
  }

  private Booking booking(ResultSet r) throws SQLException {
    return new Booking(r.getLong("id"),r.getLong("atividade_id"),r.getString("titulo"),r.getString("nome"),r.getString("codigo"));
  }

  public Booking booking(String code) throws SQLException {
    try (Connection c = open(); PreparedStatement p = c.prepareStatement("SELECT i.*,a.titulo FROM inscricoes i JOIN atividades a ON a.id=i.atividade_id WHERE i.codigo=?")) {
      p.setString(1,code);
      try (ResultSet r = p.executeQuery()) { return r.next() ? booking(r) : null; }
    }
  }

  public synchronized Booking createBooking(long activityId, String name, String code) throws SQLException {
    Activity a = activity(activityId);
    if (a == null) throw new IllegalArgumentException("Atividade não encontrada");
    if (a.booked() >= a.capacity()) throw new IllegalArgumentException("Não há vagas disponíveis");
    try (Connection c = open(); PreparedStatement p = c.prepareStatement("INSERT INTO inscricoes(atividade_id,nome,codigo) VALUES(?,?,?)")) {
      p.setLong(1,activityId); p.setString(2,name); p.setString(3,code); p.executeUpdate();
    }
    return booking(code);
  }

  public boolean updateBooking(String code, String name) throws SQLException {
    try (Connection c = open(); PreparedStatement p = c.prepareStatement("UPDATE inscricoes SET nome=? WHERE codigo=?")) {
      p.setString(1,name); p.setString(2,code); return p.executeUpdate() > 0;
    }
  }

  public boolean deleteBooking(String code) throws SQLException {
    try (Connection c = open(); PreparedStatement p = c.prepareStatement("DELETE FROM inscricoes WHERE codigo=?")) {
      p.setString(1,code); return p.executeUpdate() > 0;
    }
  }
}
