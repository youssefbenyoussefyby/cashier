<script setup lang="ts">
import Database from 'tauri-plugin-sql-api';
import { ref } from 'vue';
import Toast from 'primevue/toast';
import bcrypt from "bcryptjs";
import { invoke } from '@tauri-apps/api';
 const err = ref("");
const id = ref("");
const passwd = ref('');







 async function login() {
  

  try{
    const db = await Database.load("sqlite:cashier.db");
    const res = await db.select("SELECT * FROM users WHERE identifier =$1;",[
      
    id.value]);
    await db.close();
    const user = JSON.parse(JSON.stringify(res));
    if(user.length==1){
      if(await bcrypt.compare(passwd.value,user[0]["password"])){
      invoke("open_main");
    }
    }
err.value="les informations d'identification invalides";
  }catch(err){
    console.log(err);
  }
}
    
</script>


<template>

<div class="app">
  <Toast position="top-left" />
  <div class="form">
    <h1 class="brutalist-heading">Connecter</h1>
  <div class="brutalist-container">
  <input
    placeholder="ID"
    class="brutalist-input smooth-type"
    type="text"
    v-model="id"
    name="id"
  />
  <label class="brutalist-label">ID</label>
</div>
<div class="brutalist-container">
  <input
    placeholder="********"
    class="brutalist-input smooth-type"
    type="password"
    name="passwd"
v-model="passwd"
  />
  <label class="brutalist-label">MOT DE PASSE</label>
</div>
<button @click="login()">
  <span class="button_top"> Connecter
  </span>
</button>
<span class="err">{{ err }}</span>
</div>
</div>
</template>
<style>
.err{
  color: red;
  font-size: 20px;
  font-weight: bold;
}
.app{
    border-radius: 5%;
    backdrop-filter: blur(20px);
    height:800px;
    width:800px;
    background:#212121;
    display: flex;
    gap: 20px;
    justify-content: center;

}
.brutalist-container {
  position: relative;
  width:100%;
  font-family: monospace;
}
.form{
  margin-top: 20%;
  gap: 30px;
  width: 60%;
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
  top: 45px;
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
  margin-top: 20%;
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

</style>