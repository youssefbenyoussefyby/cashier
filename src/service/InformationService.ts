import Database from "tauri-plugin-sql-api";
import { infomations } from "./interface";


export class InfomationService{

    static async get(){
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * from info ;");
   const data:Array<any> = JSON.parse(JSON.stringify(res));
        const d:infomations={
            name:data[0]["company_name"],
            matr:data[0]["matricule_fiscale"],
            email:data[0]["email"],
            adresse:data[0]["adresse"],
            tele:data[0]["tel"]
        }
return d
    }
}