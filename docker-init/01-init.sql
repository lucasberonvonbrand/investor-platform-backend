-- Script de Inicialización Automática de Base de Datos para Docker (Roles + Permisos + Mappings)
CREATE DATABASE IF NOT EXISTS gestor_inversores;
USE gestor_inversores;

-- 1. Tabla de Permisos
CREATE TABLE IF NOT EXISTS permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  permission_name VARCHAR(255) NOT NULL UNIQUE
);

-- Insertar Permisos Semilla
INSERT IGNORE INTO permissions (id, permission_name) VALUES (1, 'CREATE');
INSERT IGNORE INTO permissions (id, permission_name) VALUES (2, 'READ');
INSERT IGNORE INTO permissions (id, permission_name) VALUES (3, 'UPDATE');
INSERT IGNORE INTO permissions (id, permission_name) VALUES (4, 'DELETE');

-- 2. Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(255) NOT NULL UNIQUE
);

-- Insertar Roles Semilla (Nota: en la BD la columna se llama 'role', ej. STUDENT, INVESTOR, ADMIN)
INSERT IGNORE INTO roles (id, role) VALUES (1, 'STUDENT');
INSERT IGNORE INTO roles (id, role) VALUES (2, 'INVESTOR');
INSERT IGNORE INTO roles (id, role) VALUES (3, 'ADMIN');

-- 3. Tabla Relacional role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Mapear Permisos por Defecto a Roles
-- ADMIN: CREATE, READ, UPDATE, DELETE
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (3, 1), (3, 2), (3, 3), (3, 4);

-- INVESTOR: CREATE, READ, UPDATE
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (2, 1), (2, 2), (2, 3);

-- STUDENT: CREATE, READ, UPDATE
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, 1), (1, 2), (1, 3);

-- 4. Tabla de Tags / Categorías de Proyectos
CREATE TABLE IF NOT EXISTS project_tags (
  id_project_tag BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Insertar Categorías Estándar
INSERT IGNORE INTO project_tags (id_project_tag, name) VALUES (1, 'SALUD Y BIENESTAR');
INSERT IGNORE INTO project_tags (id_project_tag, name) VALUES (2, 'TECNOLOGÍA');
INSERT IGNORE INTO project_tags (id_project_tag, name) VALUES (3, 'EDUCACIÓN');
INSERT IGNORE INTO project_tags (id_project_tag, name) VALUES (4, 'MEDIO AMBIENTE');
INSERT IGNORE INTO project_tags (id_project_tag, name) VALUES (5, 'FINTECH');
INSERT IGNORE INTO project_tags (id_project_tag, name) VALUES (6, 'OTROS');
