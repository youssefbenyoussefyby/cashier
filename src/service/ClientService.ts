import Database from "tauri-plugin-sql-api";
import { Client } from "./interface";


export class ClientService{
    static async verife(code:any){
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from clients WHERE reference=$1;",[code]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
return data.length==0;
    }
    static async get_Client(id:any){
        let products:Client={};
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from clients WHERE name=$1;",[id]);
       const data:Array<any> = JSON.parse(JSON.stringify(res));
       const e=data[0];
       const p:Client=  {
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
    static async getClient(id:any){
        let products:Client={};
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from clients WHERE id=$1;",[id]);
       const data:Array<any> = JSON.parse(JSON.stringify(res));
       const e=data[0];
       console.log(id)
       console.log(data);
       const p:Client=  {
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
    
    static async getClients() {
    try {
        let products:Client[]=[];
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from clients;");
   const data:Array<any> = JSON.parse(JSON.stringify(res));
   for(const e of data){
    await format(e,products);
   }
     
return products;
 }catch(err){
    throw err;
    
 }

}
static async delete_client(p:Client){
    try{
        const db = await Database.load("sqlite:cashier.db");
    await db.execute("DELETE FROM clients WHERE id=$1",[
            p.id
        ]);
        db.close()
    }catch(err){
        throw err;
    }
    
}
static async create_client(p:Client){
    try{
        const db = await Database.load("sqlite:cashier.db");
 await db.execute("INSERT INTO clients(id,reference,debt,name,Matricule_fiscale,email,address,tele,responsable)VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9);",[
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

static async update_client(p:Client){
    try{
        const db = await Database.load("sqlite:cashier.db");
 await db.execute("UPDATE clients SET debt=$3 ,name=$4,Matricule_fiscale=$5,email=$6,address=$7,tele=$8,responsable=$9 WHERE id=$1 ;",[
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
static async update_debt(p:Client){
    try{
        const db = await Database.load("sqlite:cashier.db");
 await db.execute("UPDATE clients SET debt=$3 WHERE id=$1 ;",[
            p.id,
            p.ref,
            p.debt,
        ]);

       await db.close()
    }catch(err){
        throw err;
    }
}

}
async function format(e:any,products:Client[]) {
    const p:Client = {
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