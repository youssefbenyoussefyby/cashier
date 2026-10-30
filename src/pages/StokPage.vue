<script setup lang="ts">

import { ref,onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { ProductService } from '../service/ProductService';
import {  Product } from '../service/interface';
import { CategoryServices } from '../service/CategoryService';
import { TvaServices } from '../service/TvaService';
onMounted( async () => {
    console.log("mounting...");
    await ProductService.getProducts().then(async (data:Product[]) =>{products.value=data;lenp.value=data.length}).catch((err:any)=>console.log(err));
    await CategoryServices.get_category().then(async (data:string[]) =>{category.value=data;}).catch((err:any)=>console.log(err));
    await TvaServices.get_tva().then(async (data:string[]) =>{tva.value=data;loading.value=false}).catch((err:any)=>console.log(err));
    while(!await ProductService.verife(getCode())){
        lenp.value+=1;
    }
    console.log(products.value);
});

const toast = useToast();
const dt = ref();
const lenp = ref(0);
const products = ref<Product[]>([]);
const category = ref<string[]>([]);
const loading = ref(true);
const filtredcategory = ref<string[]>([]);
const tva = ref<string[]>([]);
//const filtredtva = ref<string[]>([]);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref<Product>({});
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
            product.value.inventoryStatus = product.value.inventoryStatus ? product.value.inventoryStatus: product.value.inventoryStatus;
            products.value[findIndexById(product.value.id)] = product.value;
            await ProductService.update_product(product.value);
            toast.add({severity:'success', summary: 'Successful', detail: 'Product Updated', life: 5000});
        }
        else {
            product.value.id =  createId();
            product.value.inventoryStatus = product.value.inventoryStatus ? product.value.inventoryStatus : 'En Stock';
            products.value?.push(product.value);
            product.value.category!=undefined&& !category.value.includes(product.value.category)? category.value.push(product.value.category):0;
            await ProductService.create_product(product.value);
            lenp.value++;
            toast.add({severity:'success', summary: 'Successful', detail: 'Product Created', life: 5000});
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
    await ProductService.delete_product(product.value);
    lenp.value--;

    product.value = {};

    toast.add({severity:'success', summary: 'Successful', detail: 'Product Deleted', life: 5000});
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
    var chars = '123456789';
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
    for(const val of selectedProducts.value){await ProductService.delete_product(val);}
    selectedProducts.value = null;
    toast.add({severity:'success', summary: 'Successful', detail: 'Products Deleted', life: 5000});
};

const getStatusLabel = (status:any) => {
    switch (status) {
        case 'En Stock':
            return 'success';

        case 'Stock faible':
            return 'warn';

        case 'Repture':
            return 'danger';

        default:
            return "contrast";
    }
};
const getCode =  ()=>{
    let code = "ART";
    let n = (lenp.value+1).toString();
    for(let i=0;i<6-n.length;i++){
        code+="0"
    }
    code+=n;
    product.value.code=code;
    return code
}
const search = (event:any) => {
    setTimeout(() => {
        if (!event.query.trim().length) {
            filtredcategory.value = [...category.value];
        } else {
            filtredcategory.value = category.value.filter((c:any) => {
                return c.toLowerCase().startsWith(event.query.toLowerCase());
            });
        }
    }, 250);
}
/*const tvasearch = (event:any) => {
    setTimeout(() => {
        if (!event.query.trim().length) {
            filtredtva.value = [...tva.value];
        } else {
            filtredtva.value = tva.value.filter((c:any) => {
                return c.value.toLowerCase().startsWith(event.query.toLowerCase());
            });
        }
    }, 250);
}*/
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
            <Skeleton v-if="loading" width="100%" height="650px"></Skeleton>
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
                stripedRows
                currentPageReportTemplate=" {first} / {last} > {totalRecords} "
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Stock</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Recherche ..." />
                        </IconField>
                    </div>
                </template>
                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="code" header="Code" sortable style="min-width: 12rem">
                
                </Column>
                <Column field="name" header="Nom" sortable style="min-width: 12rem"></Column>
                <Column field="category" header="Catégorie" sortable style="min-width: 10rem"></Column>               
                 
                <Column field="price_a" header="Prix d'achat" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.prix_a) }}
                    </template>
                </Column>
                <Column field="price_v" header="Prix de vente" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.prix_v) }}
                    </template>
                </Column>
                <Column field="negotiation" header="Marge" sortable style="min-width: 8rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.negotiation) }}
                    </template>
                </Column>
                <Column field="tva" header="TVA" sortable style="min-width: 8rem">
                    <template #body="slotProps">
                        {{ slotProps.data.tva }}%
                    </template>
                
                </Column>
                <Column field="quantite" header="Quantité" sortable style="min-width: 8rem"></Column>
                 <Column field="stock" header="Stock Sécurité" sortable style="min-width: 8rem"></Column>
                <Column field="inventoryStatus" header="Status" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.inventoryStatus" :severity="getStatusLabel(slotProps.data.inventoryStatus)" />
                    </template>
                </Column>
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
                    <InputText id="name" v-model.trim="product.code" required="true" :value="product.code?product.code:getCode()":disabled="product.id !=null" autofocus :invalid="submitted && !product.code" fluid />
                    <small v-if="submitted && !product.code" class="text-red-500">Ref est obligatoire.</small>

                </div>
                <div>
                    <label for="name" class="block font-bold mb-3">Code barre</label>
                    <InputText id="name" v-model.trim="product.barcode"  autofocus  fluid />

                </div>
               
                <div>
                    <span class="block font-bold mb-4">Catégorie</span>
                    <AutoComplete v-model="product.category" :suggestions="filtredcategory" @complete="search">
</AutoComplete>
                       
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">prix d'achat</label>
                        <InputNumber id="price1" v-model="product.prix_a" mode="currency" currency="TND" :onchange="product.negotiation=product.prix_v &&product.prix_a ? product.prix_v -product.prix_a:0" locale="fr-FR" fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">prix de vente</label>
                        <InputNumber id="price1" v-model="product.prix_v" mode="currency" currency="TND" :onchange="product.negotiation=product.prix_v &&product.prix_a ? product.prix_v -product.prix_a:0" locale="fr-FR" fluid />
                    </div>
                </div>
                
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="marge" class="block font-bold mb-3">Marge</label>
                        <InputNumber id="marge" v-model="product.negotiation" mode="currency" :value="product.negotiation" :disabled="true" currency="TND" locale="fr-FR" integeronly fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="stock" class="block font-bold mb-3">TVA</label>
                        <InputNumber v-model="product.tva" :max="99" :min="0" suffix="%"></InputNumber>
                    </div>
                </div>
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="quantity" class="block font-bold mb-3">Quantité</label>
                        <InputNumber id="quantity" v-model="product.quantite" :minFractionDigits="1" :maxFractionDigits="5" fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="stock" class="block font-bold mb-3">Stock de Securités</label>
                        <InputNumber id="quantity" v-model="product.stock" :minFractionDigits="1" :maxFractionDigits="5" fluid />
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
                    >Etes-vous sûr que vous voulez supprimer?<b style="color: #f2c8cf;"> {{ product.name }}</b
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
                <span v-if="product">Etes-vous sûr de vouloir supprimer les produits sélectionnés?</span>
            </div>
            <template #footer>
                <Button label="non" icon="pi pi-times" text @click="deleteProductsDialog = false" />
                <Button label="oui" icon="pi pi-check" text @click="deleteSelectedProducts" />
            </template>
        </Dialog>


</template>


<style lang="css">


</style>