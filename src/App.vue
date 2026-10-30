<script setup lang="ts">
import { invoke } from '@tauri-apps/api/tauri'
import { ask } from '@tauri-apps/api/dialog'
import Database from 'tauri-plugin-sql-api';
import 'primeicons/primeicons.css'
import StokPage from './pages/StokPage.vue';
import { ref } from 'vue';
import ClientPage from './pages/ClientPage.vue';
import FournisseurPage from './pages/FournisseurPage.vue';
import VentePage from './pages/VentePage.vue';
import FacturePage from './pages/FacturePage.vue';
import BlPage from './pages/BlPage.vue';
import FactureFOPage from './pages/FactureFOPage.vue';
import Dashboard from './pages/Dashboard.vue';
import { exit } from '@tauri-apps/api/process';
import PaimentClientPage from './pages/PaimentClientPage.vue';
import PaimentFourneurPage from './pages/PaimentFourneurPage.vue';
import SettingPage from './pages/SettingPage.vue';
import ChargePage from './pages/ChargePage.vue';

const menu = [
  { id: 0, title: 'Tableau de bord', icon: 'pi-home' },
  { id: 1, title: 'Stock', icon: 'pi-warehouse' },
  { id: 2, title: 'Ventes', icon: 'pi-receipt' },
  { id: 3, title: 'Factures', icon: 'pi-cart-plus' },
  { id: 4, title: 'Bon de livraison', icon: 'pi-truck' },
  { id: 5, title: 'Factures Achat', icon: 'pi-cart-minus' },
  { id: 6, title: 'Clients', icon: 'pi-address-book' },
  { id: 7, title: 'Fournisseurs', icon: 'pi-address-book' },
  { id: 8, title: 'Paiement Client', icon: 'pi-wallet' },
  { id: 9, title: 'Paiement Fournisseur', icon: 'pi-wallet' },
  { id: 11, title: 'Charges', icon: 'pi-asterisk' },
];
const settings = { id: 10, title: 'Paramètres', icon: 'pi-wrench' };
const page = ref(0);
const pagetitle = ref(menu[0].title);
const go = (item: { id: number, title: string }) => {
  page.value = item.id;
  pagetitle.value = item.title;
};
const quit = async () => {
  if (await ask('Quitter GestCashier ?', { title: 'Quitter', type: 'warning' })) {
    await exit(0);
  }
};

// First launch -> sign-up, otherwise -> login
document.addEventListener('DOMContentLoaded', async () => {
  await new Promise(r => setTimeout(r, 1500));
  try {
    const db = await Database.load("sqlite:cashier.db");
    const result = await db.select("SELECT * from users;");
    await db.close();
    const data = JSON.parse(JSON.stringify(result));
    if (data.length == 0) {
      invoke("open_singup");
    } else {
      invoke("open_login");
    }
  } catch (err) {
    console.error("Impossible d'ouvrir la base de données :", err);
  }
});
document.body.style.zoom = "0.62"
</script>

<template>
  <nav>
    <div class="logo">
      <i class="pi pi-objects-column menu-icon"></i>
      <span class="logo-name">GestCashier</span>
    </div>
    <div class="sidebar">
      <div class="sidebar-content">
        <ul class="lists">
          <li v-for="item in menu" :key="item.id" class="list" :class="{ active: page === item.id }" @click="go(item)">
            <a href="#" class="nav-link" @click.prevent>
              <i class="pi icon" :class="item.icon"></i>
              <span class="link">{{ item.title }}</span>
            </a>
          </li>
        </ul>
        <div class="bottom-cotent lists">
          <li class="list" :class="{ active: page === settings.id }" @click="go(settings)">
            <a href="#" class="nav-link" @click.prevent>
              <i class="pi icon" :class="settings.icon"></i>
              <span class="link">{{ settings.title }}</span>
            </a>
          </li>
          <li class="list" @click="quit">
            <a href="#" class="nav-link" @click.prevent>
              <i class="pi pi-sign-out icon"></i>
              <span class="link">Quitter</span>
            </a>
          </li>
        </div>
      </div>
    </div>
  </nav>
  <div class="page">
    <h1 class="brutalist-heading">{{ pagetitle }}</h1>
    <Dashboard v-if="page == 0"></Dashboard>
    <StokPage v-if="page == 1"></StokPage>
    <VentePage v-if="page == 2"></VentePage>
    <FacturePage v-if="page == 3"></FacturePage>
    <BlPage v-if="page == 4"></BlPage>
    <FactureFOPage v-if="page == 5"></FactureFOPage>
    <ClientPage v-if="page == 6"></ClientPage>
    <FournisseurPage v-if="page == 7"></FournisseurPage>
    <PaimentClientPage v-if="page == 8"></PaimentClientPage>
    <PaimentFourneurPage v-if="page == 9"></PaimentFourneurPage>
    <ChargePage v-if="page == 11"></ChargePage>
    <SettingPage v-if="page == 10"></SettingPage>
  </div>
</template>

<style scoped>

.brutalist-heading {
  position: absolute;
  top: -80px;
  font-size: 40px;
  font-weight: bold;
  color: #000;
  background-color: #c1e9dd;
  padding: 5px 10px;
  transform: rotate(-1deg);
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 5px 5px 0 #000, 10px 10px 0 #111;
}
.page{
  position: relative;
  margin-left: 280px;
  margin-top: 100px;
}
nav {
  position: fixed;
  top: 0;
  left: 0;
  height: 70px;
  width: 100%;
  display: flex;
  align-items: center;
  background: #212121;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.1);
}
nav .logo {
  display: flex;
  align-items: center;
  margin: 0 24px;
}
.logo .menu-icon {
  color: #eee;
  font-size: 24px;
  margin-right: 14px;
  cursor: pointer;
}
.logo .logo-name {
  color: #eee;
  font-size: 22px;
  font-weight: 500;
}
nav .sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 260px;
  padding: 20px 0;
  background-color: #2121;
  box-shadow: 0 5px 1px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease;
}
.sidebar .sidebar-content {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  padding: 30px 16px;
}
.sidebar-content .list {
  list-style: none;
}
.list .nav-link {
  display: flex;
  align-items: center;
  margin: 8px 0;
  padding: 14px 12px;
  border-radius: 8px;
  text-decoration: none;
}
.lists .nav-link:hover,
.list.active .nav-link {
  background-color: #c1e9dd;
}
.nav-link .icon {
  margin-right: 14px;
  font-size: 20px;
  color: #707070;
}
.nav-link .link {
  font-size: 16px;
  color: #707070;
  font-weight: 400;
}
.lists .nav-link:hover .icon,
.lists .nav-link:hover .link,
.list.active .icon,
.list.active .link {
  color: #212121;
}
</style>