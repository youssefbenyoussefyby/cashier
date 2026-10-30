import Database from "tauri-plugin-sql-api";
import { infomations, Roles, users } from "./interface";
import {v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

export class SettingsService{

    static async getGenralInfo(){
            const info:infomations={}
            const db = await Database.load("sqlite:cashier.db");
            const res = await db.select("SELECT * FROM info ;");
            const data = JSON.parse(JSON.stringify(res));
            if(data.length==1){
                info.adresse=data[0]["adresse"];
                info.email=data[0]["email"];
                info.name=data[0]["company_name"];
                info.tele=data[0]["tel"];
                info.matr=data[0]["matricule_fiscale"];
            }
            await db.close()
            return info
    }
    static async getUsers(){
        const user:users[]=[]
        try{
            const db = await Database.load("sqlite:cashier.db");
            const res = await db.select("SELECT * FROM users;");
            const data = JSON.parse(JSON.stringify(res));
            for(const e of data){
                const role:string|Roles = e["role"]=="admin"?'admin':JSON.parse(e["role"]);
                user.push({
                    id:e["id"],
                    identifier:e["identifier"],
                    password:"",
                    role:role,
                });

            }
            await db.close();
        }catch(err){
            console.log(err)
        }
           
            return user;
    }
    static async UpdateInfo(info:infomations){
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("UPDATE info SET company_name=$1,email=$2,adresse=$3,tel=$4,matricule_fiscale=$5 WHERE 1",[
            info.name,
            info.email,
            info.adresse,
            info.tele,
            info.matr
        ]);
    }
    static async AddUser(user:users){
        const db= await Database.load("sqlite:cashier.db");
        const password = await bcrypt.hash(user.password?user.password:"",10);
        await db.execute("INSERT INTO users(id,identifier,password,access,role)VALUES($1,$2,$3,$4,$5);",[
            user.id,
            user.identifier,
            password,
            uuid(),
            JSON.stringify(user.role)
        ]);
        await db.close();
    }
    static async DelteUser(user:users){
        const db=await Database.load("sqlite:cashier.db");
        await db.execute("DELETE FROM users WHERE id=$1;",[user.id]);
    }
    static async auth(){
        
    }
    static async setmode(){

    }
}