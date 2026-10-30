<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ClientService } from '../service/ClientService';
import { bl, Charge, Client, facture, facture_fornisseur, Fournisseur, list_fv, list_v, Product, Ventes } from '../service/interface';
import { FournisseurService } from '../service/FournisseurService';
import { VenteService } from '../service/VenteService';
import { FactureFoService } from '../service/FactureFoService';
import { FactureService } from '../service/FactureServices';
import { ProductService } from '../service/ProductService';
import { blService } from '../service/BlService';
import { MeterItem } from 'primevue/metergroup';
import { ChargeService } from '../service/ChargeServices';
onMounted(async()=>{
    await ClientService.getClients().then(async (data:Client[]) =>{clients.value=data;}).catch((err:any)=>console.log(err));
    await FournisseurService.getFournisseurs().then(async (data:Fournisseur[]) =>{fournisseurs.value=data}).catch((err:any)=>console.log(err));
    await VenteService.get_vente().then(async (vdata:Ventes[]) =>{list_ventes.value =vdata;}).catch((err:any)=>console.log(err));
    await FactureFoService.get_factures().then(async (data:facture_fornisseur[]) =>{facturesfo.value=data;}).catch((err:any)=>console.log(err));
    await FactureService.get_factures().then(async (data:facture[]) =>{factures.value=data;}).catch((err:any)=>console.log(err));
    await ProductService.getProducts().then(async (data:Product[]) =>{products.value=data;}).catch((err:any)=>console.log(err));
    await ChargeService.getAll().then(async (data:Charge[])=>{
        data.forEach((ele:Charge)=>chargesfixe.value+=ele.type=="fixed" && ele.date?.split("/")[1] == formatMonth(new Date())? (ele.value || 0) : 0);
    }).catch((err:any)=>console.log(err));
    await blService.get_bls().then(async (data:bl[]) =>{bls.value=data;loading.value=false}).catch((err:any)=>console.log(err));

    value1.value[0].label=products.value[0].name!;
    products.value.forEach((ele:Product)=>{vproduct.value+=ele.prix_v && ele.quantite?ele.prix_v*ele.quantite:0});
    list_ventes.value.forEach((ele:Ventes)=>ele.date?.includes(formatMonth(new Date)) && ele.montant?vpasse.value+=ele.montant:0);
    list_ventes.value.forEach((ele:Ventes)=> ele.montant && ele.date && ele.date?.includes(formatYear(new Date))?cas.value[Number(ele.date.split("/")[1])-1]+=ele.montant:0);
    bls.value.forEach((ele:bl)=> ele.price && ele.date && ele.date?.includes(formatYear(new Date))?cas.value[Number(ele.date.split("/")[1])-1]+=ele.price:0);
    vnt.value=vpasse.value;
    bls.value.forEach((ele:bl)=>{ele.date?.includes(formatMonth(new Date()))&& ele.price? vpasse.value+=ele.price:0; });
    products.value.forEach((ele:Product)=>{
        let per=0;

        bls.value.forEach((el:bl)=>el.date?.includes(formatMonth(new Date())) ?el.list.forEach((l:list_fv)=>{l.name == ele.name ?per+=l.price && l.qte ? l.price*l.qte:0:0;l.name == ele.name ?marges.value+=l.price && l.qte && ele.prix_v ? (l.price-ele.prix_v)*l.qte:0:0; }):0 );
        list_ventes.value.forEach((el:Ventes)=>el.date?.includes(formatMonth(new Date())) ?el.list?.forEach((l:list_v)=>{l.name== ele.name ?per+=l.price && l.qte ?l.price*l.qte:0:0;l.name == ele.name ?marges.value+=l.price && l.qte && ele.prix_v ? (l.price-ele.prix_v)*l.qte:0:0;} ):0)
        if(Math.floor((per/vpasse.value)*100)>=value1.value[0].value){
            value5.value=value4.value.slice();
            value4.value=value3.value.slice();
            value3.value=value2.value.slice();
            value2.value=value1.value.slice();
            value1.value[0].label=ele.name!;
            value1.value[0].value=Math.floor((per/vpasse.value)*100);
            
        }else if(Math.floor((per/vpasse.value)*100)>=value2.value[0].value){

            value5.value=value4.value.slice();
            value4.value=value3.value.slice();
            value3.value=value2.value.slice();
            value2.value[0].label=ele.name!;
            value2.value[0].value=Math.floor((per/vpasse.value)*100);
        }else if(Math.floor((per/vpasse.value)*100)>=value3.value[0].value){
        console.log(Math.floor((per/vpasse.value)*100));

            value5.value=value4.value.slice();
            value4.value=value3.value.slice();
            value3.value[0].label=ele.name!;
            value3.value[0].value=Math.floor((per/vpasse.value)*100);
        }else if(Math.floor((per/vpasse.value)*100)>=value4.value[0].value){
        console.log(Math.floor((per/vpasse.value)*100));

            value5.value=value4.value.slice();
            value4.value[0].label=ele.name!;
            value4.value[0].value=Math.floor((per/vpasse.value)*100);
        }else if(Math.floor((per/vpasse.value)*100)>=value4.value[0].value){
        console.log(Math.floor((per/vpasse.value)*100));

            value5.value[0].label=ele.name!;
            value5.value[0].value=Math.floor((per/vpasse.value)*100);
        }
    });
    clients.value.forEach((ele:Client)=>clientDebt.value+=(ele.debt || 0));
    fournisseurs.value.forEach((ele:Fournisseur)=>fournisseurDebt.value+=(ele.debt || 0));

    chartData.value=setChartData();
    chartOptions.value=setChartOptions();
});

