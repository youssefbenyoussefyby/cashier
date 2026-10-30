import Database from "tauri-plugin-sql-api";
import {  paiement_fournisseur } from "./interface";
import { FournisseurService } from "./FournisseurService";

export class PaimentFournisseurServices{

    static async getPaimentes(){
        const paimets:paiement_fournisseur[]=[];
            const db = await Database.load("sqlite:cashier.db");
            const res = await db.select("SELECT * from paiement_fournisseur;");
            const data = JSON.parse(JSON.stringify(res));
            for(const e of data){
                    paimets.push(
                        {
                            fournisseur:await FournisseurService.get_Fournisseur(e["fournisseur"]),
                            id:e["id"],
                            montan:e["montant"],
                            date:e["date"],
                            titulaire:e["par"]
                        }
                    )
            }

            return paimets;
    }
    static async addPaiments(paiment:paiement_fournisseur){
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("INSERT INTO paiement_fournisseur (id,montant,date,par,fournisseur)VALUES($1,$2,$3,$4,$5)",[
            paiment.id,
            paiment.montan,
            paiment.date,
            paiment.titulaire,
            paiment.fournisseur?.id
        ]);

        paiment.fournisseur?.debt && paiment.montan ? paiment.fournisseur.debt-=paiment.montan:0;
        paiment.fournisseur?.debt && paiment.montan ? await FournisseurService.update_client(paiment.fournisseur):0;
    }
    static async deletePaiments(paiment:paiement_fournisseur){
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("DELETE FROM paiement_fournisseur WHERE id=$1",[paiment.id]);
        paiment.fournisseur?.debt && paiment.montan ? paiment.fournisseur.debt+=paiment.montan:0;
        paiment.fournisseur?.debt && paiment.montan ? await FournisseurService.update_client(paiment.fournisseur):0;
    }
}