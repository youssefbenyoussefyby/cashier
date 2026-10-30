<script setup lang="ts">
import { ref,onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import {   Client, paiement_client } from '../service/interface';
import { ClientService } from '../service/ClientService';
import { PaimentClientServices } from '../service/PaiementClient';
onMounted( async () => {
    console.log("mounting...");
    await ClientService.getClients().then(async (data:Client[]) =>{clients.value=data}).catch((err:any)=>console.log(err));
    await PaimentClientServices.getPaimentes().then(async (data:paiement_client[]) =>{factures.value=data;lenp.value=data.length;loading.value=false}).catch((err:any)=>console.log(err));
    
});
const expandedRows = ref({});
const toast = useToast();
const dt = ref();
const lenp = ref(0);
const factures = ref<paiement_client[]>([]);
const clients = ref<Client[]>([]);
const loading = ref(true);
const productDialog = ref(false);
const newDialog = ref(false);
const sureDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref<paiement_client>({});
const selectedProducts = ref();

const filters = ref({
    'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
});
console.log(lenp);
const submitted = ref(false);

const formatCurrency = (value:any) => {
    if(value)
        return value.toLocaleString('en-US', {style: 'currency', currency: 'TND'});
    return;
};
const openNew = () => {
    product.value = {};
    submitted.value = false;
    newDialog.value = true;
};
const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};
const saveProduct = async() => {

    if (product?.value.id?.trim() ) {
            factures.value?.push(product.value);
            await PaimentClientServices.addPaiments(product.value);
            toast.add({severity:'success', summary: 'Successful', detail: 'Paiment Ajouté', life: 5000});
        submitted.value=false;
        productDialog.value=false;
    }
};
const confirmDeleteProduct = (prod:any) => {
    product.value = prod;
    deleteProductDialog.value = true;
};
const deleteProduct = async() => {
    factures.value = factures.value?.filter((val:any) => val.id !== product.value.id);
    deleteProductDialog.value = false;
    await PaimentClientServices.deletePaiments(product.value);
    product.value = {};
    toast.add({severity:'success', summary: 'Successful', detail: 'Product Deleted', life: 5000});
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

const deleteSelectedProducts = async() => {
    factures.value = factures.value?.filter((val:any) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    for(const val of selectedProducts.value){await PaimentClientServices.deletePaiments(val);}
    selectedProducts.value = null;
    toast.add({severity:'success', summary: 'Successful', detail: 'Paiments Suprimée', life: 5000});
};

const add_paiment=(p:any)=>{
    product.value.client=p;
    product.value.id=createId();
    product.value.titulaire=p.res;
    product.value.date=formatDate(new Date())
    newDialog.value=false;
    productDialog.value=true;
}

const formatDate = (value:any) => {
    return value.toLocaleDateString('en-NZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
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
                        <h4 class="m-0">Paiments</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Recherche ..." />
                        </IconField>
                    </div>
                </template>
                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="client" header="Client" sortable style="min-width: 12rem">
                <template #body="slotProps">

                    {{ slotProps.data.client.name }}
                </template>
                </Column>
                <Column field="date" header="Date" sortable style="min-width: 10rem"></Column>   
                <Column field="titulaire" header="Titulaire" sortable style="min-width: 10rem"></Column>               

                 <Column field="montan" header="Montant" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.montan) }}
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-trash" outlined rounded class="mr-2" severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
                    </template>
                </Column>
                
            </DataTable>
        </div>
        <Dialog v-model:visible="newDialog" class="flex flex-col" pt:root:class="!border-0 !bg-transparent" pt:mask:class="backdrop-blur-sm" :style="{ width: '70%' }" header="Paiments de Clients" maximizable :modal="true">

            <div class="row" v-for="p in clients">
        <div class="lcard">
            <h4 class="">{{ p.name }}: <p class="text"> {{ p.ref }} </p></h4>
            <p style="color: red">{{ formatCurrency(p.debt) }}</p>
            <Divider></Divider>
            <Button icon="pi pi-verified" class="mt-2" rounded  @click="add_paiment(p);"></Button>
        </div>
    </div>
            </Dialog>
           
        <Dialog v-model:visible="productDialog" :closable="false" pt:root:class="!border-0 !bg-transparent" pt:mask:class="backdrop-blur-sm" :style="{ width: '100%' }" header="Facture" maximizable :modal="true">
            <div class="card gap-8 flex flex-wrap flex-col " >
            <div class="grid grid-cols-12 gap-6">
                <div class="col-span-6">
                    <label for="name" class="block font-bold mb-3">Client</label>
                    <InputText id="name" :value="product.client?.name"required="true" autofocus :invalid="submitted && !product.client?.name" disabled fluid />
                    <small v-if="submitted && !product.client" class="text-red-500">Client est obligatoire.</small>
                </div>
                
                <div class="col-span-6">
                    <label for="name" class="block font-bold mb-3">Date</label>
                    <InputText id="name" v-model.trim="product.date"    fluid />
                </div>
            </div>      
               
<div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="marge" class="block font-bold mb-3">Titulaire</label>
                        <InputText v-model="product.titulaire"  filter placeholder="Titulaire"  />
                    </div>
                    <div class="col-span-6">
                        <label for="stock" class="block font-bold mb-3">Monatnt</label>
                        <InputNumber id="marge" mode="currency"currency="TND" locale="en-US" v-model="product.montan" :binary="true"  fluid />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Quitter" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Sauvegarder" icon="pi pi-check" @click="saveProduct" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product"
                    >Etes-vous sûr que vous voulez supprimer? </span>
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
                    >Etes-vous sûr que vous voulez Quitter sans Sauvegarder?</span
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