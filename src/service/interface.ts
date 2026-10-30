
export interface users{
    id?:string,
    identifier?:string,
    password?:string,
    role?:Roles|string,

}
export interface Roles{
    ReadStock:boolean,
    WriteStock:boolean,
    ReadVentes:boolean,
    WriteVentes:boolean,
    ReadFacture:boolean,
    WriteFacture:boolean,
    ReadBl:boolean,
    WriteBl:boolean,
    ReadFfo:boolean,
    WriteFfo:boolean,
    ReadClients:boolean,
    WriteClients:boolean,
    ReadFo:boolean,
    WriteFo:boolean,
    
}
export interface Product{
    name?:string,
    prix_a?:number,
    prix_v?:number,
    id?:string,
    inventoryStatus?:string,
    code?:string,
    category?:string,
    quantite?:number,
    negotiation?:number,
    stock?:number,
    tva?:number,
    barcode?:string,
    loi_47_2023?:number
}
export interface ProductCard{
    name?:string,
    actual_price?:number
    prix_v?:number,
    id?:string,
    code?:string,
    category?:string,
    quantite:number,
    in_stock:number,
    negotiation?:number,
    barcode?:string,
    prix_a?:number,
    inventoryStatus?:string,
    }
export interface Client{
    name?:string
    id?:string,
    ref?:string,
    tele?:string,
    email?:string,
    matr?:string,
    address?:string,
    debt?:number
    res?:string
}
export interface Fournisseur{
    name?:string
    id?:string,
    ref?:string,
    tele?:string,
    email?:string,
    matr?:string,
    address?:string,
    debt?:number
    res?:string
}

export interface Category{
    name:string,
    content?:number,
    color?:string
}
export interface Ventes{
    id?:string,
    ref?:string,
    montant?:number,
    date?:string,
    list?:list_v[]
}

export interface list_v{
    id?:string,
    qte?:number,
    price?:number,
    name?:string,
    code?:string,
    product:Product
}
export interface list_fv{

    id?:string,
    qte?:number,
    price?:number,
    name?:string,
    code?:string,
    tva?:number,
    loi_47_2023?:number,
    product?:Product

}
export interface linechart{
    label: string, value: number, color: string
}
export interface facture{
    id?:string,
    numero?:string,
    client?:string,
    date?:string,
    payment?:string,
    paiee?:boolean,
    mode_payment?:string,
    chaufeur?:string,
    vehicule?:string,
    avance?:number,
    price?:number,
    rest?:number,
    remise?:number,
    list:list_fv[]
}
export interface facture_fornisseur{

    id?:string,
    numero?:string,
    fournisseur?:string,
    date?:string,
    payment?:string,
    paiee?:boolean,
    mode_payment?:string,
    chaufeur?:string,
    vehicule?:string,
    avance?:number,
    price?:number,
    rest?:number,
    list:list_fv[]
}
export interface infomations{
    name?:string,
    matr?:string,
    adresse?:string,
    email?:string,
    tele?:string
}
export interface bl{

    id?:string,
    numero?:string,
    client:Client,
    date?:string,
    payment?:string,
    paiee?:boolean,
    mode_payment?:string,
    chaufeur?:string,
    vehicule?:string,
    avance?:number,
    price?:number,
    rest?:number,
    remise?:number,
    list:list_fv[]
}
export interface bl_draft{

    id?:string,
    name?:string,
    price:number,
    list:list_fv[]
}
export interface paiement_client{
    id?:string,
    client?:Client,
    titulaire?:string,
    montan?:number,
    date?:string,
}
export interface paiement_fournisseur{
    id?:string,
    fournisseur?:Fournisseur,
    titulaire?:string,
    montan?:number,
    date?:string,
}

export interface Charge {
    id?: string;
    description?: string;
    type?: 'fixed' | 'variable';
    value?: number;
    date?: string;
    period?:number;
  }
