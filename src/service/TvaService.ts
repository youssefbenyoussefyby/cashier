import Database from "tauri-plugin-sql-api";


export class TvaServices{
    static async get_tva(){
        try {
            let products:string[]=[];
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from TVA;");
       const data:Array<any> = JSON.parse(JSON.stringify(res));
       for(const e of data){
        products.push(e["value"])
       } 
    return products;
     }catch(err){
        throw err;
        
     }

    }
    static async add_tva(name?:number){
        try {
        const db = await Database.load("sqlite:cashier.db");
        const id= createId();
        const res = await db.execute("INSERT INTO TVA (id,value)VALUES($1,$2)",[id,name]);
        if(res) console.log("done")
        return id;
     }catch(err){
        throw err;
        
     }

    }

}
const createId = () => {
    let id = '';
    var chars = '0123456789';
    for ( var i = 0; i < 12; i++ ) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}