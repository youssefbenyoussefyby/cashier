import Database from "tauri-plugin-sql-api";
import {  facture_fornisseur, list_fv } from "./interface";
import { ProductService } from "./ProductService";
import { FournisseurService } from "./FournisseurService";



export class FactureFoService{

    static async quantite_update_add(product:list_fv){

        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from liste_article_ff WHERE id=$1;",[product.id]);
        const data:Array<any> = JSON.parse(JSON.stringify(res));
        const old = data.length==1?data[0]["quantite"]:0;
        const p = data.length==1?data[0]["product"]:0;
        const newv = product.qte? product.qte:0;
        const upp = await ProductService.getProduct(p);
        if(upp.quantite){
            upp.quantite-=old;
            upp.quantite+=newv;
        }
        if(old!=newv){
            await ProductService.update_product(upp);
        }

    }
    static async quantite_add(product:list_fv){
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from liste_article_ff WHERE id=$1;",[product.id]);
        const data:Array<any> = JSON.parse(JSON.stringify(res));
        const p = data.length==1?data[0]["product"]:0;
        const newv = product.qte? product.qte:0;
        const upp = await ProductService.getProduct(p);
        if(upp.quantite){
            upp.quantite+=newv;
        }
        await ProductService.update_product(upp);
    }
    static async quantite_remove(product:list_fv){
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from liste_article_ff WHERE id=$1;",[product.id]);
        const data:Array<any> = JSON.parse(JSON.stringify(res));
        const p = data.length==1?data[0]["product"]:0;
        const newv = product.qte? product.qte:0;
        const upp = await ProductService.getProduct(p);
        if(upp.quantite){
            upp.quantite-=newv;
        }
        await ProductService.update_product(upp);
    }
    static async verife(code:any){
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from facture_fournisseur WHERE number=$1;",[code]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
return data.length==0;
    }
    static async get_factures(){
const factures:facture_fornisseur[] = []
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from facture_fournisseur;");
   const data:Array<any> = JSON.parse(JSON.stringify(res));
   for(const e of data){
    const fournisseur =await get_fournisseur(e["fournisseur"]);
    const p = e["payment"]? "pi pi-check-square":"pi pi-ban";
    const r = e["payment"]? 0:e["price"]-e["avance"];

    factures.push({
id:e["id"],
numero:e["number"],
price:e["price"],
date:e["date"],
fournisseur:fournisseur,
payment:p,
mode_payment:e["mode_payment"],
avance:e["avance"],
rest:r,
paiee:e["payment"],
list:await get_list(e["id"])
    })
   }
return factures;
    }

    static async get_facture(id:any){
        let factures:facture_fornisseur={list:[]} ;
                const db = await Database.load("sqlite:cashier.db");
                const res = await db.select("SELECT * from facture_fournisseur WHERE id=$1;",[id]);
           const data:Array<any> = JSON.parse(JSON.stringify(res));
            const e = data[0];
            const client =await get_fournisseur(e["fournisseur"]);
            const p = e["payment"]? "pi pi-check-square":"pi pi-ban";
            const r = e["payment"]? 0:e["price"]-e["avance"];
            factures={
        id:e["id"],
        numero:e["number"],
        price:e["price"],
        date:e["date"],
        fournisseur:client,
        payment:p,
        mode_payment:e["mode_payment"],
        avance:e["avance"],
        rest:r,
        paiee:e["payment"],
        list:await get_list(e["id"])
            }
           
        return factures ;
            }