const value1 = ref<MeterItem[]>([{ label: '', value: 0, color: 'var(--p-primary-color)',icon:"pi pi-box" }]);
const value2 = ref<MeterItem[]>([{ label: '', value: 0, color: 'var(--p-primary-color)',icon:"pi pi-box" }]);
const value3 = ref<MeterItem[]>([{ label: '', value: 0, color: 'var(--p-primary-color)' ,icon:"pi pi-box"}]);
const value4 = ref<MeterItem[]>([{ label: '', value: 0, color: 'var(--p-primary-color)',icon:"pi pi-box" }]);
const value5 = ref<MeterItem[]>([{ label: '', value: 0, color: 'var(--p-primary-color)' ,icon:"pi pi-box"}]);

const chartData = ref();
const chartOptions = ref();
const labels:string[] = ["Jan","Fév","Mar","Avr","Mai","Juin","Jui","Aou","Sep","Oct","Nov","Dec"];
const setChartData = () => {
    return {
        labels: labels,
        datasets: [
            {
                label: 'Chiffre D\'affair',
                data: cas.value,
                borderWidth: 2,
            }
        ]
    };
};
const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('#000');
    const textColorSecondary = documentStyle.getPropertyValue('#212121');
    const surfaceBorder = documentStyle.getPropertyValue('#222');

    return {
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
}
const cas = ref<number[]>([0,0,0,0,0,0,0,0,0,0,0,0]);
const vnt = ref(0);
const loading =ref(true);
const bls = ref<bl[]>([])
const clients = ref<Client[]>([]);
const fournisseurs = ref<Fournisseur[]>([]); 
const list_ventes=ref<Ventes[]>([]);
const facturesfo = ref<facture_fornisseur[]>([]);
const factures = ref<facture[]>([]);
const products = ref<Product[]>([]);
const vproduct=ref(0);
const vpasse =ref(0);
const chargesfixe = ref(0);
const marges = ref(0);
const clientDebt = ref(0);
const fournisseurDebt = ref(0);
    const formatCurrency = (value:any) => {
    if(value)
        return value.toLocaleString('fr-FR', {style: 'currency', currency: 'TND'});
    return " 0.000 TND";
};
const formatMonth = (value:any) => {
    return value.toLocaleDateString('fr-FR', {
        month: '2-digit',
        year: 'numeric'
    });
}
const formatYear = (value:any) => {
    return value.toLocaleDateString('fr-FR', {
        year: 'numeric'
    });
}
</script>
<template>
<Card>
<div class="flex flex-wrap flex-row gap-8">
<div class="cardBoard">
    <div class="title">
        
        <p class="title-text">
            Valeur Articles
                </p>
        <p class="percent">
          <i class="pi pi-box"></i>
        </p>
    </div>
    <div class="data">
        <p>
            {{formatCurrency(vproduct)}}
        </p>
        
        <div class="range">
            <div class="fill">
            </div>
        </div>
    </div>
</div>
    
