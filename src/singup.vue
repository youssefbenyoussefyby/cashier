<script setup lang="ts">
import Database from 'tauri-plugin-sql-api';
import { ref } from 'vue';
import bcrypt from 'bcryptjs';
import {v4 as uuid } from 'uuid';
import { invoke } from '@tauri-apps/api';
const name = ref("");
const tele = ref("");
const address = ref("");
const email = ref("");
const matr = ref("");
const fact = ref("");
const user = ref("");
const passwd = ref("");
const error= ref("");
const isloading = ref(false);

async function singup() {
    try{
      if(name.value=="" || tele.value=="" || address.value=="" || email.value=="" || matr.value=="" || fact.value=="" || user.value=="" || passwd.value==""){
        error.value="les informations sont obligatoires";
      }else{
        isloading.value=true;
      const db = await Database.load("sqlite:cashier.db");
db.execute("INSERT INTO info(company_name,matricule_fiscale,adresse,email,tel,numero_f)VALUES($1,$2,$3,$4,$5,$6);",[
name.value,matr.value,address.value,email.value,tele.value,fact.value
      ]).catch((err)=>error.value="!!!"+err);
      const id =  Math.floor(Math.random() * 10000000000000);
      const password = await bcrypt.hash(passwd.value,10);
      const access = uuid();
      await db.close();
      const db1 = await Database.load("sqlite:cashier.db");
      db1.execute("INSERT INTO users(id,identifier,password,access,role)VALUES($1,$2,$3,$4,'admin');",[
      id,user.value,password,access
      ]).catch((err)=>error.value="!!!"+err);
      db1.close()
      invoke("open_main");
      error.value="done";
      isloading.value=false;
      }

    }catch(err){
      isloading.value=false;
    }
}
</script>


<template>
    <div class="app">
  
  <div class="form">
    <h1 class="brutalist-heading">inscrit</h1>
      <div class="brutalist-container">
  <input
    placeholder="Nom"
    class="brutalist-input smooth-type"
    type="text"
    v-model="name"
  />
  <label class="brutalist-label">Nom de ste</label>
</div>
<div class="brutalist-container">
  <input
    placeholder="Numéro"
    class="brutalist-input smooth-type"
    type="text"
    v-model="tele"
  />
  <label class="brutalist-label">Numéro telephone</label>
</div>

    
<div class="brutalist-container">
  <input
    placeholder="Adresse"
    class="brutalist-input smooth-type"
    type="text"
    v-model="address"
  />
  <label class="brutalist-label">Adresse</label>
</div>
<div class="brutalist-container">
  <input
    placeholder="Email"
    class="brutalist-input smooth-type"
    type="text"
    v-model="email"
  />
  <label class="brutalist-label">Email</label>
</div>
<div class="brutalist-container">
  <input
    placeholder="Matricule"
    class="brutalist-input smooth-type"
    type="text"
    v-model="matr"
  />
  <label class="brutalist-label">Matricule Fiscale</label>
</div>
<div class="brutalist-container">
  <input
    placeholder="N°"
    class="brutalist-input smooth-type"
    type="text"
    v-model="fact"
  />
  <label class="brutalist-label">Numéro de factures</label>
</div>
  <div class="brutalist-container">
  <input
    placeholder="ID"
    class="brutalist-input smooth-type"
    type="text"
    v-model="user"
  />
  <label class="brutalist-label">ID (admin)</label>
</div>
<div class="brutalist-container">
  <input
    placeholder="********"
    class="brutalist-input smooth-type"
    type="password"
    v-model="passwd"
    />
  <label class="brutalist-label">MOT DE PASSE</label>
</div>
<button @click="singup()">
  <div class='loader' v-if="isloading"></div>
  <span class='button_top' v-if="!isloading"> Connecter</span>


</button>
<span class="error">{{ error }}</span>
</div>
</div>
</template>
<style lang="css">
.error{
  color: red;
  font-size: 20px;
  font-weight: bold;
}
.app{
    border-radius: 40px;
    backdrop-filter: blur(20px);
    height:100%;
    width:100%;
    background:#212121;
    display: flex;
    gap: 20px;
    justify-content: center;
padding: 50px;

}
.brutalist-container {
  position: relative;
  width:300px;
  font-family: monospace;
}
.form{
  margin-top: 10%;
  gap: 30px;
  width: 60%;
  display: flex;
  flex-wrap: wrap;

}
.brutalist-input {
  margin-top: 20%;
  width: 100%;
  padding: 15px;
  font-size: 18px;
  font-weight: bold;
  color: #000;
  background-color: #fff;
  border: 4px solid #000;
  position: relative;
  overflow: hidden;
  border-radius: 0;
  outline: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 5px 5px 0 #000, 10px 10px 0 #e4cded;
}

