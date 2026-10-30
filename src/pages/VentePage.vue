<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { ProductService } from '../service/ProductService';
import { Category, ProductCard, Ventes } from '../service/interface';
import { CategoryServices } from '../service/CategoryService';
import { InfomationService } from '../service/InformationService';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { VenteService, uid } from '../service/VenteService';
import { FilterMatchMode } from '@primevue/core/api';
import onscan from 'onscan.js'

interface ReceiptLine { name?: string, qte: number, price: number }
interface Receipt {
  ref: string, date: string, lines: ReceiptLine[], total: number,
  received?: number | null, change?: number
}

const confirm = useConfirm();
const toast = useToast();
const expandedRows = ref({});
const dialogVisible = ref(false);
const deleteProductDialog = ref(false);
const doneDialog = ref(false);
const loading = ref(true);
const saving = ref(false);

const products = ref<ProductCard[]>([]);
const category = ref<Category[]>([]);
const cart = ref<ProductCard[]>([]);
const list_ventes = ref<Ventes[]>([]);
const del_vente = ref<Ventes>({});
const ventecode = ref("");
const vpasse = ref(0);
const search = ref("");
const activeCategory = ref("");
const received = ref<number | null>(null);
const receipt = ref<Receipt | null>(null);
const company = ref<{ name?: string, adresse?: string, tele?: string, matr?: string }>({});
const searchInput = ref<any>(null);
const filters = ref({
  'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const colors = ["#f2c8cf", "#e4cded", "#c1e9dd", "#e5d9de"]
const allColor = colors[2];
const get_color = () => colors[Math.floor(Math.random() * colors.length)]

const createId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 7; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}
// dd/mm/yyyy: the Dashboard parses sale dates with split("/")
const formatDate = (value: Date) => value.toLocaleDateString('en-NZ', {
  day: '2-digit', month: '2-digit', year: 'numeric'
});
const formatCurrency = (value: any) => {
  if (value) return value.toLocaleString('fr-FR', { style: 'currency', currency: 'TND' });
  return "TND 0.000";
};
const getStatusLabel = (status: any) => {
  switch (status) {
    case 'En Stock': return 'success';
    case 'Stock faible': return 'warn';
    case 'Repture': return 'danger';
    default: return "contrast";
  }
};

// ---- totals (computed from the cart, never reset by hand) ----
const total = computed(() => cart.value.reduce((s, l) => s + l.quantite * (l.prix_v ?? 0), 0));
const listTotal = computed(() => cart.value.reduce((s, l) => s + l.quantite * (l.actual_price ?? 0), 0));
const remise = computed(() => listTotal.value - total.value);
const benifce = computed(() => cart.value.reduce((s, l) => s + l.quantite * ((l.prix_v ?? 0) - (l.prix_a ?? 0)), 0));
const change = computed(() => received.value == null ? 0 : received.value - total.value);
const missing = computed(() => received.value != null && received.value < total.value);
const cartQty = computed(() => {
  const m = new Map<string, number>();
  cart.value.forEach(l => m.set(l.id ?? "", l.quantite));
  return m;
});
const stockLeft = (p: ProductCard) => p.in_stock - (cartQty.value.get(p.id ?? "") ?? 0);

// ---- catalogue: category + text search combined ----
const filtredproduct = computed(() => {
  const q = search.value.trim().toLowerCase();
  return products.value.filter((p) => {
    if (activeCategory.value && p.category !== activeCategory.value) return false;
    if (!q) return true;
    return (p.name ?? "").toLowerCase().includes(q)
      || (p.code ?? "").toLowerCase().includes(q)
      || (p.barcode ?? "").toLowerCase().includes(q);
  });
});

const loadProducts = async () => {
  products.value = await ProductService.getProducts_card();
};
const loadToday = async () => {
  vpasse.value = await VenteService.total_du_jour(formatDate(new Date()));
};

const fonscan = (scode: string) => {
  const exact = products.value.filter((c) => c.barcode === scode);
  const found = exact.length == 1 ? exact : products.value.filter((c) => c.barcode?.startsWith(scode));
  if (found.length == 1) {
    add_product(found[0].id);
    toast.add({ severity: 'success', summary: 'Ajouté', detail: found[0].name, life: 1500 });
  } else {
    toast.add({ severity: 'error', summary: 'Introuvable', detail: 'Code-barres : ' + scode, life: 4000 });
  }
}

// ---- cart ----
const add_product = (id: any) => {
  const p = products.value.find((c) => c.id === id);
  if (!p) return;
  const line = cart.value.find((l) => l.id === id);
  if (line) {
    set_qty(line, line.quantite + 1);
  } else {
    // the cart works on a copy so the catalogue is never mutated
    cart.value.push({ ...p, quantite: 1 });
  }
}
const remove_line = (line: ProductCard) => {
  cart.value = cart.value.filter((l) => l.id !== line.id);
}
const set_qty = (line: ProductCard, qty: number | null) => {
  if (qty == null) return;
  if (qty <= 0) { remove_line(line); return; }
  const prev = line.quantite;
  line.quantite = qty;
  if (qty > line.in_stock && qty > prev) {
    confirm.require({
      message: `Stock insuffisant (${line.in_stock} disponible). Continuer ?`,
      header: 'Stock insuffisant',
      icon: 'pi pi-exclamation-triangle',
      rejectProps: { label: 'Annuler', severity: 'secondary', outlined: true },
      acceptProps: { label: 'Confirmer', severity: 'danger' },
      accept: () => { },
      reject: () => { line.quantite = prev; }
    });
  }
}
const set_price = (line: ProductCard, value: number | null) => {
  if (value == null) return;
  const prev = line.prix_v;
  line.prix_v = value;
  const discount = (line.actual_price ?? 0) - value;
  if (line.negotiation && discount > line.negotiation) {
    confirm.require({
      message: `Remise de ${formatCurrency(discount)} : marge de négociation dépassée (${formatCurrency(line.negotiation)}).`,
      header: 'Marge dépassée',
      icon: 'pi pi-exclamation-triangle',
      rejectProps: { label: 'Annuler', severity: 'secondary', outlined: true },
      acceptProps: { label: 'Confirmer', severity: 'danger' },
      accept: () => { },
      reject: () => { line.prix_v = prev; }
    });
  }
}
const reset_cart = () => {
  cart.value = [];
  received.value = null;
  ventecode.value = createId();
}
const clear = () => {
  if (!cart.value.length) return;
  confirm.require({
    message: 'Vider le panier ?',
    header: 'Nouvelle vente',
    icon: 'pi pi-undo',
    rejectProps: { label: 'Non', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Oui', severity: 'danger' },
    accept: reset_cart,
  });
}

// ---- checkout ----
const add_vente = async () => {
  if (saving.value) return;
  if (!cart.value.length) {
    toast.add({ severity: 'warn', summary: 'Panier vide', detail: 'Ajoutez un article avant de valider.', life: 3000 });
    return;
  }
  if (missing.value) {
    toast.add({ severity: 'warn', summary: 'Montant insuffisant', detail: 'Le montant reçu est inférieur au total.', life: 3000 });
    return;
  }
  saving.value = true;
  try {
    const lines = cart.value.map((l) => ({ ...l }));
    const v: Ventes = {
      id: String(uid()),
      ref: ventecode.value,
      montant: total.value,
      date: formatDate(new Date()),
    };
    await VenteService.create_sale(v, lines);
    receipt.value = {
      ref: v.ref ?? "", date: v.date ?? "", total: v.montant ?? 0,
      lines: lines.map((l) => ({ name: l.name, qte: l.quantite, price: l.prix_v ?? 0 })),
      received: received.value, change: received.value == null ? undefined : change.value,
    };
    reset_cart();
    doneDialog.value = true;
    await Promise.all([loadProducts(), loadToday()]);
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Erreur', detail: "La vente n'a pas pu être enregistrée.", life: 5000 });
  } finally {
    saving.value = false;
  }
}

// ---- receipt (80mm ticket printed through the system dialog) ----
const print_receipt = async () => {
  try { company.value = await InfomationService.get(); } catch { /* company info is optional */ }
  await nextTick();
  window.print();
}
const reprint = (v: Ventes) => {
  receipt.value = {
    ref: v.ref ?? "", date: v.date ?? "", total: v.montant ?? 0,
    lines: (v.list ?? []).map((l) => ({ name: l.name, qte: l.qte ?? 0, price: l.price ?? 0 })),
  };
  print_receipt();
}

// ---- history ----
const open_dial = async () => {
  dialogVisible.value = true;
  try {
    list_ventes.value = await VenteService.get_vente();
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Erreur', detail: "Impossible de charger l'historique.", life: 4000 });
  }
}
const confirmDeleteVente = (v: Ventes) => {
  del_vente.value = v;
  deleteProductDialog.value = true;
}
const deleteVente = async () => {
  deleteProductDialog.value = false;
  try {
    await VenteService.cancel_sale(del_vente.value);
    list_ventes.value = list_ventes.value.filter((val) => val.id !== del_vente.value.id);
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Vente annulée, stock restitué.', life: 4000 });
    await Promise.all([loadProducts(), loadToday()]);
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Erreur', detail: "La vente n'a pas pu être supprimée.", life: 5000 });
  }
  del_vente.value = {};
}

// ---- keyboard shortcuts: F2 search, F9 pay, Esc clear ----
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'F2') {
    e.preventDefault();
    searchInput.value?.$el?.focus();
  } else if (e.key === 'F9') {
    e.preventDefault();
    add_vente();
  } else if (e.key === 'Escape' && !document.querySelector('.p-dialog')) {
    clear();
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      loadProducts(),
      CategoryServices.get_category_card().then((data: Category[]) => { category.value = data; }),
      loadToday(),
    ]);
    category.value.forEach((e) => { e.color = get_color(); });
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement des données impossible.', life: 5000 });
  }
  loading.value = false;
  ventecode.value = createId();
  if (onscan.isAttachedTo(document)) onscan.detachFrom(document);
  onscan.attachTo(document, { onScan: fonscan });
  window.addEventListener('keydown', onKey);
});
onUnmounted(() => {
  if (onscan.isAttachedTo(document)) onscan.detachFrom(document);
  window.removeEventListener('keydown', onKey);
});
</script>
<template>
  <Toast></Toast>
  <ConfirmDialog></ConfirmDialog>
  <Dialog v-model:visible="doneDialog" header="Vente enregistrée" :style="{ width: '420px' }" modal>
    <div v-if="receipt" class="done">
      <i class="pi pi-check-circle" style="font-size: 2.5rem; color: #2e7d32;"></i>
      <p>Ticket <b>#{{ receipt.ref }}</b></p>
      <p class="done-total">{{ formatCurrency(receipt.total) }}</p>
      <p v-if="receipt.received != null">Reçu : {{ formatCurrency(receipt.received) }}</p>
      <p v-if="receipt.change != null" class="done-change">Rendu : {{ formatCurrency(receipt.change) }}</p>
    </div>
    <template #footer>
      <Button label="Imprimer ticket" icon="pi pi-print" severity="secondary" @click="print_receipt" />
      <Button label="Nouvelle vente" icon="pi pi-check" autofocus @click="doneDialog = false" />
    </template>
  </Dialog>
  <Dialog v-model:visible="dialogVisible" header="Historique des ventes" :style="{ width: '75vw' }" maximizable modal :contentStyle="{ height: '600px' }">
    <DataTable
      dataKey="id"
      :paginator="true"
      :rows="10"
      :filters="filters"
      v-model:expandedRows="expandedRows"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25]"
      stripedRows
      currentPageReportTemplate=" {first} / {last} > {totalRecords} "
      showGridlines
      :value="list_ventes"
      scrollable scrollHeight="flex" tableStyle="min-width: 50rem">
      <template #header>
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="filters['global'].value" placeholder="Recherche ..." />
        </IconField>
      </template>
      <template #empty>Aucune vente.</template>
      <Column expander style="width: 5rem" />
      <Column field="ref" header="Ticket" />
      <Column field="montant" header="Montant">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.montant) }}
        </template>
      </Column>
      <Column field="date" header="Date" />
      <Column :exportable="false" style="min-width: 12rem">
        <template #body="slotProps">
          <Button icon="pi pi-print" class="mr-2" outlined rounded severity="secondary" @click="reprint(slotProps.data)" />
          <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteVente(slotProps.data)" />
        </template>
      </Column>
      <template #expansion="slotProps">
        <div class="p-4">
          <h5>Détail {{ slotProps.data.ref }}</h5>
          <DataTable :value="slotProps.data.list">
            <Column field="name" header="Nom Article"></Column>
            <Column field="code" header="Code Article"></Column>
            <Column field="qte" header="Quantité"></Column>
            <Column field="price" header="Prix">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.price) }}
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </DataTable>
    <template #footer>
      <Button label="Ok" icon="pi pi-check" @click="dialogVisible = false" />
    </template>
  </Dialog>
  <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirmer" :modal="true">
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle !text-3xl" />
      <span v-if="del_vente">Annuler la vente <b style="color: #f2c8cf;">{{ del_vente.ref }}</b> et remettre les articles en stock ?</span>
    </div>
    <template #footer>
      <Button label="non" icon="pi pi-times" text @click="deleteProductDialog = false" />
      <Button label="oui" icon="pi pi-check" @click="deleteVente" />
    </template>
  </Dialog>

  <!-- 80mm receipt: invisible on screen, the only thing printed -->
  <div v-if="receipt" id="receipt" class="receipt">
    <h2>{{ company.name || 'GestCashier' }}</h2>
    <p v-if="company.adresse">{{ company.adresse }}</p>
    <p v-if="company.tele">Tél : {{ company.tele }}</p>
    <p v-if="company.matr">MF : {{ company.matr }}</p>
    <hr />
    <p>Ticket #{{ receipt.ref }} — {{ receipt.date }}</p>
    <hr />
    <table>
      <tr v-for="(l, i) in receipt.lines" :key="i">
        <td>{{ l.name }}<br />{{ l.qte }} x {{ formatCurrency(l.price) }}</td>
        <td class="r">{{ formatCurrency(l.qte * l.price) }}</td>
      </tr>
    </table>
    <hr />
    <p class="row"><b>TOTAL</b><b>{{ formatCurrency(receipt.total) }}</b></p>
    <p v-if="receipt.received != null" class="row"><span>Reçu</span><span>{{ formatCurrency(receipt.received) }}</span></p>
    <p v-if="receipt.change != null" class="row"><span>Rendu</span><span>{{ formatCurrency(receipt.change) }}</span></p>
    <hr />
    <p class="center">Merci de votre visite !</p>
  </div>

  <Skeleton v-if="loading" width="100%" height="650px"></Skeleton>
  <Splitter v-if="!loading">
    <SplitterPanel class="flex items-center justify-center " :size="70">
      <Splitter layout="vertical">
        <SplitterPanel class="p-10" :size="45" :minSize="45">
          <ScrollPanel style="width: 100%; height: 350px">
            <div style="display: flex;flex-wrap: wrap;height: 100%;top: 0;">
              <div class="cardBoard">
                <div class="title">
                  <p class="title-text">
                    Recette
                    <strong>{{ formatDate(new Date()) }}</strong>
                  </p>
                  <p class="percent">
                    <i class="pi pi-dollar"></i>
                  </p>
                </div>
                <div class="data">
                  <p>{{ formatCurrency(vpasse) }}</p>
                  <div class="range">
                    <div class="fill"></div>
                  </div>
                </div>
              </div>
              <div>
                <div class="Categorycard" :class="{ active: !activeCategory }" :style="'background-color:' + allColor + ' ;'" @click="activeCategory = ''">
                  <i class="pi pi-tags" style="font-size: 20px;"></i>
                  <h1 class="categryname"> Tous</h1>
                  <span class="content">Contient: {{ products.length }}</span>
                </div>
              </div>
              <div v-for="cat in category" :key="cat.name">
                <div class="Categorycard" :class="{ active: activeCategory === cat.name }" :style="'background-color:' + cat.color + ' ;'" @click="activeCategory = cat.name ?? ''">
                  <i class="pi pi-tags" style="font-size: 20px;"></i>
                  <h1 class="categryname"> {{ cat.name }}</h1>
                  <span class="content">Contient: {{ cat.content }}</span>
                </div>
              </div>
            </div>
          </ScrollPanel>
        </SplitterPanel>
        <SplitterPanel class="flex flex-wrap col-span-4" :size="55" :minSize="55">
          <Toolbar class=" relative w-full">
            <template #end>
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText ref="searchInput" v-model="search" placeholder="Nom, code, code-barres (F2)" />
              </IconField>
            </template>
          </Toolbar>

          <div class="row" v-for="p in filtredproduct" :key="p.id">
            <div class="lcard">
              <h4 class="">{{ p.name }}: <p class="text"> {{ p.code }} </p></h4>
              <Tag :severity="getStatusLabel(p.inventoryStatus)" :value="p.inventoryStatus" rounded></Tag>
              <p>{{ formatCurrency(p.actual_price) }}</p>
              <p>En Stock: {{ stockLeft(p) }}</p>
              <Divider></Divider>
              <Button icon="pi pi-shopping-cart" class="mt-2" rounded @click="add_product(p.id)"></Button>
            </div>
          </div>
        </SplitterPanel>
      </Splitter>
    </SplitterPanel>
    <SplitterPanel style="" :size="30">
      <Toolbar>
        <template #start>
          <h1 class=" font-bold dark:text-gray-100">Ordre: </h1>
          <p class="text-gary-700">#{{ ventecode }}</p>
        </template>
        <template #end>
          <Button icon="pi pi-undo" class="mr-2" severity="secondary" @click="clear" text title="Vider (Échap)" />
          <Button class="mr-2" icon="pi pi-folder" @click="open_dial" text :severity="'contrast'" />
        </template>
      </Toolbar>

      <Divider></Divider>
      <ScrollPanel class="pt-10" style="height: 500px;">
        <div class="Listcard" v-for="item in cart" :key="item.id">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <h1>{{ item.name }}</h1>
            <Button icon="pi pi-times" severity="danger" text rounded size="small" @click="remove_line(item)" />
          </div>
          <InputNumber mode="currency" currency="TND" locale="fr-FR" :model-value="item.prix_v" @update:model-value="set_price(item, $event)">
          </InputNumber>
          <InputNumber :model-value="item.quantite" @update:model-value="set_qty(item, $event)" :minFractionDigits="0" :maxFractionDigits="5" showButtons buttonLayout="horizontal" :min="0" :max="9999" fluid>
            <template #incrementbuttonicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
              <span class="pi pi-minus" />
            </template>
          </InputNumber>
        </div>
        <p v-if="!cart.length" class="empty-cart">Panier vide — scannez ou cliquez sur un article.</p>
      </ScrollPanel>
      <Divider></Divider>
      <div class="footcontainer">
        <div class="payments">
          <span>PAYMENT</span>
          <div class="details">
            <span>Prix Total:</span>
            <span>{{ formatCurrency(listTotal) }}</span>
            <span>Remise:</span>
            <span>{{ formatCurrency(remise) }}</span>
            <span>Bénifice:</span>
            <span>{{ formatCurrency(benifce) }}</span>
            <span>Prix Finale:</span>
            <span>{{ formatCurrency(total) }}</span>
            <span>Montant reçu:</span>
            <span>
              <InputNumber v-model="received" mode="currency" currency="TND" locale="fr-FR" size="small" placeholder="0,000" />
            </span>
            <span>Rendu:</span>
            <span :class="{ missing: missing }">{{ missing ? 'Insuffisant' : formatCurrency(change) }}</span>
          </div>
          <Button label="Montant exact" size="small" severity="secondary" text :disabled="!cart.length" @click="received = total" />
        </div>

        <div class="card checkout">
          <div class="footer">
            <label class="price">{{ formatCurrency(total) }}</label>
            <button class="checkout-btn" :disabled="saving || !cart.length" @click="add_vente">
              {{ saving ? 'Enregistrement…' : 'Confirme achat (F9)' }}
            </button>
          </div>
        </div>
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<style lang="css">
.footcontainer{
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  gap:35px;
  height: 100%;
  width: 30%;
  background-color: #fff;
}
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px 10px 20px;
  background-color: rgba(16, 86, 82, .5);
}

