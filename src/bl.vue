<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { blService } from './service/BlService';
import { Client, bl, infomations, list_fv } from './service/interface';
import { InfomationService } from './service/InformationService';

const invoice = ref("");
const tottva = ref(0);
const totloi = ref(0);
const fact = ref<bl>({list:[],client:{}})
const client = ref<Client>({});
const ginfo =ref<infomations>({});
  const formatCurrency = (value:any) => {
    if(value)
        return value.toLocaleString('fr-FR', {style: 'currency', currency: 'TND'});
    return " 0,000 TND";
};
const calcTva = ()=>{
   return fact.value.list.forEach((ele:list_fv)=>{console.log('el'+ele.loi_47_2023),totloi.value+=ele.loi_47_2023 && ele.qte ? ele.loi_47_2023*ele.qte : 0})
}
const calcLoi = ()=>{
  fact.value.list.forEach((ele:list_fv)=>tottva.value+=ele.price&& ele.qte ?ele.price*ele.qte*Number(ele.tva)*0.01/(1+Number(ele.tva)*0.01):0)

}
onMounted( async () => {

    const data = JSON.parse(localStorage.getItem('data')!.toString());
    invoice.value=data.key;
    await blService.get_bl(invoice.value).then(async(ele:any)=>{fact.value=ele;client.value=fact.value.client;ginfo.value=await InfomationService.get();calcTva();calcLoi();console.log(ele);print()});
    
});

function dateEnLettres(dateStr:string) {
    const jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    const [jour, moisNum, annee] = dateStr.split('/').map(Number);
    const date = new Date(annee, moisNum - 1, jour);
    const jourSemaine = jours[date.getDay()];
    const moisNom = mois[moisNum - 1];

    return `${jourSemaine} ${jour} ${moisNom} ${annee}`;
}
function enLettres(n:number) {
    if (isNaN(n)) return "Montant invalide";

    const unite = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    const dizaine = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];
    const dizaine10_19 = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    
    function chiffreEnLettres(num:number):string {
        if (num === 0) return "zéro";
        if (num < 10) return unite[num];
        if (num < 20) return dizaine10_19[num - 10];
        if (num < 100) {
            let dix = Math.floor(num / 10);
            let unit = num % 10;
            return dizaine[dix] + (unit > 0 ? (dix === 7 || dix === 9 ? " " + dizaine10_19[unit] : " " + unite[unit]) : "");
        }
        if (num < 1000) {
            let cent = Math.floor(num / 100);
            let reste = num % 100;
            return (cent > 1 ? unite[cent] + " Cent" : "Cent") + (reste > 0 ? " " + chiffreEnLettres(reste) : "");
        }
        if (num < 1000000) {
            let mille = Math.floor(num / 1000);
            let reste = num % 1000;
            return (mille > 1 ? chiffreEnLettres(mille) + " Mille" : "Mille") + (reste > 0 ? " " + chiffreEnLettres(reste) : "");
        }
        return "Montant trop grand";
    }

    let dinars = Math.floor(n);
    let millimes = Math.round((n - dinars) * 1000);

    let texte = chiffreEnLettres(dinars) + " Dinars Tunisien";
    if (millimes > 0) {
        texte += " et " + chiffreEnLettres(millimes) + " Millimes";
    }

    return texte;
}



