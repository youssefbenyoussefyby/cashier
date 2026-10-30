<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { Charge } from '../service/interface';
import { ChargeService } from '../service/ChargeServices';
import InputText from 'primevue/inputtext';

onMounted(async () => {
    console.log("mounting charges component...");
    await loadCharges();
});

const loadCharges = async () => {
    await ChargeService.getAll()
        .then((data: Charge[]) => {
            charges.value = data;
            lenp.value = data.length;
            loading.value = false;
        })
        .catch((err: any) => console.log(err));
};

const expandedRows = ref({});
const toast = useToast();
const dt = ref();
const lenp = ref(0);
const charges = ref<Charge[]>([]);
const loading = ref(true);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref<Charge>({});
const selectedProducts = ref();
const typeOptions = ref([
    { label: 'Fixe', value: 'fixed' },
    { label: 'Variable', value: 'variable' }
]);

const filters = ref({
    'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
    'type': {value: null, matchMode: FilterMatchMode.EQUALS}
});

const submitted = ref(false);

const formatCurrency = (value: any) => {
    if(value)
        return value.toLocaleString('en-US', {style: 'currency', currency: 'TND'});
    return;
};

const openNew = () => {
    product.value = {
        type: 'variable',
        date: formatDate(new Date())
    };
    submitted.value = false;
    productDialog.value = true;
};

const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};

const saveProduct = async () => {
    submitted.value = true;

    if (product.value.description?.trim() && product.value.value !== undefined) {
        if (product.value.id) {
            await ChargeService.update(product.value);
            toast.add({severity:'success', summary: 'Successful', detail: 'Charge Modifiée', life: 3000});
            const index = charges.value.findIndex(item => item.id === product.value.id);
            if (index !== -1) {
                charges.value[index] = {...product.value};
            }
        } else {
            product.value.id = createId();
            await ChargeService.create(product.value);
            charges.value.push({...product.value});
            toast.add({severity:'success', summary: 'Successful', detail: 'Charge Ajoutée', life: 3000});
        }
        
        productDialog.value = false;
        product.value = {};
    }
};

const editProduct = (prod: Charge) => {
    product.value = {...prod};
    productDialog.value = true;
};

const confirmDeleteProduct = (prod: Charge) => {
    product.value = prod;
    deleteProductDialog.value = true;
};

const deleteProduct = async () => {
    if (product.value.id) {
        await ChargeService.delete(product.value.id);
        charges.value = charges.value.filter(val => val.id !== product.value.id);
        deleteProductDialog.value = false;
        product.value = {};
        toast.add({severity:'success', summary: 'Successful', detail: 'Charge Supprimée', life: 3000});
    }
};

const createId = () => {
    let id = '';
    const chars = '0123456789';
    for (let i = 0; i < 12; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};

const exportCSV = ($event: MouseEvent) => {
    $event;
    dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};

const deleteSelectedProducts = async () => {
    if (selectedProducts.value && selectedProducts.value.length > 0) {
        for (const charge of selectedProducts.value) {
            if (charge.id) {
                await ChargeService.delete(charge.id);
            }
        }
        
        charges.value = charges.value.filter(val => !selectedProducts.value.includes(val));
        deleteProductsDialog.value = false;
        selectedProducts.value = null;
        toast.add({severity:'success', summary: 'Successful', detail: 'Charges Supprimées', life: 3000});
    }
};

const formatDate = (value: any) => {
    if (!value) return '';
    
    if (typeof value === 'string') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return value;
        }
        value = date;
    }
    
    return value.toLocaleDateString('en-NZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const getTypeLabel = (type: string) => {
    return type === 'fixed' ? 'Fixe' : 'Variable';
};
</script>

<template>
    <div class="card">
        <Toast></Toast>
        <Toolbar class="mb-6">
            <template #start>
                <Button label="Ajouter" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                <Button label="Supprimer" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
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
            :value="charges"
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
                    <h4 class="m-0">Charges</h4>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Recherche ..." />
                    </IconField>
                </div>
            </template>
            
            <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
            <Column field="description" header="Description" sortable style="min-width: 14rem"></Column>
            <Column field="type" header="Type" sortable style="min-width: 10rem">
                <template #body="slotProps">
                    <Tag :severity="slotProps.data.type === 'fixed' ? 'info' : 'warning'" rounded>
                        {{ getTypeLabel(slotProps.data.type) }}
                    </Tag>
                </template>
                <template #filter="{ filterModel }">
                    <Dropdown 
                        v-model="filterModel.value" 
                        :options="typeOptions" 
                        optionLabel="label" 
                        optionValue="value"
                        placeholder="Tous types" 
                        class="p-column-filter" 
                        style="min-width: 12rem" 
                        :showClear="true"
                    />
                </template>
            </Column>
            <Column field="date" header="Date" sortable style="min-width: 10rem">
                <template #body="slotProps">
                    {{ formatDate(slotProps.data.date) }}
                </template>
            </Column>
            <Column field="value" header="Montant" sortable style="min-width: 12rem">
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.value) }}
                </template>
            </Column>
            <Column field="value" header="Period" sortable style="min-width: 12rem">
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.period) }}
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
    
    <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Détails de la charge" :modal="true" class="p-fluid">
        <div class="flex flex-col gap-6">

        <div class="field">
            <label for="description" class="block font-bold mb-3">Description</label>
            <InputText id="description" v-model.trim="product.description" required autofocus :class="{'p-invalid': submitted && !product.description}" />
            <small class="p-error" v-if="submitted && !product.description">Description est obligatoire.</small>
        </div>
        
        <div class="field">
            <label for="type" class="block font-bold mb-3">Type</label>
            <Select id="type" v-model="product.type" class="relative top-0"  filter :options="typeOptions" optionLabel="label" optionValue="value" placeholder="Sélectionner un type" />
        </div>
        
        <div class="field">
            <label for="value" class="block font-bold mb-3">Montant</label>
            <InputNumber id="value" v-model="product.value" mode="currency" currency="TND" locale="en-US" :class="{'p-invalid': submitted && product.value === undefined}" />
            <small class="p-error" v-if="submitted && product.value === undefined">Montant est obligatoire.</small>
        </div>
        
        <div class="field">
            <label for="date" class="block font-bold mb-3">Date</label>
            <InputText id="date" v-model="product.date" dateFormat="dd/mm/yy" placeholder="Date" />
        </div>
        <div class="field">
            <label for="period" class="block font-bold mb-3">Period</label>
            <InputNumber  fluid id="period" v-model="product.period" suffix="Jours" />
        </div>
        </div>

        
        <template #footer>
            <Button label="Annuler" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Sauvegarder" icon="pi pi-check" @click="saveProduct" />
        </template>
    </Dialog>
    
    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirmation" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle text-3xl" />
            <span v-if="product">Êtes-vous sûr de vouloir supprimer cette charge?</span>
        </div>
        <template #footer>
            <Button label="Non" icon="pi pi-times" text @click="deleteProductDialog = false" />
            <Button label="Oui" icon="pi pi-check" text @click="deleteProduct" />
        </template>
    </Dialog>
    
    <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirmation" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle text-3xl" />
            <span>Êtes-vous sûr de vouloir supprimer les charges sélectionnées?</span>
        </div>
        <template #footer>
            <Button label="Non" icon="pi pi-times" text @click="deleteProductsDialog = false" />
            <Button label="Oui" icon="pi pi-check" text @click="deleteSelectedProducts" />
        </template>
    </Dialog>
</template>

<style lang="css">
.p-tag {
    min-width: 75px;
    text-align: center;
}
.p-dialog-mask {
    backdrop-filter: blur(4px);
}
</style>