.price {
  position: relative;
  font-size: 22px;
  color: #2B2B2F;
  font-weight: 900;
}

.checkout .checkout-btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 36px;
  background: rgba(16, 86, 82, .55);
  box-shadow: 0px 0.5px 0.5px rgba(16, 86, 82, .75), 0px 1px 0.5px rgba(16, 86, 82, .75);
  ;
  border-radius: 7px;
  border: 1px solid rgb(16, 86, 82);
  ;
  color: #000000;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.15, 0.83, 0.66, 1);
}

.payments .details {
  display: grid;
  grid-template-columns: 10fr 4fr;
  padding: 0px;
  gap: 5px;
}

.payments .details span:nth-child(odd) {
  font-size: 12px;
  font-weight: 600;
  color: #000000;
  margin: auto auto auto 0;
}

.payments .details span:nth-child(even) {
  font-size: 13px;
  font-weight: 600;
  color: #000000;
  margin: auto 0 auto auto;
}
.payments{
  padding: 15px;
}













.Categorycard{
cursor: pointer;
    width: 200px;
    height: 150px;
    margin: 10px;
        font-size: 25px;
  font-weight: bold;
  color: #000;
    border-radius: 12px;
    padding: 5px 10px;
  transform: rotate(-1deg);
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 5px 5px 0 #000, 10px 10px 0 #111;
}

