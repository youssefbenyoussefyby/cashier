// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::{Manager, Window};
use tauri_plugin_sql::{ Migration, MigrationKind};  
fn close_window(app: &tauri::AppHandle, label: &str) {
  if let Some(w) = app.get_window(label) {
    let _ = w.close();
  }
}
fn show_window(app: &tauri::AppHandle, label: &str) {
  if let Some(w) = app.get_window(label) {
    let _ = w.show();
  }
}
fn hide_window(app: &tauri::AppHandle, label: &str) {
  if let Some(w) = app.get_window(label) {
    let _ = w.hide();
  }
}

#[tauri::command]
async fn close_splashscreen(window: Window) {
  let app = window.app_handle();
  close_window(&app, "splashscreen");
  show_window(&app, "main");
}

#[tauri::command]
async fn open_login(window: Window) {
  let app = window.app_handle();
  show_window(&app, "login");
  hide_window(&app, "main");
  close_window(&app, "splashscreen");
}

#[tauri::command]
async fn open_singup(window: Window) {
  let app = window.app_handle();
  show_window(&app, "singup");
  hide_window(&app, "main");
  close_window(&app, "splashscreen");
}

#[tauri::command]
async fn open_main(window: Window) {
  let app = window.app_handle();
  close_window(&app, "singup");
  show_window(&app, "main");
  close_window(&app, "login");
}

#[tauri::command]
fn log(logs:String){
	print!("{logs}");
}



