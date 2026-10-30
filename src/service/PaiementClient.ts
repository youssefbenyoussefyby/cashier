import Database from "tauri-plugin-sql-api";
import { paiement_client } from "./interface";
import { ClientService } from "./ClientService";

export class PaimentClientServices{

    static async getPaimentes(){
        const paimets:paiement_client[]=[];
            const db = await Database.load("sqlite:cashier.db");
            const res = await db.select("SELECT * from paiement_client;");
            const data = JSON.parse(JSON.stringify(res));
            for(const e of data){
                console.log(e)
                    paimets.push(
                        {
                            client:await ClientService.get_Client(e["client"]),
                            id:e["id"],
                            montan:e["montant"],
                            date:e["date"],
                            titulaire:e["par"]
                        }
                    )
            }

            return paimets;
    }
    static async addPaiments(paiment:paiement_client){
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("INSERT INTO paiement_client (id,montant,date,par,client)VALUES($1,$2,$3,$4,$5)",[
            paiment.id,
            paiment.montan,
            paiment.date,
            paiment.titulaire,
            paiment.client?.id
        ]);

        paiment.client?.debt && paiment.montan ? paiment.client.debt-=paiment.montan:0;
        paiment.client?.debt && paiment.montan ? await ClientService.update_client(paiment.client):0;
    }
    static async deletePaiments(paiment:paiement_client){
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("DELETE FROM paiement_client WHERE id=$1",[paiment.id]);
        paiment.client?.debt && paiment.montan ? paiment.client.debt+=paiment.montan:0;
        paiment.client?.debt && paiment.montan ? await ClientService.update_client(paiment.client):0;
    }
}