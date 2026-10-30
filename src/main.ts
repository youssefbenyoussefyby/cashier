import { createApp } from "vue";
import App from "./App.vue";
import "./assets/style.css"
import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/nora';
import ToastService from 'primevue/toastservice';
import Button from "primevue/button";
import FileUpload from "primevue/fileupload";
import Toolbar from "primevue/toolbar";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import Column from "primevue/column";
import Tag from "primevue/tag";
import DataTable from "primevue/datatable";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import RadioButton from "primevue/radiobutton";
import InputNumber from "primevue/inputnumber";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import AutoComplete from "primevue/autocomplete";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import ScrollPanel from "primevue/scrollpanel";
import Skeleton from "primevue/skeleton";
import Breadcrumb from "primevue/breadcrumb";
import Divider from "primevue/divider";
import ConfirmationService from 'primevue/confirmationservice';
import ConfirmDialog from "primevue/confirmdialog";
import Checkbox from "primevue/checkbox";
import Chart from "primevue/chart";
import MeterGroup from "primevue/metergroup";
import Dropdown from "primevue/dropdown";
const app=createApp(App)
app.use(PrimeVue, {theme: {
    preset: Aura,
    options: {
        prefix: 'p',
        cssLayer: false
    }
}});
app.component("Button",Button);
app.component("FileUpload",FileUpload);
app.component("Toolbar",Toolbar)
app.component("InputIcon",InputIcon);
app.component("InputText",InputText);
app.component("IconField",IconField);
app.component("Column",Column);
app.component("Tag",Tag);
app.component("DataTable",DataTable);
app.component("Textarea",Textarea);
app.component("Select",Select);
app.component("RadioButton",RadioButton);
app.component("InputNumber",InputNumber);
app.component("AutoComplete",AutoComplete)
app.component("Dialog",Dialog);
app.component("Toast",Toast);
app.component("Splitter",Splitter);
app.component("SplitterPanel",SplitterPanel)
app.component("ScrollPanel",ScrollPanel)
app.component("Skeleton",Skeleton);
app.component("Breadcrumb",Breadcrumb)
app.component("Divider",Divider);
app.component("ConfirmDialog",ConfirmDialog)
app.component("Checkbox",Checkbox)
app.component("Chart",Chart)
app.component("MeterGroup",MeterGroup)
app.component("Dropdown",Dropdown)
app.use(ToastService);
app.use(ConfirmationService);
app.mount("#app");
