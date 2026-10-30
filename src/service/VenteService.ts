import Database from "tauri-plugin-sql-api";
import { list_v, ProductCard, Ventes } from "./interface";
import { ProductService } from "./ProductService";

let idCounter = 0;
/** Unique numeric id: millisecond timestamp + per-session counter (no random collisions). */
export const uid = () => Date.now() * 1000 + (idCounter++ % 1000);

/** Sortable key for "dd/mm/yyyy" dates. */
const dateKey = (d?: string) => {
    const [day, month, year] = (d ?? "").split("/");
    return `${year}${month}${day}`;
};

export class VenteService{
    /** Decrease stock atomically (relative update, never overwrites concurrent changes). */
    static async quantite_remove(product:ProductCard){
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("UPDATE products SET qte=qte-$2 WHERE id=$1;",[product.id, product.quantite]);
    }
    /** Put a sold quantity back into stock. */
    static async quantite_add(product:list_v){
        if(!product.qte) return;
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("UPDATE products SET qte=qte+$2 WHERE id=$1;",[product.product.id, product.qte]);
    }
    /** Sum of the sales made on the given "dd/mm/yyyy" day. */
    static async total_du_jour(date:string):Promise<number>{
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT COALESCE(SUM(montant),0) AS total FROM ventes WHERE date=$1;",[date]);
        const data:Array<any> = JSON.parse(JSON.stringify(res));
        return data[0]?.["total"] ?? 0;
    }
    /** All sales with their lines, newest first. */
    static async get_vente(){
        const ventes:Ventes[] = [];
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * FROM ventes ;");
        const data:Array<any> = JSON.parse(JSON.stringify(res));
        data.sort((a,b)=>dateKey(b["date"]).localeCompare(dateKey(a["date"])) || Number(b["id"])-Number(a["id"]));
        for(const d of data){
            ventes.push({
                id:d["id"],
                ref:"#"+d["ref"],
                montant:d["montant"],
                date:d["date"],
                list:await this.get_list_vente(d["id"])
            })
        }
        return ventes;
    }
    static async add_list_vente(ps:ProductCard,id:any){
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("INSERT INTO LISTE_VENTE (id,product,qte,prix,ticket)VALUES($1,$2,$3,$4,$5);",[
            uid(),
            ps.id,
            ps.quantite,
            ps.prix_v,
            id
        ]);
    }
    static async get_list_vente(id:string){
        const list:list_v[]= []
        const db = await Database.load("sqlite:cashier.db");
        const res = await db.select("SELECT * FROM LISTE_VENTE WHERE ticket=$1;",[id]);
        const data:Array<any> = JSON.parse(JSON.stringify(res));
        for(const d of data){
            const product = await ProductService.getProduct(d["product"]);
            list.push({
                id:d["id"],
                price:d["prix"],
                qte:d["qte"],
                name:product.name,
                code:product.code,
                product:product
            })
        }
        return list;
    }
    static async add_vente(v:Ventes){
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("INSERT INTO ventes(id,ref,montant,date)VALUES($1,$2,$3,$4);",[
            v.id,
            v.ref,
            v.montant,
            v.date
        ]);
    }
    /**
     * Save a sale: ticket, then its lines, then the stock decrement.
     * Steps run one after the other; if one fails, what was already written is undone.
     */
    static async create_sale(v:Ventes, lines:ProductCard[]){
        await this.add_vente(v);
        const decremented:ProductCard[] = [];
        try{
            for(const l of lines){
                await this.add_list_vente(l, v.id);
            }
            for(const l of lines){
                await this.quantite_remove(l);
                decremented.push(l);
            }
        }catch(err){
            for(const l of decremented){
                await this.quantite_add({product:{id:l.id}, qte:l.quantite}).catch(()=>{});
            }
            await this.Delete_vente(v).catch(()=>{});
            throw err;
        }
    }
    static async Delete_vente(v:Ventes){
        const db = await Database.load("sqlite:cashier.db");
        await db.execute("DELETE FROM LISTE_VENTE WHERE ticket=$1",[v.id]);
        await db.execute("DELETE FROM ventes WHERE id=$1",[v.id]);
    }
    /** Cancel a sale: restock every line, then delete the ticket. */
    static async cancel_sale(v:Ventes){
        for(const l of v.list ?? []){
            await this.quantite_add(l);
        }
        await this.Delete_vente(v);
    }
}