.Listcard{
    width: 490px;
    height: 180px;
    margin: 10px;
        font-size: 15px;
  font-weight: bold;
  color: #fff;
    border-radius: 12px;
    padding: 5px 10px;
  z-index: 1;
  background-color: #2d2d2d;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  gap: 20px;
}
.content{
    font-size: 14px;
    color: #707070;
    position: absolute;
    bottom: 0;

}
.icon {
  margin-right: 14px;
  color: #212121;
}
.lcard {
  border-radius: 10px;
  filter: drop-shadow(0 5px 10px 0 #ffffff);
  width: 19rem;
  height: 80%;
  background-color: #2d2d2d;
  padding: 20px;
  margin: 20px;
  position: relative;
  z-index: 0;
  overflow: hidden;
  transition: 0.6s ease-in;
}

.lcard::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: -15px;
  right: -15px;
  background: #e4cded;
  height:220px;
  width: 25px;
  border-radius: 32px;
  transform: scale(1);
  transform-origin: 50% 50%;
  transition: transform 0.25s ease-out;
}

.lcard:hover::before{
    transition-delay:0.2s ;
  transform: scale(40);
}
 .lcard:hover h4 {
  color: #2B2B2F;
 }
 .lcard:hover p {
  color: #2d2d2d;
 }
 .lcard p{
  color: #99999d;
 }

