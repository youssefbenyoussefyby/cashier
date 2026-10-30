<script setup lang="ts">

import { ref,onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { ProductService } from '../service/ProductService';
import {  facture, Client, list_fv, Product } from '../service/interface';
import { FactureService } from '../service/FactureServices';
import { ClientService } from '../service/ClientService';
import { useConfirm } from 'primevue/useconfirm';
import { WebviewWindow } from '@tauri-apps/api/window'
onMounted( async () => {
    console.log("mounting...");
    await ClientService.getClients().then(async (data:Client[]) =>{clients.value=data}).catch((err:any)=>console.log(err));
    await FactureService.get_factures().then(async (data:facture[]) =>{factures.value=data;lenp.value=data.length;loading.value=false}).catch((err:any)=>console.log(err));
    await ProductService.getProducts().then( (data:Product[]) =>{data.forEach((ele:any)=>products.value.push(ele.name))});


    while(!await FactureService.verife(getCode())){
        lenp.value+=1;
    }
	
	
    
});
const expandedRows = ref({});
const editingRows = ref([]);
const toast = useToast();
const dt = ref();
const lenp = ref(0);
const factures = ref<facture[]>([]);
const clients = ref<Client[]>([]);
const products = ref<string[]>([]);
const loading = ref(true);
const productDialog = ref(false);
const newDialog = ref(false);
const sureDialog = ref(false);
const payDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref<facture>({list:[]});
const list_fact = ref<list_fv>({})
const selectedProducts = ref();
const marge = ref(0);
const stock = ref(0);


const confirm = useConfirm();

const filters = ref({
    'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
});
console.log(lenp);
const submitted = ref(false);

const formatCurrency = (value:any) => {
    if(value)
        return value.toLocaleString('fr-FR', {style: 'currency', currency: 'TND'});
    return;
};
const openNew = () => {
    product.value = {list:[]};
    submitted.value = false;
    newDialog.value = true;
};
const hideDialog = () => {
    productDialog.value = false;
   if(submitted.value) sureDialog.value=true;
    submitted.value = false;
};
const saveProduct = async() => {

    if (product?.value.numero?.trim() ) {
        if (product.value.id) {
            factures.value[findIndexById(product.value.id)] = product.value;
            await FactureService.update_facture(product.value);
            toast.add({severity:'success', summary: 'Successful', detail: 'Product Updated', life: 5000});
        }
        else {
            product.value.id = createId();
            factures.value?.push(product.value);
            await FactureService.add_facture(product.value).then(async()=>{for(const ele of product.value.list ?? []){await FactureService.add_to_list(ele,product.value.id);}});
            lenp.value++;
            toast.add({severity:'success', summary: 'Successful', detail: 'Product Created', life: 5000});
        }
        submitted.value=false;
        sureDialog.value=false;
    }
};
const changeDate = ()=>{
	product.value.numero = getCode();
}
const editProduct = (prod:any) => {
    product.value = {...prod};
    productDialog.value = true;
};
const confirmDeleteProduct = (prod:any) => {
    product.value = prod;
    deleteProductDialog.value = true;
};
const deleteProduct = async() => {
    factures.value = factures.value?.filter((val:any) => val.id !== product.value.id);
    deleteProductDialog.value = false;
    await FactureService.delete_facture(product.value);
    lenp.value--;
    product.value = {list:[]};
    toast.add({severity:'success', summary: 'Successful', detail: 'Product Deleted', life: 5000});
};
const findIndexById = (id:any) => {
    let index = -1;
    for (let i = 0; i < factures.value?.length; i++) {
        if (factures.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};
const createId = () => {
    let id = '';
    var chars = '0123456789';
    for ( var i = 0; i < 12; i++ ) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}
const exportCSV = ($event: MouseEvent) => {
    $event
    dt.value.exportCSV();
};
const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};
const confiremPayFacture=(prod:any)=>{
    product.value = prod;
    payDialog.value = true;
};


const deleteSelectedProducts = async() => {
    factures.value = factures.value?.filter((val:any) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    for(const val of selectedProducts.value){await FactureService.delete_facture(val);}
    selectedProducts.value = null;
    toast.add({severity:'success', summary: 'Successful', detail: 'Products Deleted', life: 5000});
};
const calac = ()=>{
    product.value.price=0;
    product.value.list.forEach((ele:list_fv)=>product.value.price!=undefined && ele.price && ele.qte? product.value.price+=ele.price*ele.qte:0)
}
const getStatusLabel = (status:any) => {
    switch (status) {
        case '"pi pi-check-square"':
            return 'success';
        case 'pi pi-ban':
            return 'danger';
        default:
            return "contrast";
    }
};
const add_facture=async(name:any)=>{
    product.value.id=createId();
    product.value.numero=getCode();
    product.value.date=formatDate(new Date());
    product.value.client=name;
    product.value.price=0;
    product.value.list=[];
    await FactureService.add_facture(product.value);
    factures.value?.push(product.value);
    productDialog.value=true;
    newDialog.value=false;
    submitted.value=false;
}
const getCode = ()=>{
    let code = "FA";
lenp.value=0;
let d = new Date();
let y = d.getFullYear();
if(product.value.date){
for(let i = 0 ; i< factures.value.length ; i++){
	if(factures.value[i].date?.split("/")[2]==product.value.date?.split("/")[2] && factures.value[i].id != product.value?.id)  lenp.value++;
}
}
else {

for(let i = 0 ; i< factures.value.length ; i++){
	if(factures.value[i].date?.split("/")[2]==y.toString())lenp.value++;
}
}
	

    let n = (lenp.value+1).toString();
    for(let i=0;i<6-n.length;i++){
        code+="0"
    }
    code+=n;
if(product.value.date)
    code += "/"+product.value.date?.split("/")[2];
else code +="/"+y;
    product.value.numero=code;
    return code
}
const formatDate = (value:any) => {
    return value.toLocaleDateString('en-NZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}
const Add_product=async()=>{
    let ok =true;
    product.value.list.forEach((ele:any)=>ele.code==list_fact.value.code?ok=false:0);
    if(ok){
        product.value.list?.push(list_fact.value);
        calac();
        list_fact.value={};
        submitted.value=true;
    }else{
        //productDialog.value=false;
        confirm.require({
        message: 'Article Déja Existe',
        header: 'Danger Zone',
        icon: 'pi pi-info-circle',
        rejectLabel: 'Anuller',
        rejectProps: {
            label: 'Anuller',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Ok',
            severity: 'success'
        },
        accept: () => {     
        productDialog.value=true;
        },
        reject: () => {
        }
    });
    }

}
const set_param=async(event:any)=>{
    if(event){
const code =await ProductService.get_product_code_name(event);
list_fact.value.id=createId();
list_fact.value.code=code;
const p = await ProductService.get_product_price(event);
list_fact.value.price=p;
marge.value = await ProductService.getmarge(event);
stock.value=await ProductService.getEnstock(event);
    }
}
const onRowEditSave = (event:any) => {
    let { newData, index } = event;

    product.value.list[index] = newData;
    calac();
    submitted.value=true;
    };
const deletelist=async (lf:any)=>{
    product.value.list = product.value?.list.filter((val:any) => val.id !== lf.id);
    await FactureService.delete_list_facture(lf);
    calac();
    saveProduct();

}

const print_fact=(id:any)=>{  

    const mainWindow = new WebviewWindow("invoice",{
        url:"invoice.html",
        title:"Facture",
         
    });
    localStorage.setItem('data', JSON.stringify({ key: id }));
    mainWindow?.show();


 }

</script>
<template>
 <div class="card">
    <Toast></Toast>
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Ajouter" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                    <Button label="suprimer" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                </template>
                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                </template>
            </Toolbar>
            <Skeleton v-if="loading" width="100%" height="750px"></Skeleton>
                        <DataTable
            v-if="!loading"
            v-model:expandedRows="expandedRows"
                ref="dt"
                v-model:selection="selectedProducts"
                :value="factures"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                stripedRows
                currentPageReportTemplate=" {first} / {last} > {totalRecords} "
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Factures</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Recherche ..." />
                        </IconField>
                    </div>
                </template>
                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column expander style="width: 5rem" />
                <Column field="numero" header="N°" sortable style="min-width: 12rem">
                </Column>
                <Column field="client" header="Client" sortable style="min-width: 12rem"></Column>
                <Column field="date" header="Date" sortable style="min-width: 10rem"></Column>               
                 <Column field="price" header="Prix Total" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.price) }}
                    </template>
                </Column>
                <Column field="mode_payment" header="Mode De Paiement" sortable style="min-width: 10rem"></Column>
                <Column field="payment" header="Status" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        <Tag :icon="slotProps.data.payment" :severity="getStatusLabel(slotProps.data.payment)" />
                    </template>
                </Column>
                <Column field="reste" header="Reste" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.reste) }}
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" style="display:none;" outlined rounded class="mr-2" severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
                        <Button icon="pi pi-money-bill" outlined rounded class="mr-2" severity="secondary" @click="confiremPayFacture(slotProps.data)" />
			
                        <Button icon="pi pi-print" outlined rounded class="mr-2 mt-2" severity="contrast" @click="print_fact(slotProps.data.id)" />
                    </template>
                </Column>
                <template #expansion="slotProps">
                <div class="p-4">
                    <h5>N° {{ slotProps.data.numero }}</h5>
                    <DataTable :value="slotProps.data.list">
        <Column field="name" header="Nom Article" ></Column>
        <Column field="code" header="Code Article" ></Column>
        <Column field="qte" header="Quantité" ></Column>
        <Column field="price" header="Prix" >
              <template #body="slotProps">
                  {{ formatCurrency(slotProps.data.price) }}
              </template>
        </Column>
                      </DataTable>
                      </div>
                      </template>
            </DataTable>
        </div>
        <Dialog v-model:visible="newDialog" class="flex flex-col" pt:root:class="!border-0 !bg-transparent" pt:mask:class="backdrop-blur-sm" :style="{ width: '70%' }" header="Facture" maximizable :modal="true">

            <div class="row" v-for="p in clients">
        <div class="lcard">
            <h4 class="">{{ p.name }}: <p class="text"> {{ p.ref }} </p></h4>
            <p style="color: red">{{ formatCurrency(p.debt) }}</p>
            <Divider></Divider>
            <Button icon="pi pi-verified" class="mt-2" rounded  @click="add_facture(p.name);"></Button>
        </div>
    </div>
            </Dialog>
            <Dialog :visible="payDialog" pt:root:class="!border-0 " pt:mask:class="backdrop-blur-sm" :style="{ width: '100%' }" header="Facture" maximizable :modal="true">
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-4">
                        <label for="marge" class="block font-bold mb-3">Mode De Paiement</label>
                        <Select v-model="product.mode_payment"  :options="['espèces','chèques','virement']"  placeholder="Mode De Paiement" class="w-full md:w-56" />
                    </div>
                    <div class="col-span-4">
                        <label for="stock" class="block font-bold mb-3">Avance</label>
                        <InputNumber id="marge" v-model="product.avance" mode="currency" :value="product.avance" currency="TND" locale="fr-FR" fluid />
                    </div>
                    <div class="col-span-4">
                        <label for="stock" class="block font-bold mb-3">Paiée</label>
                        <Checkbox id="marge" v-model="product.paiee" :binary="true"  fluid />
                    </div>
                </div>
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">chaufeur</label>
                        <InputText id="price" v-model="product.chaufeur"  fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">Vehicule</label>
                        <InputText id="price1" v-model="product.vehicule" fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">Remise</label>
                        <InputNumber id="remise" v-model="product.remise" :max="99" :min="0" suffix="%" :value="product.remise"  integeronly fluid />
                    </div>
                </div>
                <template #footer>
                <Button label="Quitter" icon="pi pi-times" text @click="payDialog=false" />
                <Button label="Sauvegarder" icon="pi pi-check" @click="saveProduct" />
            </template>
            </Dialog>
        <Dialog v-model:visible="productDialog" :closable="false" pt:root:class="!border-0 !bg-transparent" pt:mask:class="backdrop-blur-sm" :style="{ width: '100%' }" header="Facture" maximizable :modal="true">
            <div class="card gap-8 flex flex-wrap flex-col " >
            <div class="grid grid-cols-12 gap-6">
                <div class="col-span-4">
                    <label for="name" class="block font-bold mb-3">Numéro</label>
                    <InputText id="name" v-model.trim="product.numero" required="true" autofocus :invalid="submitted && !product.numero" disabled fluid />
                    <small v-if="submitted && !product.numero" class="text-red-500">N° est obligatoire.</small>
                </div>
                <div class="col-span-4">
                    <label for="name" class="block font-bold mb-3">Client</label>
                    <InputText id="name" v-model.trim="product.client"  disabled required="true"  autofocus :invalid="submitted && !product.client" fluid />
                    <small v-if="submitted && !product.client" class="text-red-500">Client est obligatoire.</small>
                </div>
                <div class="col-span-4">
                    <label for="name" class="block font-bold mb-3">Date</label>
                    <InputText id="name" v-model.trim="product.date" :value="product.date"  dateFormat="dd/mm/yy" disabled @change="changeDate" placeholder="Date" autofocus  fluid />
                </div>
            </div>
