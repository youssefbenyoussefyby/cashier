import Database from "tauri-plugin-sql-api";
import { bl, bl_draft, list_fv, Product } from "./interface";
import { ProductService } from "./ProductService";
import { ClientService } from "./ClientService";



export class blService{
    static async verifeid(id:any){
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from liste_article_b WHERE id=$1;",[id]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
return data.length==0;
    }
    static async quantite_update_remove(oldlis:list_fv,newlist:list_fv){
            const newv = newlist.qte? newlist.qte:0;
            const upp = oldlis.product;
            const old = oldlis.qte? oldlis.qte:0;
            if(upp){
                if(upp.quantite){
                    upp.quantite+=old;
                    upp.quantite-=newv;
                }
                    const db1 = await Database.load("sqlite:cashier.db");
                    await db1.execute("UPDATE products SET qte=$2 WHERE id= $1 ;",[
            upp.id,
            upp.quantite
                    ]);
            }   
    }
    static async quantite_remove(product:list_fv){
        const upp = product.product;
        if(upp){
            if(upp.quantite && product.qte){
                upp.quantite-=product.qte;
            }
            const db1 = await Database.load("sqlite:cashier.db");
            await db1.execute("UPDATE products SET qte=$2 WHERE id= $1 ;",[
    upp.id,
    upp.quantite
            ]);

        }
    }
    static async quantite_add(product:list_fv){

        const newv = product.qte? product.qte:0;
        const db1 = await Database.load("sqlite:cashier.db");
        const res1 = await db1.select("SELECT * from products WHERE reference=$1;",[product.code]);
       const data1:Array<any> = JSON.parse(JSON.stringify(res1));
       const e = data1[0];
       const upp:Product = {
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
        tva:0
    }
        if(upp.quantite){
            upp.quantite+=newv;
        }
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("UPDATE products SET qte=$2 WHERE id= $1 ;",[
upp.id,
upp.quantite
        ]);

    }
    static async getDrafts(){
        const bls:bl_draft[] = []
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from bl_draft;");
   const data:Array<any> = JSON.parse(JSON.stringify(res));
   console.log(data)
   for(const e of data){
    bls.push({
id:e["id"],
name:e["name"],
list:await get_draft_list(e["id"]),
price:e["price"]
    })
   }
return bls;

    }
    static async verife(code:any){
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from bl WHERE number=$1;",[code]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
return data.length==0;
    }
    static async get_bls(){
const bls:bl[] = []
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from bl;");
   const data:Array<any> = JSON.parse(JSON.stringify(res));
   for(const e of data){
    const client =await ClientService.getClient(e["client"]);
    const p = e["payment"]? "pi pi-check-square":"pi pi-ban";
    const r = e["payment"]? 0:e["price"]-e["avance"];

    bls.push({
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
return bls;
    }

    static async get_bl(id:any){
        let bls:bl={list:[],client:{}} ;
                const db = await Database.load("sqlite:cashier.db");
                const res = await db.select("SELECT * from bl WHERE id=$1;",[id]);
           const data:Array<any> = JSON.parse(JSON.stringify(res));
            const e = data[0];
            const client =await ClientService.getClient(e["client"]);
            const p = e["payment"]? "pi pi-check-square":"pi pi-ban";
            const r = e["payment"]? 0:e["price"]-e["avance"];
            bls={
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
           
        return bls ;
            }


    static async update_bl(f:bl){
        try{
            const db = await Database.load("sqlite:cashier.db");
             await db.execute("UPDATE bl SET price=$1,chaufeur=$2,vehicule=$3,mode_payment=$4,payment=$5,avance=$6,client=$7,remise=$9 WHERE id=$8;",[
     f.price,
     f.chaufeur,
     f.vehicule,
     f.mode_payment,
     f.paiee,
     f.avance,
   f.client.id,
     f.id,
     f.remise
             ]);
             const bls = await get_list_ids(f.id);
             f.list?.forEach(async (lf:any)=>bls.includes(lf.id)? await this.update_list_bl(lf):await this.add_to_list(lf,f.id));
        }catch(err){
            console.log(err);
        }
       

    }
    static async update_list_bl(lf:list_fv){
        const db = await Database.load("sqlite:cashier.db");        
await db.execute("UPDATE liste_article_b SET quantite=$1,prix=$2 WHERE id=$3",[
    lf.qte,
    lf.price,
    lf.id
]);

    }
    static async delete_list_bl(lf:list_fv){
        const db = await Database.load("sqlite:cashier.db");
await db.execute("DELETE FROM liste_article_b WHERE id=$1",[
    lf.id
])

    }
    static async delete_bl(f:bl){
        try{
            const db = await Database.load("sqlite:cashier.db");
            await db.execute("DELETE FROM bl WHERE id=$1;",[
                f.id
            ]);
        }catch(err){console.log(err)}
        

    }
    static async clear(f:bl_draft){
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("DELETE FROM bl_draft WHERE id=$1;",[f.id]);
    }
    static async add_bl_draft(f:bl,name:string){
        console.log(name)
        const db = await Database.load("sqlite:cashier.db");
await db.execute("INSERT INTO bl_draft (id,name,date,chaufeur,vehicule,mode_payment,payment,avance,client)VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9);",[
f.id,
name,
f.date,
f.chaufeur,
f.vehicule,
'espèces',
f.paiee,
f.avance,
f.client.id
]).then(()=>f.list.forEach((ele:any)=>this.add_to_draft_list(ele,f.id)));

    }
    static async add_bl(f:bl){
        const db = await Database.load("sqlite:cashier.db");
await db.execute("INSERT INTO bl (id,number,price,date,chaufeur,vehicule,mode_payment,payment,avance,client)VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);",[
f.id,
f.numero,
f.price,
f.date,
f.chaufeur,
f.vehicule,
'espèces',
f.paiee,
f.avance,
f.client.id
]);
    }
    static async add_to_draft_list(lf:list_fv,id:any){
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("INSERT INTO liste_article_b_draft (id,product,quantite,prix,bl)VALUES($1,$2,$3,$4,$5);",[
        lf.id,
        lf.product?.id,
        lf.qte,
        lf.price,
        id
        ]);

    }
    static async import_draft(id:any,bl:any){
        const l:list_fv[]=[]
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from liste_article_b_draft WHERE bl=$1;",[id]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
   for(const e of data){
this.add_to_list({
id:createId(),
qte:e["quantite"],
price:e["prix"],
name:await getProductDetails(e["product"]),
code:await getProductCode(e["product"]),
tva:await ProductService.getTVAvalue(await getProductTva(e["product"]))
},bl.id);
   }
await this.update_bl(bl);

   console.log(data);
   return l
}
    
    static async add_to_list(lf:list_fv,id:any){
        const db = await Database.load("sqlite:cashier.db");
        while(!this.verifeid(lf.id)){
            lf.id=createId()
        }
        await db.execute("INSERT INTO liste_article_b (id,product,quantite,prix,bl)VALUES($1,$2,$3,$4,$5);",[
        lf.id,
        lf.product?.id,
        lf.qte,
        lf.price,
        id
        ])
    }

}
const get_list = async(id:any)=>{
    const l:list_fv[]=[]
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from liste_article_b WHERE bl=$1;",[id]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
   for(const e of data){
    const prod = await ProductService.getProduct(e["product"]);
l.push({
id:e["id"],
qte:e["quantite"],
price:e["prix"],
name:prod.name,
code:prod.code,
tva:await ProductService.getTVAvalue(prod.tva),
product:prod,
loi_47_2023:await getProductLoi(e["product"])
})
   }
   console.log(data);
   return l
}
const get_draft_list = async(id:any)=>{
    const l:list_fv[]=[]
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from liste_article_b_draft WHERE bl=$1;",[id]);
   const data:Array<any> = JSON.parse(JSON.stringify(res));
   for(const e of data){
    const prod = await ProductService.getProduct(e["product"]);
    l.push({
    id:e["id"],
    qte:e["quantite"],
    price:e["prix"],
    name:prod.name,
    code:prod.code,
    tva:await ProductService.getTVAvalue(prod.tva),
    product:prod
    })
   }
   console.log(data);
   return l
}
const get_list_ids = async(id:any)=>{
    const l:string[]=[]
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from liste_article_b WHERE bl=$1;",[id]);
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
const getProductLoi= async(id:any)=>{
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from products WHERE id=$1;",[id]);
    const data:Array<any> = JSON.parse(JSON.stringify(res));
    return data.length==1 ? data[0]["loi_47_2023"]:"";

}
const getProductTva= async(id:any)=>{
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * from products WHERE id=$1;",[id]);
    const data:Array<any> = JSON.parse(JSON.stringify(res));
    return data.length==1 ? data[0]["tva"]:"";

}
const createId = () => {
    let id = '';
    var chars = '0123456789';
    for ( var i = 0; i < 12; i++ ) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}