.lcard h4{
  font-weight: bolder;
  font-size: 20px;
  color:#fff;
}

.Categorycard.active{
  outline: 3px solid #212121;
}
.checkout .checkout-btn:disabled{
  opacity: .5;
  cursor: not-allowed;
}
.payments .details .missing{
  color: #c62828;
}
.empty-cart{
  text-align: center;
  color: #707070;
  padding: 20px;
}
.done{
  text-align: center;
}
.done-total{
  font-size: 28px;
  font-weight: 800;
}
.done-change{
  font-size: 20px;
  font-weight: 700;
  color: #2e7d32;
}

/* receipt: hidden on screen, the only thing visible when printing */
.receipt{
  display: none;
}
@media print {
  body{
    zoom: 1 !important;
  }
  body *{
    visibility: hidden;
  }
  #receipt, #receipt *{
    visibility: visible;
  }
  #receipt{
    display: block;
    position: fixed;
    left: 0;
    top: 0;
    width: 72mm;
    padding: 2mm;
    color: #000;
    background: #fff;
    font-family: 'Courier New', monospace;
    font-size: 11px;
  }
  #receipt h2{ text-align: center; font-size: 15px; margin: 0 0 4px; }
  #receipt p{ margin: 2px 0; }
  #receipt hr{ border: 0; border-top: 1px dashed #000; margin: 4px 0; }
  #receipt table{ width: 100%; border-collapse: collapse; }
  #receipt td{ padding: 2px 0; vertical-align: top; }
  #receipt .r{ text-align: right; white-space: nowrap; }
  #receipt .row{ display: flex; justify-content: space-between; }
  #receipt .center{ text-align: center; }
}
</style>