<Toolbar>

    <template #start>
            <h1 class=" font-mono" style="font-size: 20px;">Prix: {{ formatCurrency(product.price) }}</h1>
    </template>
</Toolbar>

              
                <DataTable :value="product.list" showGridlines  tableStyle="min-width: 50rem" 
                :pt="{
                table: { style: 'min-width: 50rem' },
                column: {
                    bodycell: ({ state }:any) => ({
                        style:  state['d_editing']&&'padding-top: 0.75rem; padding-bottom: 0.75rem'
                    })
                }
            }"
            editMode="row"
               v-model:editingRows="editingRows"
               
               @row-edit-save="onRowEditSave"
               >
    <Column field="code" header="Code"></Column>
    <Column field="name" header="Nom"></Column>
    <Column field="price" header="Prix">
        <template #editor="{ data, field }">
            <InputNumber id="marge" mode="currency"currency="TND" locale="fr-FR" v-model="data[field]" :binary="true"  fluid />
                </template>
                <template #body="slotProps">
                  {{ formatCurrency(slotProps.data.price) }}
              </template>
    </Column>

    <Column field="qte" header="Quantité">
        <template #editor="{ data, field }">
            <InputNumber id="marge" v-model="data[field]"   fluid />
            </template>
    
    </Column>
    <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
    <Column style="width: 10%; min-width: 8rem" bodyStyle="text-align:center">
    <template #body="slotProps">
        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deletelist(slotProps.data)" />
        </template>
    </Column>
