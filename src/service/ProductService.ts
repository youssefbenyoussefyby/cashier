
import Database from "tauri-plugin-sql-api";
import {  Product, ProductCard } from "./interface";
import { CategoryServices } from "./CategoryService";
import { TvaServices } from "./TvaService";


export class ProductService{
    static async getProductbyref(id:any) {
        let products:Product={};
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from products WHERE reference=$1;",[id]);
       const data:Array<any> = JSON.parse(JSON.stringify(res));
       const e = data[0];
       const p:Product = {
        name:e["name"],
        code:e["reference"],
        prix_a:e["prix_achat"],
        prix_v:e["prix_vente"],
        id:e["id"],
        category:"",
        inventoryStatus:"",
        quantite:e["qte"],
        stock:e["Stock_sec"],
        negotiation:e["marge_de_negotiation"],
        tva:0,
        loi_47_2023:e["loi_47_2023"]
    }
    products=p;
         
    return products;
    
   
    }
    static async getProduct(id:any) {
        let products:Product={};
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from products WHERE id=$1;",[id]);
       const data:Array<any> = JSON.parse(JSON.stringify(res));
       const e = data[0];
       const p:Product = {
        name:e["name"],
        code:e["reference"],
        prix_a:e["prix_achat"],
        prix_v:e["prix_vente"],
        id:e["id"],
        category:"",
        inventoryStatus:"",
        quantite:e["qte"],
        stock:e["Stock_sec"],
        negotiation:e["marge_de_negotiation"],
        tva:0,
        loi_47_2023:e["loi_47_2023"]
    }
    products=p;    
    return products;
    }


    static async verife(code:any){
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from products WHERE reference=$1;",[code]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
return data.length==0;
    }
  static async get_product_code_name(name:any){
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from products WHERE name=$1;",[name]);
        const data:Array<any> = JSON.parse(JSON.stringify(res));
        return data.length==1 ? data[0]["reference"]:"";
    }
    static async get_product_price(name:any){
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from products WHERE name=$1;",[name]);
        const data:Array<any> = JSON.parse(JSON.stringify(res));
        return data.length==1 ? data[0]["prix_vente"]:"";
    }
    static async getmarge(name:any){
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from products WHERE name=$1;",[name]);
        const data:Array<any> = JSON.parse(JSON.stringify(res));
        return data.length==1 ? data[0]["marge_de_negotiation"]:0;
    }
    static async getEnstock(name:any){
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from products WHERE name=$1;",[name]);
        const data:Array<any> = JSON.parse(JSON.stringify(res));
        return data.length==1 ? data[0]["qte"]:0;
    }
    
