<script setup lang="ts">
import { onMounted,ref } from 'vue';
import { infomations, Roles, users } from '../service/interface';
import { SettingsService } from '../service/SettingsService';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from '@primevue/core/api';
const expandedRows = ref({});
const role= ref("admin")
const info = ref<infomations>({});
const userslist = ref<users[]>([]);
const isloading = ref(true);
const Role = ref<Roles>({ReadStock:false,WriteStock:false,ReadBl:false,ReadClients:false,ReadFacture:false,ReadFfo:false,ReadFo:false,ReadVentes:true,WriteBl:false,WriteClients:false,WriteFacture:false,WriteFfo:false,WriteFo:false,WriteVentes:false});
const toast = useToast();
const selectedUsers = ref();
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const submitted = ref(false);
const product = ref<users>({});
    const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
};
const filters = ref({
    'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
});
    onMounted(async ()=>{
        await SettingsService.getGenralInfo().then((ele:infomations)=>info.value=ele);
        await SettingsService.getUsers().then((data:users[])=>{userslist.value=data;isloading.value=false})
        
    });
    const saveInfo=async()=>{
        await SettingsService.UpdateInfo(info.value);
    toast.add({severity:'success', summary: 'Successful', detail: 'Informations sont Sauvgardés', life: 5000});

    }
    const confirmDeleteProduct = (prod:any) => {
    product.value = prod;
    deleteProductDialog.value = true;
};
const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};