@keyframes glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
}

.brutalist-input:focus {
  animation: focus-pulse 4s cubic-bezier(0.25, 0.8, 0.25, 1) infinite,
    glitch 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) infinite;
}

.brutalist-input:focus::after {
  content: "";
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: white;
  z-index: -1;
}

.brutalist-input:focus::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  z-index: -2;
  clip-path: inset(0 100% 0 0);
  animation: glitch-slice 4s steps(2, end) infinite;
}

@keyframes glitch-slice {
  0% {
    clip-path: inset(0 100% 0 0);
  }
  10% {
    clip-path: inset(0 5% 0 0);
  }
  20% {
    clip-path: inset(0 80% 0 0);
  }
  30% {
    clip-path: inset(0 10% 0 0);
  }
  40% {
    clip-path: inset(0 50% 0 0);
  }
  50% {
    clip-path: inset(0 30% 0 0);
  }
  60% {
    clip-path: inset(0 70% 0 0);
  }
  70% {
    clip-path: inset(0 15% 0 0);
  }
  80% {
    clip-path: inset(0 90% 0 0);
  }
  90% {
    clip-path: inset(0 5% 0 0);
  }
  100% {
    clip-path: inset(0 100% 0 0);
  }
}

.brutalist-label {
  position: absolute;
  left: -3px;
  top: 25px;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  background-color: #000;
  padding: 5px 10px;
  transform: rotate(-1deg);
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.brutalist-heading {
  position: absolute;
  left: 50px;
  top: 50px;
  font-size: 40px;
  font-weight: bold;
  color: #000;
  background-color: #e4cded;
  padding: 5px 10px;
  transform: rotate(-1deg);
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 5px 5px 0 #000, 10px 10px 0 #111;
}
.brutalist-input:focus + .brutalist-label {
  transform: rotate(0deg) scale(1.05);
  background-color: #747474;
}

.smooth-type {
  position: relative;
  overflow: hidden;
}

.smooth-type::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(90deg, #fff 0%, rgba(255, 255, 255, 0) 100%);
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.smooth-type:focus::before {
  opacity: 1;
  animation: type-gradient 2s linear infinite;
}

@keyframes type-gradient {
  0% {
    background-position: 300px 0;
  }
  100% {
    background-position: 0 0;
  }
}

.brutalist-input::placeholder {
  color: #888;
  transition: color 0.3s ease;
}

.brutalist-input:focus::placeholder {
  color: transparent;
}

.brutalist-input:focus {
  animation: focus-pulse 4s cubic-bezier(0.25, 0.8, 0.25, 1) infinite;
}

@keyframes focus-pulse {
  0%,
  100% {
    border-color: #000;
  }
  50% {
    border-color: #747474;
  }
}
button {
  /* Variables */
  --button_radius: 0.75em;
  --button_color: #e4cded;
  --button_outline_color: #000000;
  font-size: 17px;
  font-weight: bold;
  border: none;
  border-radius: var(--button_radius);
  background: var(--button_outline_color);
  width: 100%;
}

.button_top {
  margin-top: 50px;
  display: block;
  box-sizing: border-box;
  border: 2px solid var(--button_outline_color);
  border-radius: var(--button_radius);
  padding: 0.75em 1.5em;
  background: var(--button_color);
  color: var(--button_outline_color);
  transform: translateY(-0.2em);
  transition: transform 0.1s ease;
}

button:hover .button_top {
  /* Pull the button upwards when hovered */
  transform: translateY(-0.33em);
}

button:active .button_top {
  /* Push the button downwards when pressed */
  transform: translateY(0);
}
.loader {
  width: 16px;
  height: 16px;
  box-shadow: 0 30px, 0 -30px;
  border-radius: 4px;
  background: currentColor;
  display: block;
  position: relative;
  transform: translate(-150%, -20px);
  color: #FFF;
  box-sizing: border-box;
  animation: animloader 2s ease infinite;
}

.loader::after,
.loader::before {
  content: '';
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  box-shadow: 0 30px, 0 -30px;
  border-radius: 4px;
  background: currentColor;
  color: #FFF;
  position: absolute;
  left: 30px;
  top: 0;
  animation: animloader 2s 0.2s ease infinite;
}

.loader::before {
  animation-delay: 0.4s;
  left: 60px;
}

@keyframes animloader {
  0% {
    top: 0;
    color: white;
  }

  50% {
    top: 30px;
    color: rgba(255, 255, 255, 0.2);
  }

  100% {
    top: 0;
    color: white;
  }
}

</style>