 static async getProducts() {
    try {
        let products:Product[]=[];
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from products;");
   const data:Array<any> = JSON.parse(JSON.stringify(res));
   for(const e of data){
    await format(e,products)
   }
     
return products;

 }catch(err){
    throw err;
    
 }

}
static async getProducts_card() {
    try {
        let products:ProductCard[]=[];
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from products;");
   const data:Array<any> = JSON.parse(JSON.stringify(res));
   for(const e of data){
    await formatcard(e,products)
   }
     
return products;

 }catch(err){
    throw err;
    
 }

}

static async update_product(p:Product){
    try{
        let tvaid = await this.getTVAid(p.tva);
        if(tvaid==0){
            tvaid = await TvaServices.add_tva(p.tva);
        }
        let cid = await getCategoryid(p.category);
        if(cid==0){
            cid = await CategoryServices.add_category(p.category);
                    }
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("UPDATE products SET barcode=$2,name=$3,prix_achat=$4,prix_vente=$5,Stock_sec=$6,qte=$7,marge_de_negotiation=$8,tva=$9,category=$10,loi_47_2023=$11 WHERE id= $1 ;",[
            p.id,
            p.barcode,
            p.name,
            p.prix_a,
            p.prix_v,
            p.stock,
            p.quantite,
            p.negotiation,
            tvaid,cid,p.loi_47_2023
        ]);
    }catch(err){
        console.log(err)
    }

}
static async getTVA(tva?:string) {
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from TVA WHERE id=$1;",[tva]);
   const data = JSON.parse(JSON.stringify(res));
   const r=data.length==1 ? data[0]["value"]? data[0]["value"]:0:0;
   return r;
}
static async create_product(p:Product){
    try{
        if(p.category==null)p.category="";
        if(p.tva==null )p.tva=0;
        let cid = await getCategoryid(p.category);
        let tvaid = await this.getTVAid(p.tva);
        if(cid==0){
cid = await CategoryServices.add_category(p.category);
        }

        if(tvaid==0){
            tvaid = await TvaServices.add_tva(p.tva);
        }
        const db = await Database.load("sqlite:cashier.db");
 await db.execute("INSERT INTO products(id,reference,barcode,name,prix_achat,prix_vente,Stock_sec,qte,marge_de_negotiation,category,tva,loi_47_2023)VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12);",[
            p.id,
            p.code,
            p.barcode,
            p.name,
            p.prix_a,
            p.prix_v,
            p.stock,
            p.quantite,
            p.negotiation,
            cid,
            tvaid,
            p.loi_47_2023
        ]);
    }catch(err){
        throw err;
    }
}
static async delete_product(p:Product){
    try{
        const db = await Database.load("sqlite:cashier.db");
    await db.execute("DELETE FROM products WHERE id=$1",[
            p.id
        ]);
    }catch(err){
        throw err;
    }
    
}
static async getTVAid(tva?:number) {
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from TVA WHERE value=$1;",[tva]);
   const data = JSON.parse(JSON.stringify(res));
   return data.length==1 ? data[0]["id"]:0;
}
static async getTVAvalue(tva?:number) {
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from TVA WHERE id=$1;",[tva]);
   const data = JSON.parse(JSON.stringify(res));
   return data.length==1 ? data[0]["value"]:0;
}
}

async function format(e:any,products:Product[]) {
    const cat = await getCategory(e["category"]);
    const status = e["qte"]==0? "Repture": e["qte"]<e["Stock_sec"]? "Stock faible":"En Stock";
    const tva = await ProductService.getTVA(e["tva"]);
    const p:Product = {
        name:e["name"],
        code:e["reference"],
        prix_a:e["prix_achat"],
        prix_v:e["prix_vente"],
        id:e["id"],
        category:cat,
        inventoryStatus:status,
        quantite:e["qte"],
        stock:e["Stock_sec"],
        barcode:e["barcode"],
        negotiation:e["marge_de_negotiation"],
        tva:tva,
        loi_47_2023:e["loi_47_2023"]

        
    }
     products.push(p);

}
async function formatcard(e:any,products:ProductCard[]) {
    const cat = await getCategory(e["category"]);
    const status = e["qte"]==0? "Repture": e["qte"]<e["Stock_sec"]? "Stock faible":"En Stock";
    const p:ProductCard = {
        name:e["name"],
        code:e["reference"],
        prix_v:e["prix_vente"],
        id:e["id"],
        category:cat,
        quantite:0,
        barcode:e["barcode"],
        negotiation:e["marge_de_negotiation"],
        inventoryStatus:status,
        actual_price:e["prix_vente"],
        in_stock:e["qte"],
        prix_a:e["prix_achat"]

    }
     products.push(p);

}
async function getCategory(cat:number) {
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from category WHERE id=$1;",[cat]);
   const data = JSON.parse(JSON.stringify(res));
   return data.length==1 ? data[0]["name"]:"Tous";
}
async function getCategoryid(cat?:string) {
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from category WHERE name Like $1;",[cat]);
   const data = JSON.parse(JSON.stringify(res));
   return data.length==1 ? data[0]["id"]:0;
}