const createId = () => {
    let id = '';
    var chars = '0123456789';
    for ( var i = 0; i < 12; i++ ) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return id;
}
const saveProduct = async() => {
    submitted.value = true;

    if (product?.value.identifier?.trim() ) {
        if (!product.value.id) {
            product.value.id =  createId();
            userslist.value?.push(product.value);
            await SettingsService.AddUser(product.value);
            toast.add({severity:'success', summary: 'Successful', detail: 'Utilisateur Ajouté', life: 5000});
        }

        productDialog.value = false;
        product.value = {};
    }
};
const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};
const deleteProduct = async() => {
    userslist.value = userslist.value?.filter((val:any) => val.id !== product.value.id);
    deleteProductDialog.value = false;
    await SettingsService.DelteUser(product.value);
    product.value = {};
    toast.add({severity:'success', summary: 'Successful', detail: 'Utilisateur Suprimé', life: 5000});
};
const deleteSelectedProducts = async() => {
    userslist.value = userslist.value?.filter((val:any) => !selectedUsers.value.includes(val));
    deleteProductsDialog.value = false;
    for(const val of selectedUsers.value){await SettingsService.DelteUser(val);}
    selectedUsers.value = null;
    toast.add({severity:'success', summary: 'Successful', detail: 'Products Deleted', life: 5000});
};
</script>
<template>
    <Toast></Toast>
 <div class="card flex gap-5 flex-col">
    <h1 class=" font-bold from-neutral-200 " style="font-size: 20px;">
         Détails de STE
    </h1>
    <Divider class="mb-5"></Divider>
    <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">Nom de STE</label>
                        <InputText id="price" v-model="info.name"  fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">Matricule Fiscale</label>
                        <InputText id="price" v-model="info.matr"  fluid />
                    </div>
    </div>
    <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">GSM</label>
                        <InputText id="price" v-model="info.tele"  fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">Email</label>
                        <InputText id="price" v-model="info.email"  fluid />
                    </div>
    </div>
    <div class="grid grid-cols-12 gap-4">

    <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">Adresse</label>
                        <InputText id="price" v-model="info.adresse"  fluid />
                    </div>
                    <div class="col-span-6 flex justify-center p-5">
                      <Button class="w-full mt-1"security="help" @click="saveInfo" placeholder="Sauvgarder">Sauvgarder</Button>
                    </div>

 </div>
 </div>
 <div class="card flex gap-5 flex-col">
    <h1 class=" font-bold from-neutral-200 " style="font-size: 20px;">
         Utilisateurs
    </h1>
    <Divider ></Divider>
    <Toolbar>
        <template #start>
                    <Button label="Ajouter" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                    <Button label="suprimer" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedUsers || !selectedUsers.length" />
                </template>
    </Toolbar>
    <Skeleton v-if="isloading" width="100%" height="650px"></Skeleton>
                        <DataTable
            v-if="!isloading"
                ref="dt"
                v-model:selection="selectedUsers"
                :value="userslist"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                v-model:expandedRows="expandedRows"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                stripedRows
                currentPageReportTemplate=" {first} / {last} > {totalRecords} "
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Utilisateurs</h4>
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
                <Column field="identifier" header="ID" sortable></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button v-if="slotProps.data.role!='admin'" icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
                    </template>
                </Column>
                <template #expansion="slotProps">
                <div class="p-4">
                    <h5>Roles {{ slotProps.data.identifier }}</h5>
                    <DataTable :value="slotProps.data.role">
        <Column field="ReadStock" header="Stock" >
            <template #body="slotProps">
                  {{ slotProps.data.ReadStock?"Consulter":"" }}
                  {{ slotProps.data.WriteStock?"et Modifier":"" }}
              </template>
        </Column>
        <Column field="ReadVentes" header="Ventes" >
            <template #body="slotProps">
                  {{ slotProps.data.ReadVentes?"Consulter":"" }}
                  {{ slotProps.data.WriteVentes?"et Modifier":"" }}
              </template>
        </Column>
        <Column field="ReadFacture" header="Facture" >
            <template #body="slotProps">
                  {{ slotProps.data.ReadFacture?"Consulter":"" }}
                  {{ slotProps.data.WriteFacture?"et Modifier":"" }}
              </template>
        </Column>
        <Column field="ReadBl" header="BLs" >
            <template #body="slotProps">
                  {{ slotProps.data.ReadBl?"Consulter":"" }}
                  {{ slotProps.data.WriteBl?"et Modifier":"" }}
              </template>
        </Column>
        <Column field="ReadFfo" header="Factures Fournisseurs" >
            <template #body="slotProps">
                  {{ slotProps.data.ReadFfo?"Consulter":"" }}
                  {{ slotProps.data.WriteFfo?"et Modifier":"" }}
              </template>
        </Column>
        <Column field="ReadClients" header="Clients" >
            <template #body="slotProps">
                  {{ slotProps.data.ReadClients?"Consulter":"" }}
                  {{ slotProps.data.WriteClients?"et Modifier":"" }}
              </template>
        </Column>
        <Column field="ReadFo" header="Fournisseurs" >
            <template #body="slotProps">
                  {{ slotProps.data.ReadFo?"Consulter":"" }}
                  {{ slotProps.data.WriteFo?"et Modifier":"" }}
              </template>
        </Column>
                      </DataTable>
                      </div>
                      </template>
                        </DataTable>
 </div>
 <Dialog v-model:visible="productDialog" :style="{ width: '650px' }" header="Détails Produits" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">ID:</label>
                    <InputText id="name" v-model.trim="product.identifier" required="true" autofocus :invalid="submitted && !product.identifier" fluid />
                    <small v-if="submitted && !product.identifier" class="text-red-500">Id est obligatoire.</small>
                </div>
                <div>
                    <label for="name" class="block font-bold mb-3">Mot de passe:</label>
                    <InputText id="name" v-model.trim="product.password" required="true" :disabled="product.id !=null" autofocus :invalid="submitted && !product.password" fluid />
                    <small v-if="submitted && !product.password" class="text-red-500">Mot de passe est obligatoire.</small>
                </div>
                <div>
                    <label for="name" class="block font-bold mb-3">Role:</label>
                    <Select v-model="role" :options="['admin','Personalizer']" :onchange="role=='admin'? product.role='admin':product.role=role"  placeholder="Role d'utulisateur"  />
                </div>
                <div v-if="role=='Personalizer'">
                    <label for="name" class="block font-bold mb-3">Stock:</label>
                    <div class="flex items-center">
                    <Checkbox v-model="Role.ReadStock" :binary="true" />
                    <label for="ingredient1" class="ml-2"> Consulter Stock </label>
                </div>
                <div class="flex items-center">
                    <Checkbox v-model="Role.WriteStock" :binary="true" />
                    <label for="ingredient1" class="ml-2"> Modifier Stock </label>
                </div>
                </div>
                <div v-if="role=='Personalizer'">
                    <label for="name" class="block font-bold mb-3">Ventes:</label>
                    <div class="flex items-center">
                    <Checkbox v-model="Role.ReadVentes" :binary="true" />
                    <label for="ingredient1" class="ml-2"> Consulter Ventes </label>
                </div>
                <div class="flex items-center">
                    <Checkbox v-model="Role.WriteVentes" :binary="true" />
                    <label for="ingredient1" class="ml-2"> Modifier Ventes </label>
                </div>
                </div>
                <div v-if="role=='Personalizer'">
                    <label for="name" class="block font-bold mb-3">Facture:</label>
                    <div class="flex items-center">
                    <Checkbox v-model="Role.ReadFacture" :binary="true" />
                    <label for="ingredient1" class="ml-2"> Consulter Facture </label>
                </div>
                <div class="flex items-center">
                    <Checkbox v-model="Role.WriteFacture" :binary="true" />
                    <label for="ingredient1" class="ml-2"> Modifier Facture </label>
                </div>
                </div>
                <div v-if="role=='Personalizer'">
                    <label for="name" class="block font-bold mb-3">BL:</label>
                    <div class="flex items-center">
                    <Checkbox v-model="Role.ReadBl" :binary="true" />
                    <label for="ingredient1" class="ml-2"> Consulter BLs </label>
                </div>
                <div class="flex items-center">
                    <Checkbox v-model="Role.WriteBl" :binary="true" />
                    <label for="ingredient1" class="ml-2"> Modifier BLs </label>
                </div>
                </div>

                <div v-if="role=='Personalizer'">
                    <label for="name" class="block font-bold mb-3">Facture Fournisseurs:</label>
                    <div class="flex items-center">
                    <Checkbox v-model="Role.ReadFfo" :binary="true" />
                    <label for="ingredient1" class="ml-2"> Consulter Facture Fournisseurs </label>
                </div>
                <div class="flex items-center">
                    <Checkbox v-model="Role.WriteFfo" :binary="true" />
                    <label for="ingredient1" class="ml-2"> Modifier Facture Fournisseurs </label>
                </div>
                </div>

                <div v-if="role=='Personalizer'">
                    <label for="name" class="block font-bold mb-3">Clients:</label>
                    <div class="flex items-center">
                    <Checkbox v-model="Role.ReadClients" :binary="true" />
                    <label for="ingredient1" class="ml-2"> Consulter Clients </label>
                </div>
                <div class="flex items-center">
                    <Checkbox v-model="Role.WriteClients" :binary="true" />
                    <label for="ingredient1" class="ml-2"> Modifier Clients </label>
                </div>
                </div>

                <div v-if="role=='Personalizer'">
                    <label for="name" class="block font-bold mb-3"> Fournisseurs:</label>
                    <div class="flex items-center">
                    <Checkbox v-model="Role.ReadFo" :binary="true" />
                    <label for="ingredient1" class="ml-2"> Consulter Fournisseurs </label>
                </div>
                <div class="flex items-center">
                    <Checkbox v-model="Role.WriteFo" :binary="true" />
                    <label for="ingredient1" class="ml-2"> Modifier Fournisseurs </label>
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
                    >Etes-vous sûr que vous voulez supprimer?<b style="color: #f2c8cf;"> {{ product.identifier }}</b
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