fn main() {
let sql:&str ="CREATE TABLE users(
id INTEGER PRIMARY KEY,
identifier TEXT UNIQUE,
password TEXT UNIQUE,
access VARCHAR(50),
role TEXT
);CREATE TABLE category(
id INTEGER PRIMARY KEY,
imoji TEXT,
name TEXT UNIQUE,
color TEXT
);
CREATE TABLE TVA(
id INTEGER PRIMARY KEY,
name TEXT,
value INTEGER CHECK(value >=0 AND value <100)
);
CREATE TABLE products(
id VARCHAR(30) PRIMARY KEY,
reference VARCHAR(30) NOT NULL,
barcode VARCHAR(20),
name TEXT NOT NULL,
prix_achat FLOAT,
prix_vente FLOAT,
Stock_sec INTEGER,
qte REAL,
marge_de_negotiation FLOAT,
category INTEGER,
tva INTEGER,
FOREIGN KEY(category) REFERENCES category(id),
FOREIGN KEY(tva) REFERENCES TVA(id)
);
CREATE TABLE clients(
id INTEGER PRIMARY KEY,
reference VARCHAR(30) NOT NULL,
name TEXT NOT NULL,
responsable TEXT,
tele VARCHAR(30),
email VARCHAR(30),
debt FLOAT,
address TEXT,
Matricule_fiscale VARCHAR(15)
);
CREATE TABLE fournisseurs(
id INTEGER PRIMARY KEY,
reference VARCHAR(30) NOT NULL,
name TEXT NOT NULL,
responsable TEXT,
tele VARCHAR(30),
email VARCHAR(30),
debt FLOAT,
address TEXT,
Matricule_fiscale VARCHAR(15)
);
CREATE TABLE chauffeur (
	id	INTEGER,
	name	TEXT,
	PRIMARY KEY(id)
);
CREATE TABLE facture (
	id	INTEGER,
	number	TEXT NOT NULL UNIQUE,
	client	INTEGER,
	date	TEXT,
	payment	NUMERIC,
	mode_payment	TEXT DEFAULT 'espèces' CHECK(mode_payment in ('espèces','chèques','virement')),
	chaufeur	TEXT,
	vehicule	TEXT,
	avance	REAL,
	price Float,
	PRIMARY KEY(id),
	FOREIGN KEY(client) REFERENCES clients(id) ON DELETE CASCADE
);
CREATE TABLE liste_article_f (
	id	INTEGER UNIQUE,
	product	INTEGER,
	quantite	REAL,
	prix	REAL,
	facture	INTEGER,
	PRIMARY KEY(id),
	FOREIGN KEY(product) REFERENCES products(id) ON DELETE CASCADE,
	FOREIGN KEY(facture) REFERENCES facture(id) ON DELETE CASCADE
);
CREATE TABLE facture_fournisseur (
	id	INTEGER,
	number	TEXT NOT NULL UNIQUE,
	fournisseur	INTEGER,
	date	TEXT,
	payment	NUMERIC,
	mode_payment	TEXT DEFAULT 'espèces' CHECK(mode_payment in ('espèces','chèques','virement')),
	avance	REAL,
	price REAL,
	PRIMARY KEY(id),
	FOREIGN KEY(fournisseur) REFERENCES fournisseurs(id)
);
CREATE TABLE liste_article_ff (
	id	INTEGER UNIQUE,
	product	INTEGER,
	quantite	REAL,
	prix	REAL,
	facture	INTEGER,
	PRIMARY KEY(id),
	FOREIGN KEY(product) REFERENCES products(id),
	FOREIGN KEY(facture) REFERENCES facture_fournisseur(id)
);
CREATE TABLE bl (
	id	INTEGER,
	number	TEXT NOT NULL UNIQUE,
	client	INTEGER,
	date	TEXT,
	payment	NUMERIC,
	mode_payment	TEXT DEFAULT 'espèces' CHECK(mode_payment in ('espèces','chèques','virement')),
	chaufeur	TEXT,
	vehicule	TEXT,
	avance	REAL,
  	facture INTEGER,
	price Float,
	PRIMARY KEY(id),
	FOREIGN KEY(client) REFERENCES clients(id)
);
CREATE TABLE liste_article_b (
	id	INTEGER UNIQUE,
	product	INTEGER,
	quantite	REAL,
	prix	REAL,
	bl	INTEGER,
	PRIMARY KEY(id),
	FOREIGN KEY(product) REFERENCES products(id),
	FOREIGN KEY(bl) REFERENCES bl(id) ON DELETE CASCADE
);
CREATE TABLE bl_draft (
	id	INTEGER,
	name	TEXT NOT NULL UNIQUE,
	client	INTEGER,
	date	TEXT,
	payment	NUMERIC,
	mode_payment	TEXT,
	chaufeur	TEXT,
	vehicule	TEXT,
	price REAL,
	avance	REAL,
	PRIMARY KEY(id),
	FOREIGN KEY(client) REFERENCES clients(id)
 
);
CREATE TABLE liste_article_b_draft (
	id	INTEGER UNIQUE,
	product	INTEGER,
	quantite	REAL,
	prix	REAL,
	bl	INTEGER,
	PRIMARY KEY(id),
	FOREIGN KEY(product) REFERENCES products(id),
	FOREIGN KEY(bl) REFERENCES bl_draft(id)
);
CREATE TABLE paiement_client (
	id	INTEGER,
	client	INTEGER,
	montant	REAL,
	date	TEXT,
	par	TEXT,
	PRIMARY KEY(id),
	FOREIGN KEY(client) REFERENCES clients(id)
);
CREATE TABLE paiement_fournisseur (
	id	INTEGER,
	fournisseur	INTEGER,
	montant	REAL,
	date	TEXT,
	par	TEXT,
	PRIMARY KEY(id),
	FOREIGN KEY(fournisseur) REFERENCES fournisseurs(id)
);
CREATE TABLE ventes (
	id	INTEGER,
	ref	TEXT NOT NULL UNIQUE,
	montant	REAL,
	date	TEXT,
	PRIMARY KEY(id)
);
CREATE TABLE LISTE_VENTE (
	id	INTEGER,
	product	INTEGER,
	qte	REAL,
	prix	REAL,
	ticket	INTEGER,
	PRIMARY KEY(id),
	FOREIGN KEY(product) REFERENCES products(id),
	FOREIGN KEY(ticket) REFERENCES ventes(id) ON DELETE CASCADE
);
CREATE TABLE info(
	company_name TEXT,
	matricule_fiscale TEXT,
	adresse TEXT,
	email TEXT,
	tel TEXT,
	numero_f INTEGER
);
";
  let migrations = vec![
   Migration {
        version: 1,
        description: "table__init__",
        sql: sql,
        kind: MigrationKind::Up,
    },  Migration {
		version: 2,
		description: "add_loi_47_2023_to_products",
		sql: r#"ALTER TABLE products ADD COLUMN loi_47_2023 FLOAT DEFAULT 0.0;
		"#,
		kind: MigrationKind::Up,
	  },  Migration {
		version: 3,
		description: "add_charges_table",
		sql: r#"
		  CREATE TABLE charges (
			id INTEGER PRIMARY KEY,
			description TEXT NOT NULL,
			amount FLOAT NOT NULL CHECK(amount >= 0),
			kind TEXT NOT NULL CHECK(kind IN ('fixed', 'variable')),
			date TEXT DEFAULT (strftime('%Y-%m-%d','now')),
			period INTEGER DEFAULT 30
		  );
		  ALTER TABLE bl 
		  ADD COLUMN remise INTEGER DEFAULT 0;
		  ALTER TABLE facture 
		  ADD COLUMN remise INTEGER DEFAULT 0;
		"#,
		kind: MigrationKind::Up,
	  },
];

 tauri::Builder::default().invoke_handler(tauri::generate_handler![close_splashscreen,open_login,open_singup,log,open_main]).plugin(tauri_plugin_sql::Builder::default().add_migrations("sqlite:cashier.db", migrations).build())
    .run(tauri::generate_context!())
        .expect("error while running tauri application");

}
