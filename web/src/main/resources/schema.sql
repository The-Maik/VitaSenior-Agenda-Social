PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS atividades (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 titulo TEXT NOT NULL CHECK(length(titulo) BETWEEN 3 AND 100),
 descricao TEXT NOT NULL CHECK(length(descricao) BETWEEN 3 AND 500),
 data_hora TEXT NOT NULL,
 local TEXT NOT NULL CHECK(length(local) BETWEEN 3 AND 120),
 vagas INTEGER NOT NULL CHECK(vagas BETWEEN 1 AND 500),
 criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS inscricoes (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 atividade_id INTEGER NOT NULL REFERENCES atividades(id) ON DELETE CASCADE,
 nome TEXT NOT NULL CHECK(length(nome) BETWEEN 2 AND 60),
 codigo TEXT NOT NULL UNIQUE CHECK(length(codigo) = 32),
 criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_inscricoes_atividade ON inscricoes(atividade_id);
