<script setup lang="ts">
import { ref,onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import {Fournisseur } from '../service/interface';
import { FournisseurService } from '../service/FournisseurService';
onMounted( async () => {
    console.log("mounting...");
    await FournisseurService.getFournisseurs().then(async (data:Fournisseur[]) =>{products.value=data;lenp.value=data.length;loading.value=false}).catch((err:any)=>console.log(err));
    while(!await FournisseurService.verife(getCode())){
        lenp.value+=1;
    }

});
const loading =ref(true)
const toast = useToast();
const dt = ref();
const lenp = ref(0);
const products = ref<Fournisseur[]>([]);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref<Fournisseur>({});
const selectedProducts = ref();
const filters = ref({
    'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
});
const submitted = ref(false);

const formatCurrency = (value:any) => {
    if(value)
        return value.toLocaleString('fr-FR', {style: 'currency', currency: 'TND'});
    return;
};
const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
};
const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};
const saveProduct = async() => {
    submitted.value = true;

    if (product?.value.name?.trim() ) {
        if (product.value.id) {
            products.value[findIndexById(product.value.id)] = product.value;
            await FournisseurService.update_client(product.value);
            toast.add({severity:'success', summary: 'Successful', detail: 'Client Updated', life: 5000});
        }
        else {
            product.value.id = createId();
            products.value?.push(product.value);
            await FournisseurService.create_client(product.value);
            lenp.value++;
            toast.add({severity:'success', summary: 'Successful', detail: 'Client Created', life: 5000});
        }

        productDialog.value = false;
        product.value = {};
    }
};
const editProduct = (prod:any) => {
    product.value = {...prod};
    productDialog.value = true;
};
const confirmDeleteProduct = (prod:any) => {
    product.value = prod;
    deleteProductDialog.value = true;
};
const deleteProduct = async() => {
    products.value = products.value?.filter((val:any) => val.id !== product.value.id);
    deleteProductDialog.value = false;
    await FournisseurService.delete_client(product.value);
    lenp.value--;

    product.value = {};

    toast.add({severity:'success', summary: 'Successful', detail: 'Client Deleted', life: 5000});
};
const findIndexById = (id:any) => {
    let index = -1;
    for (let i = 0; i < products.value?.length; i++) {
        if (products.value[i].id === id) {
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
const deleteSelectedProducts = async() => {
    products.value = products.value?.filter((val:any) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    for(const val of selectedProducts.value){await FournisseurService.delete_client(val);}
    selectedProducts.value = null;
    toast.add({severity:'success', summary: 'Successful', detail: 'Products Deleted', life: 5000});
};


const getCode = ()=>{
    let code = "FO";
    let n = (lenp.value+1).toString();
    for(let i=0;i<7-n.length;i++){
        code+="0"
    }
    code+=n;
    product.value.ref=code;
    return code
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
                ref="dt"
                v-model:selection="selectedProducts"
                :value="products"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate=" {first} / {last} > {totalRecords} "
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Fournisseurs</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Recherche ..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="ref" header="Code" sortable style="min-width: 12rem"></Column>
                <Column field="name" header="Nom" sortable style="min-width: 12rem"></Column>
                <Column field="debt" header="Crédit" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.debt) }}
                    </template>
                </Column>
                <Column field="res" header="Responsable" sortable style="min-width: 10rem"></Column>               
                 <Column field="email" header="Email" sortable style="min-width: 10rem"></Column>
                 <Column field="tele" header="GSM" sortable style="min-width: 10rem"></Column>
                 <Column field="address" header="Adresse" sortable style="min-width: 10rem"></Column>
                 <Column field="matr" header="Matricule Fiscale" sortable style="min-width: 10rem"></Column>
                 <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="productDialog" :style="{ width: '650px' }" header="Product Details" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Nom</label>
                    <InputText id="name" v-model.trim="product.name" required="true" autofocus :invalid="submitted && !product.name" fluid />
                    <small v-if="submitted && !product.name" class="text-red-500">Nom est obligatoire.</small>
                </div>
                <div>
                    <label for="name" class="block font-bold mb-3">Référence</label>
                    <InputText id="name" v-model.trim="product.ref" required="true" :value="getCode()":disabled="product.id !=null" autofocus :invalid="submitted && !product.ref" fluid />
                    <small v-if="submitted && !product.ref" class="text-red-500">Ref est obligatoire.</small>

                </div>
                <div>
                    <label for="name" class="block font-bold mb-3">Matricule Fiscale</label>
                    <InputText id="name" v-model.trim="product.matr"  autofocus  fluid />

                </div>
                <div>
                    <label for="name" class="block font-bold mb-3">Responsable</label>
                    <InputText id="name" v-model.trim="product.res"  autofocus  fluid />
                </div>
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">Crédit</label>
                        <InputNumber id="price" v-model="product.debt" mode="currency" currency="TND" locale="fr-FR" fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">Adresse</label>
                        <InputText id="price1" v-model="product.address" mode="currency" currency="TND" locale="fr-FR" fluid />
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="quantity" class="block font-bold mb-3">Email</label>
                        <InputText id="quantity" v-model="product.email" integeronly fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="stock" class="block font-bold mb-3">GSM</label>
                        <InputText id="quantity" v-model="product.tele" integeronly fluid />
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
                    >Etes-vous sûr que vous voulez supprimer?<b style="color: #f2c8cf;">{{ product.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="non" icon="pi pi-times" text @click="deleteProductDialog = false" />
                <Button label="oui" icon="pi pi-check" @click="deleteProduct" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product">Etes-vous sûr de vouloir supprimer les clients sélectionnés?</span>
            </div>
            <template #footer>
                <Button label="non" icon="pi pi-times" text @click="deleteProductsDialog = false" />
                <Button label="oui" icon="pi pi-check" text @click="deleteSelectedProducts" />
            </template>
        </Dialog>
</template>
<style lang="css">

</style>