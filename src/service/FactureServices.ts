import Database from "tauri-plugin-sql-api";
import { facture, list_fv } from "./interface";
import { ProductService } from "./ProductService";



export class FactureService{
    static async verife(code:any){
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from facture WHERE number=$1;",[code]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
return data.length==0;
    }
    static async get_factures(){
const factures:facture[] = []
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from facture;");
   const data:Array<any> = JSON.parse(JSON.stringify(res));
   for(const e of data){
    const client =await get_client(e["client"]);
    const p = e["payment"]? "pi pi-check-square":"pi pi-ban";
    const r = e["payment"]? 0:e["price"]-e["avance"];

    factures.push({
id:e["id"],
numero:e["number"],
price:e["price"],
date:e["date"],
chaufeur:e["chauffeur"],
vehicule:e["vehicule"],
client:client,
payment:p,
mode_payment:e["mode_payment"],
avance:e["avance"],
rest:r,
paiee:e["payment"],
remise:e["remise"],
list:await get_list(e["id"])
    })
   }
return factures;
    }

    static async get_facture(id:any){
        let factures:facture={list:[]} ;
                const db = await Database.load("sqlite:cashier.db");
                const res = await db.select("SELECT * from facture WHERE id=$1;",[id]);
           const data:Array<any> = JSON.parse(JSON.stringify(res));
            const e = data[0];
            const client =await get_client(e["client"]);
            const p = e["payment"]? "pi pi-check-square":"pi pi-ban";
            const r = e["payment"]? 0:e["price"]-e["avance"];
            factures={
        id:e["id"],
        numero:e["number"],
        price:e["price"],
        date:e["date"],
        chaufeur:e["chauffeur"],
        vehicule:e["vehicule"],
        client:client,
        payment:p,
        mode_payment:e["mode_payment"],
        avance:e["avance"],
        rest:r,
        paiee:e["payment"],
        remise:e["remise"],
        list:await get_list(e["id"])
            }
           
        return factures ;
            }


    static async update_facture(f:facture){
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("UPDATE facture SET price=$1,chaufeur=$2,vehicule=$3,mode_payment=$4,payment=$5,avance=$6,client=$7,remise=$9,date=$10,number=$11 WHERE id=$8;",[
f.price,
f.chaufeur,
f.vehicule,
f.mode_payment,
f.paiee,
f.avance,
await get_client_id(f.client),
f.id,
f.remise,
f.date,
f.numero
        ]).then(async()=>f.list?.forEach(async(lf:any)=>( get_list_ids(f.id)).then((data:any)=>data.includes(lf.id)? this.update_list_facture(lf):this.add_to_list(lf,f.id))));

    }
    static async update_list_facture(lf:list_fv){
        const db = await Database.load("sqlite:cashier.db");
await db.execute("UPDATE liste_article_f SET quantite=$1,prix=$2 WHERE id=$3",[
    lf.qte,
    lf.price,
    lf.id
])

    }
    static async delete_list_facture(lf:list_fv){
        const db = await Database.load("sqlite:cashier.db");
await db.execute("DELETE FROM liste_article_f WHERE id=$1",[
    lf.id
])

    }
    static async delete_facture(f:facture){
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("DELETE FROM facture WHERE id=$1",[
            f.id
        ])
    }

    static async add_facture(f:facture){
        const db = await Database.load("sqlite:cashier.db");
await db.execute("INSERT INTO facture (id,number,price,date,chaufeur,vehicule,mode_payment,payment,avance,client)VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);",[
f.id,
f.numero,
f.price,
f.date,
f.chaufeur,
f.vehicule,
'espèces',
f.paiee,
f.avance,
await get_client_id(f.client)
])
    }

    static async add_to_list(lf:list_fv,id:any){
        console.log(lf);
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("INSERT INTO liste_article_f (id,product,quantite,prix,facture)VALUES($1,$2,$3,$4,$5);",[
        lf.id,
        await get_product_id(lf.code),
        lf.qte,
        lf.price,
        id
        ])

    }

}
const get_list = async(id:any)=>{
    const l:list_fv[]=[]
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from liste_article_f WHERE facture=$1;",[id]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
   for(const e of data){
l.push({
id:e["id"],
qte:e["quantite"],
price:e["prix"],
name:await getProductDetails(e["product"]),
code:await getProductCode(e["product"]),
tva:await ProductService.getTVAvalue(await getProductTva(e["product"])),
loi_47_2023:await getProductLoi(e["product"])
})
   }
   console.log(data);
   return l
}
const get_list_ids = async(id:any)=>{
    const l:string[]=[]
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from liste_article_f WHERE facture=$1;",[id]);
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
const getProductLoi= async(id:any)=>{
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from products WHERE id=$1;",[id]);
    const data:Array<any> = JSON.parse(JSON.stringify(res));
    return data.length==1 ? data[0]["loi_47_2023"]:"";

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

const get_client=async(id:any)=>{
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from clients WHERE id=$1;",[id]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
    return data.length==1?data[0]["name"]:""
}
const get_client_id=async(name:any)=>{
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from clients WHERE name=$1;",[name]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
    return data.length==1?data[0]["id"]:""
}