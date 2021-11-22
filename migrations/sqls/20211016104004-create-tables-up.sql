/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS Buildings (
    code VARCHAR(10) PRIMARY KEY,
    name TEXT
);
CREATE TABLE IF NOT EXISTS Floors (
    id SERIAL PRIMARY KEY,
    building_code VARCHAR(10),
    code VARCHAR(10),
    CONSTRAINT fk_building FOREIGN KEY(building_code) REFERENCES Buildings(code)
);
CREATE TABLE IF NOT EXISTS Rooms (
    id SERIAL PRIMARY KEY,
    number VARCHAR(10),
    floor_id INTEGER,
    CONSTRAINT fk_floor FOREIGN KEY (floor_id) REFERENCES Floors(id)
);
INSERT INTO Buildings (code, name)
VALUES ('HG', 'hauptcoso'),
    ('CAB', 'Coso info'),
    ('ML', 'altro edificio bohu');
INSERT INTO Floors (id, building_code, code)
VALUES (0, 'HG', 'F'),
    (1, 'HG', 'E'),
    (2, 'HG', 'F');
INSERT INTO Rooms (number, floor_id)
VALUES ('23', 0),
    ('15', 1);