    static async update_facture(f:facture_fornisseur){
        const db = await Database.load("sqlite:cashier.db");
       const oldbl =  await this.get_facture(f.id);
        await db.execute("UPDATE facture_fournisseur SET price=$1,mode_payment=$2,payment=$3,avance=$4,fournisseur=$5 WHERE id=$6;",[
f.price,
f.mode_payment,
f.paiee,
f.avance,
await get_client_id(f.fournisseur),
f.id
        ]).then(async()=>f.list?.forEach(async(lf:any)=>( get_list_ids(f.id)).then((data:any)=>data.includes(lf.id)? this.update_list_facture(lf):this.add_to_list(lf,f.id))));
        if(f.paiee){
            const cl = await FournisseurService.get_Fournisseur(await get_client_id(f.fournisseur));
            cl.debt && f.avance ?cl.debt += f.avance:0;   
            cl.debt && f.price ?cl.debt -= f.price:0;
            await FournisseurService.update_client(cl);
        }else if(oldbl.avance!=f.avance){
            const cl = await FournisseurService.get_Fournisseur(await get_client_id(f.fournisseur));
            cl.debt && oldbl.avance ?cl.debt -= oldbl.avance:0;
            cl.debt && f.avance ?cl.debt -= f.avance:0;
            await FournisseurService.update_client(cl);
        }
    }
    static async update_list_facture(lf:list_fv){
        const db = await Database.load("sqlite:cashier.db");
await db.execute("UPDATE liste_article_ff SET quantite=$1,prix=$2 WHERE id=$3",[
    lf.qte,
    lf.price,
    lf.id
])

    }
    static async delete_list_facture(lf:list_fv){
        const db = await Database.load("sqlite:cashier.db");
await db.execute("DELETE FROM liste_article_ff WHERE id=$1",[
    lf.id
])

    }
    static async delete_facture(f:facture_fornisseur){
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("DELETE FROM facture_fournisseur WHERE id=$1",[
            f.id
        ]);
        const cl = await FournisseurService.get_Fournisseur(await get_client_id(f.fournisseur));
        cl.debt && f.avance ?cl.debt += f.avance:0;   
        cl.debt && f.price ?cl.debt -= f.price:0;
        await FournisseurService.update_client(cl);
    }

    static async add_facture(f:facture_fornisseur){
        const db = await Database.load("sqlite:cashier.db");
        console.log(f);
await db.execute("INSERT INTO facture_fournisseur (id,number,price,date,mode_payment,payment,avance,fournisseur)VALUES($1,$2,$3,$4,$5,$6,$7,$8);",[
f.id,
f.numero,
f.price,
f.date,
'espèces',
f.paiee,
f.avance,
await get_client_id(f.fournisseur)
]);
const cl = await FournisseurService.get_Fournisseur(await get_client_id(f.fournisseur));  
cl.debt && f.price ?cl.debt += f.price:0;
await FournisseurService.update_client(cl);
    }

    static async add_to_list(lf:list_fv,id:any){
        console.log(lf);
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("INSERT INTO liste_article_ff (id,product,quantite,prix,facture)VALUES($1,$2,$3,$4,$5);",[
        lf.id,
        await get_product_id(lf.code),
        lf.qte,
        lf.price,
        id
        ]).then(async()=> await this.quantite_add(lf));

    }

}
const get_list = async(id:any)=>{
    const l:list_fv[]=[]
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from liste_article_ff WHERE facture=$1;",[id]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
   for(const e of data){
l.push({
id:e["id"],
qte:e["quantite"],
price:e["prix"],
name:await getProductDetails(e["product"]),
code:await getProductCode(e["product"]),
tva:await ProductService.getTVAvalue(await getProductTva(e["product"]))
})
   }
   console.log(data);
   return l
}
const get_list_ids = async(id:any)=>{
    const l:string[]=[]
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from liste_article_ff WHERE facture=$1;",[id]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
   for(const e of data){

l.push(e["id"])
   }
   console.log(data);
   return l
}
const getProductDetails= async(id:any)=>{
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from products WHERE id=$1;",[id]);
    const data:Array<any> = JSON.parse(JSON.stringify(res));
    return data.length==1 ? data[0]["name"]:"";

}
const getProductCode= async(id:any)=>{
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from products WHERE id=$1;",[id]);
    const data:Array<any> = JSON.parse(JSON.stringify(res));
    return data.length==1 ? data[0]["reference"]:"";

}
const getProductTva= async(id:any)=>{
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from products WHERE id=$1;",[id]);
    const data:Array<any> = JSON.parse(JSON.stringify(res));
    return data.length==1 ? data[0]["tva"]:"";

}

const get_product_id= async(ref:any)=>{
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from products WHERE reference=$1;",[ref]);
    const data:Array<any> = JSON.parse(JSON.stringify(res));
    return data.length==1 ? data[0]["id"]:"";

}

const get_fournisseur=async(id:any)=>{
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from fournisseurs WHERE id=$1;",[id]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
    return data.length==1?data[0]["name"]:""
}
const get_client_id=async(name:any)=>{
    console.log(name)
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from fournisseurs WHERE name=$1;",[name]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
    return data.length==1?data[0]["id"]:""
}