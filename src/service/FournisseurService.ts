import Database from "tauri-plugin-sql-api";
import {  Fournisseur } from "./interface";

export class FournisseurService{
    static async verife(code:any){
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from fournisseurs WHERE reference=$1;",[code]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
return data.length==0;
    }
    static async get_Fournisseur(id:any){
        let products:Fournisseur={};
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from fournisseurs WHERE name=$1;",[id]);
       const data:Array<any> = JSON.parse(JSON.stringify(res));
       const e=data[0];
       console.log(id)
       console.log(data);
       const p:Fournisseur=  {
        name:e["name"],
        ref:e["reference"],
        tele:e["tele"],
        email:e["email"],
        id:e["id"],
       debt:e["debt"],
       address:e["address"],
       matr:e["Matricule_fiscale"],
       res:e["responsable"]  
    };
       products=p;
         
    return products;
    }
    static async getFournisseurs() {
    try {
        let products:Fournisseur[]=[];
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from fournisseurs;");
   const data:Array<any> = JSON.parse(JSON.stringify(res));
   for(const e of data){
    await format(e,products);
   }
     
return products;
 }catch(err){
    throw err;
    
 }

}
static async delete_client(p:Fournisseur){
    try{
        const db = await Database.load("sqlite:cashier.db");
    await db.execute("DELETE FROM fournisseurs WHERE id=$1",[
            p.id
        ]);
        db.close()
    }catch(err){
        throw err;
    }
    
}
static async create_client(p:Fournisseur){
    try{
        const db = await Database.load("sqlite:cashier.db");
 await db.execute("INSERT INTO fournisseurs(id,reference,debt,name,Matricule_fiscale,email,address,tele,responsable)VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9);",[
            p.id,
            p.ref,
            p.debt,
            p.name,
            p.matr,
            p.email,
            p.address,
            p.tele,
            p.res
        ]);
    }catch(err){
        throw err;
    }
}

static async update_client(p:Fournisseur){
    try{
        const db = await Database.load("sqlite:cashier.db");
 await db.execute("UPDATE fournisseurs SET debt=$3 ,name=$4,Matricule_fiscale=$5,email=$6,address=$7,tele=$8,responsable=$9 WHERE id=$1 ;",[
            p.id,
            p.ref,
            p.debt,
            p.name,
            p.matr,
            p.email,
            p.address,
            p.tele,
            p.res
        ]);

        db.close()
    }catch(err){
        throw err;
    }
}

}
async function format(e:any,products:Fournisseur[]) {
    const p:Fournisseur = {
        name:e["name"],
        ref:e["reference"],
        tele:e["tele"],
        email:e["email"],
        id:e["id"],
       debt:e["debt"],
       address:e["address"],
       matr:e["Matricule_fiscale"],
       res:e["responsable"]
        
    }
     products.push(p);

}