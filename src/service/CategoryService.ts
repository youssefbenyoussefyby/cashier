import Database from "tauri-plugin-sql-api";
import { Category } from "./interface";
export class CategoryServices{


    static async get_category(){
        try {
            let products:string[]=[];
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from category;");
       const data:Array<any> = JSON.parse(JSON.stringify(res));
       for(const e of data){
       
            products.push(e["name"])
        
       } 
    return products;
    
     }catch(err){
        throw err;
        
     }
    }
    static async get_category_card(){
        try {
            let products:Category[]=[];
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from category;");
       const data:Array<any> = JSON.parse(JSON.stringify(res));
       for(const e of data){
        if(e["name"]){
            if(await get_cnumber(e["id"])!=0){
                products.push({name:e["name"],content:await get_cnumber(e["id"])})

            }

        }
       } 
    return products;
    
     }catch(err){
        throw err;
        
     }
    }
    static async add_category(name?:string){
        try {
        const db = await Database.load("sqlite:cashier.db");
        const id= createId();
        const res = await db.execute("INSERT INTO category (id,name)VALUES($1,$2)",[id,name]);
        res;
        return id;
     }catch(err){
        throw err;
        
     }

    }
}
const get_cnumber=async(cat:string)=>{
    const db = await Database.load("sqlite:cashier.db");
const res = await db.select("SELECT count(*) as c FROM products WHERE category Like $1;",[cat]);
const data:Array<any> = JSON.parse(JSON.stringify(res));
return data.length==1 ?data[0]["c"]:0;
}
const createId = () => {
    let id = '';
    var chars = '0123456789';
    for ( var i = 0; i < 12; i++ ) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}