</script>
<template>


  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title> Facture</title>
  <meta name="robots" content="noindex,nofollow" />
  <meta name="viewport" content="width=device-width; initial-scale=1.0;" />
  
  
  
  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" align="center" class="fullTable" bgcolor="#fff">
    <tr>
      <td height="10"></td>
    </tr>
    <tr>
      <td>
        <table width="900" id="toPrint" cellpadding="0" cellspacing="0" align="center" class="fullTable" bgcolor="#ffffff" style="border-radius: 10px 10px 0 0;">
          <tr class="hiddenMobile">
            <td height="20"></td>
          </tr>
          <tr class="visibleMobile">
            <td height="10"></td>
          </tr>
  
          <tr>
            <td>
              <table width="780" cellpadding="0" cellspacing="0" align="center" class="fullPadding">
                <tbody>
                  <tr>
                    <td>
                      <table width="370" cellpadding="0" cellspacing="0" align="left" class="col">
                        <tbody>
                          <tr>
                            <td align="left"> <img src="./assets/Gateau Shopping_Logo.jpg" width="50" height="50" alt="" /></td>
                          </tr>
                          <tr class="hiddenMobile">
                            <td height="40"></td>
                          </tr>
                          <tr class="visibleMobile">
                            <td height="20"></td>
                          </tr>
                          <tr>
                            <td style="font-size: 14px; color: #5b5b5b; font-family: 'Open Sans', sans-serif; line-height: 18px; vertical-align: top; text-align: left;">
                              Salut, {{ client.name }}
                              <br> Merci d'avoir choisi de faire vos achats chez nous !
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table width="370" cellpadding="0" cellspacing="0" align="right" class="col">
                            <tbody>
                              <tr class="visibleMobile">
                                <td height="20"></td>
                              </tr>
                             
                              <tr>
                                <td width="100%" height="10"></td>
                              </tr>
                              <tr>
                                <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #5b5b5b; line-height: 20px; vertical-align: top; border:2px solid #e4e4e4;padding: 10px;border-radius: 10px;">
                                  <strong>Code Client:</strong>  {{client.ref}}<br><strong>Matricule Fiscale:</strong> {{ client.matr }}<br> <strong>Adresse:</strong>{{ client.address }}<br> <strong>Email:</strong>{{ client.email }}<br> T: {{ client.tele }}
  
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <!-- /Header -->
  <!-- Information
  
  
  
  -->
  
  <table width="100%" cellpadding="0" cellspacing="0" align="center" class="fullTable" bgcolor="#fff">
    <tbody>
      <tr>
        <td>
          <table width="900" cellpadding="0" cellspacing="0" align="center" class="fullTable" bgcolor="#ffffff">
            <tbody>
  
              <tr class="hiddenMobile">
                <td height="10"></td>
              </tr>
              <tr class="visibleMobile">
                <td height="5"></td>
              </tr>
              <tr>
                <td>
                  <table width="780" cellpadding="0" cellspacing="0" align="center" class="fullPadding">
                    <tbody>
                      <tr>
                        <td>
                          <table width="370" cellpadding="0" cellspacing="0" align="left" class="col">
  
                            <tbody>
  
                              <tr>
                                <td width="100%" height="10"></td>
                              </tr>
                              <tr>
                                <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #5b5b5b; line-height: 20px; vertical-align: top;border:2px solid #e4e4e4;padding: 10px;border-radius: 10px; ">
                                <br/><strong>Matricule Fiscale:</strong> {{ ginfo.matr }}<br> <strong>Adresse:</strong>{{ ginfo.adresse }}<br> <strong>Email:</strong>{{ ginfo.email }}<br> T: {{ ginfo.tele }}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table width="370" cellpadding="0" cellspacing="0" align="right" class="col">
                            <tbody>
                             
  
                              <tr>
                                <td width="100%" height="10"></td>
                              </tr>
                              <tr>
                                <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #5b5b5b; line-height: 20px; vertical-align: top; border:2px solid #e4e4e4;padding: 10px;border-radius: 10px;">
                                  <br>
                                  <strong>Mode De Paiement:</strong>{{ fact.mode_payment }}<br> <strong>Chauffeur:</strong> {{ fact.chaufeur }}<br> <strong>Vehicule</strong> <a href="#" style="color: #134B70; text-decoration:underline;">{{ fact.vehicule }}</a><br>
                                  <br>
                                  
                                </td>
                              </tr>
                            </tbody>
                          </table>
  <table width="780" cellpadding="0" cellspacing="0" align="center" class="fullPadding">
                    <tbody>
                      <tr class="hiddenMobile">
                            <td height="10"></td>
                          </tr>
                          <tr class="visibleMobile">
                            <td height="5"></td>
                          </tr>
                      <tr>
                        <td>
  
                          <table width="370" cellpadding="0" cellspacing="0" align="center" class="col">
                        <tbody>
                          <tr class="visibleMobile">
                            <td height="10"></td>
                          </tr>
                          <tr>
                            <td height="5"></td>
                          </tr>
                          <tr>
                            <td style="font-size: 21px; color: #134B70; letter-spacing: -1px; font-family: 'Open Sans', sans-serif; line-height: 1; vertical-align: top; text-align: center;">
                              Facture &ThickSpace;
                              <small style="font-size: 14px; color: #5b5b5b; font-family: 'Open Sans', sans-serif;">N°</small> <strong style="font-size: 14px; color: #5b5b5b; font-family: 'Open Sans', sans-serif;">{{ fact.numero }}</strong>&ThickSpace;
                             <small style="font-size: 14px; color: #5b5b5b; font-family: 'Open Sans', sans-serif;">Date:</small><strong style="font-size: 14px; color: #5b5b5b; font-family: 'Open Sans', sans-serif;">Le {{ dateEnLettres(fact.date?fact.date:"") }}</strong>&ThickSpace;
                            </td>
                          </tr>
                        </tbody>
                      </table> 
  
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  
                          <table width="370" cellpadding="0" cellspacing="0" align="right" class="col">
                            <tbody>
  
                              <tr>
                                <td width="100%" height="10"></td>
                              </tr>
                              <tr>
                                
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  <!-- /Information -->
  
  <!-- Order Details -->
  <table width="100%" cellpadding="0" cellspacing="0" align="center" class="fullTable" bgcolor="#fff">
    <tbody>
      <tr>
        <td>
          <table width="900" cellpadding="0" cellspacing="0" align="center" class="fullTable" bgcolor="#ffffff">
            <tbody>
              <tr class="hiddenMobile">
                <td height="10"></td>
              </tr>
              <tr class="visibleMobile">
                <td height="5"></td>
              </tr>
              <tr>
                <td>
                  <table width="800" cellpadding="5" cellspacing="5" align="center"  class="fullPadding">
                    <tbody class="fact">
                      <tr>
                        
                        <th style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #5b5b5b; font-weight: normal; line-height: 1; vertical-align: top; padding: 10px 10px 7px 0;background-color: #eee;border-width: 1px; border-color: #000;"  align="left">
                          Code Article
                        </th>
                        <th style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #5b5b5b; font-weight: normal; line-height: 1; vertical-align: top; padding: 10px 10px 7px 0;background-color: #eee;border-width: 1px; border-color: #000;" width="50%" align="left">
                          Article
                        </th>
                        <th style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #5b5b5b; font-weight: normal; line-height: 1; vertical-align: top; padding: 10px 10px 7px 0;background-color: #eee;border-width: 1px; border-color: #000;" width="7%"  align="center">
                          Qté
                        </th>
                        <th style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #5b5b5b; font-weight: normal; line-height: 1; vertical-align: top; padding: 10px 10px 7px 0;background-color: #eee;border-width: 1px; border-color: #000;"  align="left">
                          Prix UHT
                        </th>
                        <th style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #5b5b5b; font-weight: normal; line-height: 1; vertical-align: top; padding: 10px 10px 7px 0;background-color: #eee;border-width: 1px; border-color: #000;" width="7%"  align="left">
                          Rem
                        </th>
                        <th style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #5b5b5b; font-weight: normal; line-height: 1; vertical-align: top; padding: 10px 10px 7px 0;background-color: #eee;border-width: 1px; border-color: #000;" width="7%"  align="center">
                          TVA
                        </th>
                      </tr>
  
                      <template v-for="index in fact.list.length + 10 - fact.list.length%10" :key="index">
                        <tr v-if="(index-1) % 10 === 0 && index!=1" style="height: 150px;">
                        <td height="10" width="100"  style="border-width: 1px; border-bottom: 0;border-color: #000;"></td>
                        <td height="10" width="100"  style="border-width: 1px; border-bottom: 0;border-color: #000;"></td>
                        <td height="10" width="100"  style="border-width: 1px; border-bottom: 0;border-color: #000;"></td>
                        <td height="10" width="100"  style="border-width: 1px; border-bottom: 0;border-color: #000;"></td>
                        <td height="10" width="100"  style="border-width: 1px; border-bottom: 0;border-color: #000;"></td>
                        <td height="10" width="100"  style="border-width: 1px; border-bottom: 0;border-color: #000;"></td>

                      </tr>
                      <tr >
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #646a6e;  line-height: 18px;  vertical-align: top; padding:10px;border-bottom:1px solid #e4e4e4;border-width: 1px; border-color: #000;border-bottom: 0; border-top: 0;"><strong>{{ fact.list[index-1]? fact.list[index-1].code: "\t" }}</strong></td>
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #134B70;  line-height: 18px;  vertical-align: top; padding:10px;border-bottom:1px solid #e4e4e4;border-width: 1px; border-color: #000;border-bottom: 0; border-top: 0;" class="article">
                         {{  fact.list[index-1]? fact.list[index-1].name:"" }}
                        </td>
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #646a6e;  line-height: 18px;  vertical-align: top; padding:10px;border-bottom:1px solid #e4e4e4;border-width: 1px; border-color: #000;border-bottom: 0; border-top: 0;" align="center">{{  fact.list[index-1]? fact.list[index-1].qte:" " }}</td>
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #1e2b33;  line-height: 18px;  vertical-align: top; padding:10px;border-bottom:1px solid #e4e4e4;border-width: 1px; border-color: #000;border-bottom: 0; border-top: 0;" align="left">{{  fact.list && fact.list[index-1]?formatCurrency( fact.list[index-1].price &&  fact.list[index-1].tva? (fact.list[index-1].price || 0)/(1+ (fact.list[index-1].tva || 0)*0.01):0):" " }}</td>
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #1e2b33;  line-height: 18px;  vertical-align: top; padding:10px;border-bottom:1px solid #e4e4e4;border-width: 1px; border-color: #000;border-bottom: 0; border-top: 0;" align="right">{{  fact.remise!=null && fact.list[index-1]?fact.remise+"%":" " }}</td>

                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #1e2b33;  line-height: 18px;  vertical-align: top; padding:4px;border-bottom:1px solid #e4e4e4;border-width: 1px; border-color: #000;border-bottom: 0; border-top: 0;" align="center">{{ fact.list[index-1]? fact.list[index-1].tva? fact.list[index-1].tva:"0":" "}} {{ fact.list[index-1]?"%":" " }}</td>
                      </tr>
                      <tr v-if="(index) % 10 === 0">
                        <td height="10" width="100"  style="border-width: 1px; border-top: 0;border-color: #000;"></td>
                        <td height="10" width="100"  style="border-width: 1px; border-top: 0;border-color: #000;"></td>
                        <td height="10" width="100"  style="border-width: 1px; border-top: 0;border-color: #000;"></td>
                        <td height="10" width="100"  style="border-width: 1px; border-top: 0;border-color: #000;"></td>
                        <td height="10" width="100"  style="border-width: 1px; border-top: 0;border-color: #000;"></td>
                        <td height="10" width="100"  style="border-width: 1px; border-top: 0;border-color: #000;"></td>

                      </tr>
                      </template>
                 </tbody>
                  </table>
                </td>
              </tr>
            
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  <!-- /Order Details -->
  <!-- Total -->
  <table width="100%" cellpadding="0" cellspacing="0" align="center" class="fullTable" bgcolor="#fff">
    <tbody>
      <tr>
        <td>
          <table width="900" cellpadding="0" cellspacing="0" align="center" class="fullTable" bgcolor="#ffffff">
            <tbody>
              <tr>
                <td height="7"></td>
              </tr>
              <tr>
                <td>
  
                  <!-- Table Total -->
                  <table width="800" border="5" cellpadding="5" cellspacing="0" align="center" class="fullPadding">
                    <tbody>
                      <tr>
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:right; ">
                          Prix HT:
                        </td>
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:right; white-space:nowrap;border-width: 1px;border-color: #000;" width="80">
                          {{formatCurrency(fact.price ?fact.price-tottva:0)}}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:right; ">
                          TVA:
                        </td>
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:right;border-width: 1px;border-color: #000; ">
                          {{formatCurrency(tottva)}}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:right; ">
                          Timbre:
                        </td>
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:right;border-width: 1px;border-color: #000; ">
                          {{formatCurrency(1)}}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:right; ">
                          Remise:
                        </td>
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:right;border-width: 1px;border-color: #000; ">
                          {{formatCurrency((fact.price || 0) * (fact.remise || 0) / 100)}}
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td height="3"  style="border-bottom:3px solid #e4e4e4"></td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #000; line-height: 22px; vertical-align: top; text-align:right; ">
                          <strong>Prix TTC:</strong>
                        </td>
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #000; line-height: 22px; vertical-align: top; text-align:right; border-width: 1px;border-color: #000;">
                          <strong>{{ formatCurrency(fact.price?fact.price+1-(fact.price || 0) * (fact.remise || 0) / 100:0) }}</strong>
                        </td>
                      </tr>
                      <tr>
                <td height="20"></td>
              </tr>
                    </tbody>
                  </table>
                  <!-- /Table Total -->
  
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" align="center" class="fullTable" bgcolor="#fff">
    <tbody>
      <tr>
        <td>
          <table width="900" cellpadding="0" cellspacing="0" align="center" class="fullTable" bgcolor="#ffffff">
            <tbody>
              <tr>
                <td>
  
                  <!-- Table Total -->
                  <table width="780" border="5" cellpadding="5" cellspacing="0" align="center" class="fullPadding">
                    <tbody>
  
                      <tr style="padding: 10px;">
                        <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:left;" align="left">
                          Arrété la présente facture à la somme de : <strong>   {{enLettres(fact.price?fact.price+totloi+1-(fact.price || 0) * (fact.remise || 0) / 100:0)}}</strong>.
                        </td>
                        
                        
                      </tr>
                     
                    </tbody>
                  </table>
                  <!-- /Table Total -->
  
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" align="center" class="fullTable" bgcolor="#fff">
    <tbody>
      <tr>
        <td>
          <table width="900" cellpadding="0" cellspacing="0" align="center" class="fullTable" bgcolor="#ffffff">
            <tbody>
              <tr>
                <td>
  
                  <!-- Table Total -->
                  <table width="780" border="5" cellpadding="5" cellspacing="0" align="center" class="fullPadding">
                    <tbody>
  
                      <tr style="padding: 20px;">
                        <table width="370" cellpadding="0" cellspacing="0" align="left" class="col">
                            <tbody>
                              <tr class="visibleMobile">
                                <td height="40"></td>
                              </tr>
                             
                              <tr>
                                <td width="100%" height="10"></td>
                              </tr>
                              <tr>
                                <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #5b5b5b; line-height: 20px; vertical-align: top; border:1px solid #000;padding: 10px;border-radius: 20px;">
                                  <strong>Notes:</strong>
                                  <br>
                                  <br>
                                  <br>
                                  <br>
                                  <br>
                                </td>
                              </tr>
                            </tbody>
                          </table>
  
                          <table width="195" style="margin-left:10px;" cellpadding="0" cellspacing="0" align="left" class="col">
                            <tbody>
                              <tr class="visibleMobile">
                                <td height="40"></td>
                              </tr>
                             
                              <tr>
                                <td width="100%" height="10"></td>
                              </tr>
                              <tr>
                                <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #5b5b5b; line-height: 20px; vertical-align: top; border:1px solid #000;padding: 10px;border-radius: 10px;">
                                  <strong>Signature client:</strong>
                                  <br>
                                  <br>
                                  <br>
                                  <br>
                                  <br>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table width="195" style="margin-left:10px;" cellpadding="0" cellspacing="0" align="left" class="col">
                            <tbody>
                              <tr class="visibleMobile">
                                <td height="40"></td>
                              </tr>
                             
                              <tr>
                                <td width="100%" height="10"></td>
                              </tr>
                              <tr>
                                <td style="font-size: 14px; font-family: 'Open Sans', sans-serif; color: #5b5b5b; line-height: 20px; vertical-align: top; border:1px solid #000;padding: 10px;border-radius: 10px;">
                                  <strong>Signature et cachet:</strong>
                                  <br>
                                  <br>
                                  <br>
                                  <br>
                                  <br>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        
                        
                        
                      </tr>
                     
                    </tbody>
                  </table>
                  <!-- /Table Total -->
  
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  <!-- /Total -->
  
  <table width="100%" cellpadding="0" cellspacing="0" align="center" class="fullTable" bgcolor="#fff">
  
    <tr>
      <td>
        <table width="900" cellpadding="0" cellspacing="0" align="center" class="fullTable footer" bgcolor="#ffffff" style="border-radius: 0 0 10px 10px;" >
          <tr>
            <td>
              <table width="780" cellpadding="0" cellspacing="0" align="center" class="fullPadding">
                <tbody>
                  <tr>
                        <td class="numberpage" align="right"></td>
                      </tr>
                  <tr>
                    
                    <td style="font-size: 12px; font-family: 'Open Sans', sans-serif; color: #5b5b5b; line-height: 20px; vertical-align: top;border-width:1px ;border-bottom: 0;border-left: 0;border-right: 0;border-color :#000;padding: 10px;border-radius: 10px;text-align: center;">
                                <br/><strong>Matricule Fiscale:</strong> {{ ginfo.matr }}< <strong>Adresse:</strong>{{ ginfo.adresse }} <strong>Email:</strong>{{ ginfo.email }} T: {{ ginfo.tele }}
                                
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          
  <tr >
  <td height="10"></td>
  
  </tr>
        </table>
      </td>
    </tr>
  
  </table>
    
  </template>
  <style type="text/css">
    @import url(https://fonts.googleapis.com/css?family=Open+Sans:400,900);
    body { margin: 0; padding: 0; background: #fff; }
    div, p, a, li, td { -webkit-text-size-adjust: none; }
    .ReadMsgBody { width: 100%; background-color: #ffffff; }
    .ExternalClass { width: 100%; background-color: #ffffff; }
    body { width: 100%; height: 100%; background-color: #fff; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    html { width: 100%; }
    p { padding: 0 !important; margin-top: 0 !important; margin-right: 0 !important; margin-bottom: 0 !important; margin-left: 0 !important; }
    .visibleMobile { display: none; }
    .hiddenMobile { display: block; }
  
    @page {
              margin-top:20px;
              margin: 0; 
              size: auto;           
          }
          
    @media print {
      body {
      counter-reset: page;
      counter-reset:pages;
    }
      .fact tr:nth-child(12n) {
              page-break-after: always;
          }
          .fact tr:last-child {
      page-break-after: auto;
    }
    
        .footer {
                  position: fixed;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  margin:0;
                 
              }
  
      }
    @media only screen and (max-width: 800px) {
    body { width: auto !important; }
    table[class=fullTable] { width: 100% !important; clear: both; }
    table[class=fullPadding] { width: 95% !important; }
    table[class=col] { width: 45% !important; }
    .erase { display: none; }
    }
  
    @media only screen and (max-width: 420px) {
    table[class=fullTable] { width: 100% !important; clear: both; }
    table[class=fullPadding] { width: 95% !important; clear: both; }
    table[class=col] { width: 100% !important; clear: both; }
    table[class=col] td { text-align: left !important; }
    .erase { display: none; font-size: 0; max-height: 0; line-height: 0; padding: 0; }
    .visibleMobile { display: block !important; }
    .hiddenMobile { display: none !important; }
    }
  </style>