<div class="cardBoard">
    <div class="title">
        
        <p class="title-text">
            Chiffre d'affaire
           <strong>

           {{ formatMonth(new Date) }}
           </strong> 
                </p>
        <p class="percent">
          <i class="pi pi-dollar"></i>
        </p>
    </div>
    <div class="data">
        <p>
            {{formatCurrency(vpasse)}}
        </p>
        
        <div class="range">
            <div class="fill">
            </div>
        </div>
    </div>
</div>
<div class="cardBoard">
    <div class="title">
        
        <p class="title-text">
            ROI 
                </p>
        <p class="percent">
          <i class="pi pi-chart-line"></i>
        </p>
    </div>
    <div class="data">
        <p>
            {{(vpasse/(vproduct+vpasse))*100}}%
        </p>
        <div class="range">
            <div class="fill">
            </div>
        </div>
    </div>
</div>
<div class="cardBoard">
    <div class="title">
        
        <p class="title-text">
            Panier Moyen
                </p>
        <p class="percent">
          <i class="pi pi-box"></i>
        </p>
    </div>
    <div class="data">
        <p>
            {{formatCurrency(vnt/list_ventes.length)}}
        </p>
        
        <div class="range">
            <div class="fill">
            </div>
        </div>
    </div>
</div>
<div class="cardBoard">
<Chart type="bar" style="width: 750px;" :data="chartData" :options="chartOptions" />
</div>
<div class="cardBoard flex flex-col flex-wrap gap-6" >
    <h1 class=" text-black font-mono font-bold">#5 Articles</h1>
    <MeterGroup style="color: black;" :value="value1" />
    <MeterGroup style="color: black;" :value="value2" />
    <MeterGroup style="color: black;" :value="value3" />
    <MeterGroup style="color: black;" :value="value4" />
    <MeterGroup style="color: black;" :value="value5" />

</div>

<div class="cardBoard">
    <div class="title">
        
        <p class="title-text">
            Bénéfice 
            <strong>

{{ formatMonth(new Date) }}
</strong>   
                </p>

        <p class="percent">
          <i class="pi pi-chart-line"></i>
        </p>
    </div>
    <div class="data">
        <p>
            {{formatCurrency(marges-chargesfixe)}}
        </p>
        <div class="range">
            <div class="fill">
            </div>
        </div>
    </div>
</div>
<div class="cardBoard">
    <div class="title">
        
        <p class="title-text">
            Crédit Client 
                </p>
        <p class="percent">
          <i class="pi pi-chart-line"></i>
        </p>
    </div>
    <div class="data">
        <p color="red">
           - {{formatCurrency(clientDebt)}}
        </p>
        <div class="range">
            <div class="fill">
            </div>
        </div>
    </div>
</div>
<div class="cardBoard">
    <div class="title">
        
        <p class="title-text">
            Crédit Fournisseur 
                </p>
        <p class="percent">
          <i class="pi pi-chart-line"></i>
        </p>
    </div>
    <div class="data">
        <p color="green">
           + {{formatCurrency(fournisseurDebt
           )}}
        </p>
        <div class="range">
            <div class="fill">
            </div>
        </div>
    </div>
</div>


</div>

</Card>
</template>
<style>

.cardBoard {
  padding: 1rem;
  background-color: #fff;
  min-width: 320px;
  border-radius: 20px;
  box-shadow: 10px 10px #323232;
  border: 3px solid #323232;
}

.title {
  display: flex;
  align-items: center;
}

.title span {
  position: relative;
  padding: 0.5rem;
  background-color: #10B981;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
}

.title span {

position: relative;
  padding: 0.5rem;
  background-color: #10B981;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
}

.title-text {
  margin-left: 0.5rem;
  color: #374151;
  font-size: 18px;
}

.percent {
  margin-left: 0.5rem;
  color: #02972f;
  font-weight: 600;
  display: flex;
}

.data {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.data p {
  margin-top: 1rem;
  margin-bottom: 1rem;
  color: #1F2937;
  font-size: 2.25rem;
  line-height: 2.5rem;
  font-weight: 700;
  text-align: left;
}

.data .range {
  position: relative;
  background-color: #E5E7EB;
  width: 100%;
  height: 0.5rem;
  border-radius: 0.25rem;
}

.data .range .fill {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #10B981;
  width: 100%;
  height: 100%;
  border-radius: 0.25rem;
}
</style>