</DataTable>
<div class="grid grid-cols-12 gap-4">
                    <div class="col-span-4">
                        <label for="marge" class="block font-bold mb-3">Article</label>
                        <Select v-model="list_fact.name" @update:model-value="set_param" :options="products"  filter placeholder="Article" class="w-full md:w-56" />
                    </div>
                    <div class="col-span-4">
                        <label for="stock" class="block font-bold mb-3">Quantité</label>
                        <InputNumber id="marge" v-model="list_fact.qte" :minFractionDigits="3" :maxFractionDigits="3"   fluid />
                    </div>
                    <div class="col-span-4">
                        <label for="stock" class="block font-bold mb-3">Prix</label>
                        <InputNumber id="marge" mode="currency"currency="TND" locale="fr-FR" v-model="list_fact.price" :binary="true"  fluid />
                    </div>
                </div>
            </div>
            <Toolbar>

<template #start>
        <h1>Marge: {{ formatCurrency(marge) }}</h1>
       

</template>
<template #end>

    <h1>Quantité: {{ stock }}</h1>
</template>
</Toolbar>
                <Toolbar>
                    <template #start>
                        <Button label="Ajouter" security="success" icon="pi pi-check" @click="Add_product" />
                    </template>
                </Toolbar>
            <template #footer>
                <Button label="Quitter" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Sauvegarder" icon="pi pi-check" @click="saveProduct" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product"
                    >Etes-vous sûr que vous voulez supprimer?<b style="color: #f2c8cf;"> {{ product.numero }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="non" icon="pi pi-times" text @click="deleteProductDialog = false" />
                <Button label="oui" icon="pi pi-check" @click="deleteProduct" />
            </template>
        </Dialog>
        <Dialog v-model:visible="sureDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product"
                    >Etes-vous sûr que vous voulez Quitter sans Sauvegarder?<b style="color: #f2c8cf;"> N°{{ product.numero }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="non" icon="pi pi-times" text @click="sureDialog = false;" />
                <Button label="oui" icon="pi pi-check" @click="saveProduct" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product">Etes-vous sûr de vouloir supprimer les Factures sélectionnés?</span>
            </div>
            <template #footer>
                <Button label="non" icon="pi pi-times" text @click="deleteProductsDialog = false" />
                <Button label="oui" icon="pi pi-check" text @click="deleteSelectedProducts" />
            </template>
        </Dialog>


</template>


<style lang="css">


</style>