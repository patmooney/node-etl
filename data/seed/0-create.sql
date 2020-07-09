CREATE DATABASE source_db;

\c source_db;

CREATE TABLE client (
    "id" SERIAL,
    "favourite_colour" VARCHAR NOT NULL,
    PRIMARY KEY ("id")
);

INSERT INTO client (favourite_colour) VALUES
	('White'),
	('Yellow'),
	('Blue'),
	('Red'),
	('Green'),
	('Black'),
	('Brown'),
	('Azure'),
	('Ivory'),
	('Teal'),
	('Silver'),
	('Purple'),
	('Navy blue'),
	('Pea green'),
	('Gray'),
	('Orange'),
	('Maroon'),
	('Charcoal'),
	('Aquamarine'),
	('Coral'),
	('Fuchsia'),
	('Wheat'),
	('Lime'),
	('Crimson'),
	('Khaki'),
	('Hot pink'),
	('Magenta'),
	('Olden'),
	('Plum'),
	('Olive'),
	('Cyan');

CREATE TABLE personal_data (
    "id" SERIAL,
    "client_id" INTEGER UNIQUE NOT NULL,
    "first_name" VARCHAR(30) NOT NULL,
    "last_name" VARCHAR(30) NOT NULL,
    "address" TEXT NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("client_id") REFERENCES "client" ("id")
);

INSERT INTO personal_data ("client_id", "first_name", "last_name", "address") VALUES
    (1, 'Lysanne', 'Bins', '8022 Juliet Plains Lamar Shoal, New Emanuel'),
	(2, 'Monty', 'Jacobson', '527 Enos Roads Luettgen Ways, Hayesland'),
	(3, 'Christiana', 'Haag', '835 Rebeca Mall Gleichner Lodge, Jaycestad'),
	(4, 'Lyla', 'McDermott', '85643 Simonis Streets Joany Court, Reichelview'),
	(5, 'Waldo', 'Grant', '83479 Kieran Stravenue Walter Rapid, New Delaney'),
	(6, 'Leola', 'Yost', '0359 Schinner Light Emilia Mill, Lake Vaughnport'),
	(7, 'Stanton', 'Jakubowski', '44514 Kulas Terrace Mueller Island, Schuppefort'),
	(8, 'Raegan', 'Ledner', '115 Stoltenberg Causeway Bessie Isle, North Westonstad'),
	(9, 'Natasha', 'Gusikowski', '766 Ada Knoll Reilly Pike, North Gordonchester'),
	(10, 'Quinten', 'Jones', '66196 Maximilian Inlet Bridie Hollow, Trudiestad'),
	(11, 'Ezra', 'Powlowski', '4076 Winnifred Meadows Elijah Village, New Antonettaberg'),
	(12, 'Katherine', 'Littel', '7222 Chaya Common Amie Trail, Lake Cathrynhaven'),
	(13, 'Sadye', 'Jacobson', '016 Romaguera Way Earnest Branch, East Cassie'),
	(14, 'Theron', 'Runte', '32636 Hudson Brook Pacocha Greens, Funkborough'),
	(15, 'Billy', 'Kling', '64020 Turcotte Causeway Sarai Summit, East Itzelshire'),
	(16, 'Noel', 'Hauck', '2468 Velda Landing Ericka Trail, Cronintown'),
	(17, 'Donnie', 'Medhurst', '51995 Brekke Cape Gaylord Burgs, West Orville'),
	(18, 'Reyna', 'Runte', '7096 Kiara Parkway Zemlak Parks, Verlamouth'),
	(19, 'Elroy', 'Effertz', '8564 Annabell Center Salvatore Trail, North Corrine'),
	(20, 'Cheyenne', 'Hirthe', '1797 Eleonore Estates Seth Creek, Cathrynmouth'),
	(21, 'Merle', 'Swaniawski', '10477 Carter Garden Champlin Ports, West Kenny'),
	(22, 'Jordane', 'Aufderhar', '484 Elouise Walks Quigley Isle, New Magdalenmouth'),
	(23, 'Amani', 'Murphy', '03119 Monahan Viaduct Sven Islands, Armandomouth'),
	(24, 'Coy', 'Feil', '97381 Benny Parkways Wilkinson Route, Claudieview'),
	(25, 'Marilyne', 'Kshlerin', '0515 Emard Course Irma Fords, Rowestad'),
	(26, 'Immanuel', 'Cremin', '185 Weissnat Expressway Omari Garden, Kathleenport'),
	(27, 'Liza', 'Hodkiewicz', '9210 Hilpert Fords Cielo Views, East Harleychester'),
	(28, 'Michele', 'Considine', '4609 Maggio Island Davis Ramp, New Samara'),
	(29, 'Waldo', 'Green', '97307 Lawson Forks Nora Points, South Vinniebury'),
	(30, 'Jalen', 'Schultz', '4839 Adams Island Leuschke Way, Carmineshire'),
	(31, 'Harry', 'Reichert', '829 Grant Track Homenick Station, Baileeton');
